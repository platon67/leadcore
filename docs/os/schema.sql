-- Leadcore — Outbound & Delivery OS — schéma Postgres
-- Référence : docs/os/05-DONNEES.md
-- Testé sur PostgreSQL 16. Supabase fournit Postgres 15+ : compatible.
--
-- Principes :
--   * Postgres est la source de vérité ; séquenceurs et CRM sont des interfaces.
--   * Tout objet du moteur B porte client_id. Le moteur A est le client « leadcore »
--     (une ligne de client avec engine = 'A'), ce qui évite deux schémas.
--   * Tout changement d'état écrit une ligne dans event (journal append-only).
--   * Les données personnelles sont isolées dans contact / reply / message pour
--     pouvoir être purgées sans casser les agrégats (08-CONFORMITE H6).

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type engine as enum ('A', 'B');
create type client_status as enum ('prospect', 'onboarding', 'active', 'paused', 'churned');
create type email_status as enum ('unverified', 'valid', 'catch_all', 'catch_all_guessed', 'invalid', 'unknown');
create type tier as enum ('A', 'B', 'C', 'D');
create type lead_status as enum ('assigned', 'personalized', 'approved', 'sequenced', 'replied',
                                 'finished', 'stopped', 'suppressed');
create type reply_class as enum ('POSITIVE', 'QUESTION', 'OBJECTION', 'REFERRAL', 'NOT_NOW', 'NEGATIVE',
                                 'UNSUBSCRIBE', 'WRONG_PERSON', 'OOO', 'BOUNCE', 'HOSTILE');
create type meeting_status as enum ('booked', 'held', 'no_show', 'rescheduled', 'client_cancel', 'cancelled');
create type outcome_status as enum ('lost', 'open', 'won');
create type health as enum ('green', 'orange', 'red');
create type mailbox_state as enum ('provisioning', 'warming', 'ramping', 'active', 'resting', 'paused', 'retired');

-- ---------------------------------------------------------------------------
-- Clients et contrats
-- ---------------------------------------------------------------------------

create table client (
    id              uuid primary key default gen_random_uuid(),
    engine          engine not null,
    name            text not null,
    siren           char(9),
    main_domain     citext,
    niche           text,
    status          client_status not null default 'prospect',
    owner_user      text,                      -- campaign manager
    created_at      timestamptz not null default now()
);
-- Le moteur A est représenté par un unique client « Leadcore ».
create unique index client_single_engine_a on client (engine) where engine = 'A';

-- Une nouvelle définition du RDV qualifié = un nouveau contrat (avenant) avec une
-- nouvelle date de début ; l'historique reste lisible.
create table contract (
    id                  uuid primary key default gen_random_uuid(),
    client_id           uuid not null references client(id),
    signed_at           timestamptz not null,
    start_at            date not null,
    initial_months      int not null default 3,
    setup_fee_eur       numeric(10,2) not null,
    retainer_eur        numeric(10,2) not null,
    price_per_meeting   numeric(10,2) not null,
    client_cancel_rate  numeric(3,2) not null default 0.50,  -- annulation côté client facturée 50 %
    billable_cap        int,                                  -- plafond mensuel de RDV facturables, null = aucun
    qualified_meeting_definition text not null,               -- annexe contractuelle, jamais modifiée rétroactivement
    exclusivity         text,                                 -- niche × zone
    data_ownership      text,                                 -- sort des domaines et de la base à la sortie
    signature_ref       text,                                 -- id Yousign
    ended_at            date
);

create table client_config (
    client_id             uuid primary key references client(id),
    weekly_meeting_capacity int,              -- question 13 du questionnaire
    sending_names         jsonb,              -- expéditeurs autorisés
    booking_url           text,
    crm_integration       text,
    timezone              text not null default 'Europe/Paris',
    updated_at            timestamptz not null default now()
);

create table client_brief (
    id          uuid primary key default gen_random_uuid(),
    client_id   uuid not null references client(id),
    answers     jsonb not null,                -- questionnaire B2.2
    call_notes  text,
    created_at  timestamptz not null default now()
);

create table icp_card (
    id          uuid primary key default gen_random_uuid(),
    client_id   uuid not null references client(id),
    version     int not null,
    card        jsonb not null,                -- secteurs NAF, tailles, zones, knock-outs, signaux
    validated_by_client_at timestamptz,
    created_at  timestamptz not null default now(),
    unique (client_id, version)
);

create table persona (
    id          uuid primary key default gen_random_uuid(),
    client_id   uuid not null references client(id),
    code        text not null,                 -- P1, P2…
    titles      text[] not null,
    description jsonb not null,
    unique (client_id, code)
);

create table objection (
    id          uuid primary key default gen_random_uuid(),
    client_id   uuid not null references client(id),
    label       text not null,
    answer      text,
    frequency   int not null default 0
);

-- ---------------------------------------------------------------------------
-- Entreprises, contacts, sourcing
-- ---------------------------------------------------------------------------

create table company (
    id              uuid primary key default gen_random_uuid(),
    siren           char(9) unique,
    domain          citext unique,
    name            text not null,
    naf             text,
    headcount_band  text,                      -- code INSEE (11, 12, 21…)
    revenue_eur     bigint,
    city            text,
    postal_code     text,
    country         char(2) not null default 'FR',
    founded_on      date,
    site_summary    jsonb,                     -- résumé IA du site + date du crawl
    data            jsonb not null default '{}',-- attributs par source : {"field": {"value":…, "source":…, "at":…}}
    updated_at      timestamptz not null default now(),
    check (siren is not null or domain is not null)
);

create table contact (
    id              uuid primary key default gen_random_uuid(),
    company_id      uuid references company(id),
    first_name      text,
    last_name       text,
    title           text,
    function_norm   text,                      -- ceo, head_sales, plant_manager…
    email           citext unique,
    email_status    email_status not null default 'unverified',
    email_source    text,                      -- apollo, fullenrich, dropcontact, guessed
    email_verified_at timestamptz,
    phone_e164      text,
    linkedin_url    text,
    source          text not null,             -- origine de la donnée (08-CONFORMITE : information art. 14)
    informed_at     timestamptz,               -- date de la première information de la personne
    last_interaction_at timestamptz,
    created_at      timestamptz not null default now()
);
create index contact_company on contact (company_id);

create table raw_record (
    id          bigserial primary key,
    source      text not null,
    source_id   text not null,
    payload     jsonb not null,
    status      text not null default 'new',   -- new, merged, incomplete, suppressed
    fetched_at  timestamptz not null default now(),
    unique (source, source_id)
);

create table enrichment_log (
    id          bigserial primary key,
    contact_id  uuid references contact(id) on delete set null,
    company_id  uuid references company(id) on delete set null,
    provider    text not null,
    kind        text not null,                 -- email, phone, financials, verify, crawl
    found       boolean not null,
    cost_eur    numeric(8,4) not null default 0,
    at          timestamptz not null default now()
);

create table signal (
    id          uuid primary key default gen_random_uuid(),
    company_id  uuid not null references company(id),
    type        text not null,                 -- job_sales, new_sales_leader, funding, new_site…
    fact        text not null,                 -- phrase utilisable en personnalisation
    occurred_on date not null,
    source      text not null,
    url         text,
    weight      numeric(4,1) not null,
    freshness_days int not null,
    match_score numeric(3,2),                  -- similarité du rapprochement
    created_at  timestamptz not null default now(),
    unique (company_id, type, occurred_on)
);

create table score_model (
    id          uuid primary key default gen_random_uuid(),
    client_id   uuid not null references client(id),
    version     int not null,
    weights     jsonb not null,
    knockouts   jsonb not null,
    active      boolean not null default false,
    created_at  timestamptz not null default now(),
    unique (client_id, version)
);

-- Score par client : un même compte n'a pas le même intérêt pour deux clients.
create table company_score (
    id              bigserial primary key,
    client_id       uuid not null references client(id),
    company_id      uuid not null references company(id),
    score_model_id  uuid not null references score_model(id),
    score           numeric(5,1) not null,
    tier            tier not null,
    detail          jsonb not null,
    computed_at     timestamptz not null default now()
);
create index company_score_latest on company_score (client_id, company_id, computed_at desc);

-- ---------------------------------------------------------------------------
-- Segments, stratégie, campagnes, tests
-- ---------------------------------------------------------------------------

create table segment (
    id              uuid primary key default gen_random_uuid(),
    client_id       uuid not null references client(id),
    code            text not null,
    definition      jsonb not null,
    estimated_size  int,
    rank            int not null default 1,     -- 1 actif, 2 et 3 préparés (plan de renouvellement)
    status          text not null default 'planned',
    unique (client_id, code)
);

create table segment_query (
    id          uuid primary key default gen_random_uuid(),
    segment_id  uuid not null references segment(id),
    source      text not null,
    query       jsonb not null,
    icp_version int,
    last_run_at timestamptz
);

create table strategy_rule (
    id          uuid primary key default gen_random_uuid(),
    client_id   uuid not null references client(id),
    persona     text,
    signal_type text,
    pain        text not null,
    angle       text not null,
    offer       text not null,
    cta         text not null,
    version     int not null,
    active      boolean not null default true
);

create table campaign (
    id              uuid primary key default gen_random_uuid(),
    client_id       uuid not null references client(id),
    segment_id      uuid not null references segment(id),
    name            text not null unique,
    angle           text not null,
    sequencer       text not null,             -- smartlead, instantly
    external_id     text,
    status          text not null default 'draft',
    brief           jsonb not null,            -- campaign_brief B5.1
    created_at      timestamptz not null default now()
);

create table sequence_step (
    id          uuid primary key default gen_random_uuid(),
    campaign_id uuid not null references campaign(id),
    step        int not null,
    delay_days  int not null,
    variant     text not null default 'A',
    subject     text,
    body        text not null,
    unique (campaign_id, step, variant)
);

create table experiment (
    id          uuid primary key default gen_random_uuid(),
    client_id   uuid not null references client(id),
    campaign_id uuid references campaign(id),
    variable    text not null,                 -- segment, signal, offer, angle, cta, copy…
    hypothesis  text not null,
    control     text not null,
    challenger  text not null,
    traffic_share numeric(3,2) not null default 0.20,
    status      text not null default 'running',-- running, won, lost, inconclusive, stopped
    started_at  timestamptz not null default now(),
    decided_at  timestamptz,
    decision    jsonb
);

create table batch (
    id          uuid primary key default gen_random_uuid(),
    campaign_id uuid not null references campaign(id),
    send_date   date not null,
    size        int not null,
    qa_result   jsonb,
    status      text not null default 'pending' -- pending, blocked, approved, sent
);

-- Un contact dans le contexte d'un client et d'une campagne.
create table lead (
    id              uuid primary key default gen_random_uuid(),
    client_id       uuid not null references client(id),
    contact_id      uuid not null references contact(id),
    campaign_id     uuid not null references campaign(id),
    batch_id        uuid references batch(id),
    variant         text not null default 'A',
    tier            tier not null,
    personalization jsonb,                     -- ligne, niveau N0-N4, sources, modèle
    status          lead_status not null default 'assigned',
    external_id     text,
    created_at      timestamptz not null default now(),
    unique (contact_id, campaign_id)
);
create index lead_client_status on lead (client_id, status);

-- ---------------------------------------------------------------------------
-- Infrastructure d'envoi
-- ---------------------------------------------------------------------------

create table domain (
    id              uuid primary key default gen_random_uuid(),
    client_id       uuid not null references client(id),
    name            citext not null unique,
    registrar       text not null,
    bought_on       date not null,
    renews_on       date,
    dmarc_policy    text not null default 'none',
    status          text not null default 'active', -- active, burned, transferred, expired
    owner           text not null default 'leadcore'
);

create table mailbox (
    id              uuid primary key default gen_random_uuid(),
    domain_id       uuid not null references domain(id),
    address         citext not null unique,
    provider        text not null,             -- google, microsoft
    sender_name     text not null,
    state           mailbox_state not null default 'provisioning',
    daily_limit     int not null default 0,
    warmup_started_on date,
    external_id     text
);

create table mailbox_health (
    id              bigserial primary key,
    mailbox_id      uuid not null references mailbox(id),
    day             date not null,
    sent            int not null default 0,
    bounced         int not null default 0,
    replies         int not null default 0,
    placement_inbox_rate numeric(4,3),
    status          health not null,
    unique (mailbox_id, day)
);

create table domain_health (
    id              bigserial primary key,
    domain_id       uuid not null references domain(id),
    day             date not null,
    gmail_spam_rate numeric(5,4),
    postmaster_compliance text,
    blacklisted     boolean not null default false,
    dmarc_fail      int not null default 0,
    status          health not null,
    unique (domain_id, day)
);

-- ---------------------------------------------------------------------------
-- Messages, réponses, rendez-vous
-- ---------------------------------------------------------------------------

create table message (
    id              uuid primary key default gen_random_uuid(),
    lead_id         uuid not null references lead(id),
    mailbox_id      uuid references mailbox(id),
    step            int not null,
    direction       text not null check (direction in ('out', 'in')),
    external_id     text unique,               -- message-id ou id séquenceur (idempotence)
    sent_at         timestamptz not null,
    bounced         boolean not null default false
);
create index message_lead on message (lead_id);

create table reply (
    id              uuid primary key default gen_random_uuid(),
    message_id      uuid not null unique references message(id),
    lead_id         uuid not null references lead(id),
    body            text,                      -- purgeable (H6)
    class           reply_class not null,
    confidence      numeric(3,2) not null,
    attributes      jsonb not null default '{}',-- date de rappel, personne référée, objection, concurrent
    reviewed_by     text,
    draft           text,
    received_at     timestamptz not null
);

create table opportunity (
    id              uuid primary key default gen_random_uuid(),
    client_id       uuid not null references client(id),
    lead_id         uuid not null references lead(id),
    stage           text not null,
    priority        numeric(5,2),
    owner_user      text,
    lost_reason     text,
    crm_external_id text,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create table meeting (
    id              uuid primary key default gen_random_uuid(),
    opportunity_id  uuid not null references opportunity(id),
    client_id       uuid not null references client(id),
    scheduled_at    timestamptz not null,
    status          meeting_status not null default 'booked',
    qualified       boolean not null,          -- critères du contrat en vigueur à la date du RDV
    contract_id     uuid not null references contract(id),
    reschedule_of   uuid references meeting(id),
    quality_score   int check (quality_score between 1 and 5),  -- retour J+1 du client
    booking_ref     text unique,               -- id Cal
    created_at      timestamptz not null default now()
);

create table meeting_outcome (
    meeting_id      uuid primary key references meeting(id),
    status          outcome_status not null,
    amount_eur      numeric(12,2),
    lost_reason     text,
    reported_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Opérations, conformité, facturation
-- ---------------------------------------------------------------------------

create table task (
    id              uuid primary key default gen_random_uuid(),
    client_id       uuid references client(id),
    opportunity_id  uuid references opportunity(id),
    kind            text not null,
    assignee        text,
    due_at          timestamptz not null,
    done_at         timestamptz
);

-- Suppression globale : tous clients, deux moteurs.
create table suppression (
    id              uuid primary key default gen_random_uuid(),
    scope           text not null check (scope in ('email', 'domain', 'siren')),
    value_hash      text not null,             -- sha256 de la valeur normalisée (survit à l'effacement)
    value_clear     citext,                    -- effacée si demande d'effacement
    reason          text not null,             -- opt_out, hostile, client, former_client, competitor, bounce_domain
    client_id       uuid references client(id),-- null = global
    created_at      timestamptz not null default now(),
    unique (scope, value_hash, client_id)
);

create table event (
    id              bigserial primary key,
    at              timestamptz not null default now(),
    client_id       uuid references client(id),
    entity          text not null,             -- lead, reply, meeting, mailbox…
    entity_id       uuid,
    type            text not null,             -- ingested, scored, sequenced, sent, replied, opt_out, booked…
    data            jsonb not null default '{}',
    actor           text not null default 'system'
);
create index event_entity on event (entity, entity_id);
create index event_client_type_at on event (client_id, type, at);

create table learning (
    id              uuid primary key default gen_random_uuid(),
    niche           text,
    client_id       uuid references client(id),
    statement       text not null,             -- phrase falsifiable (B8.3)
    evidence        jsonb not null,            -- experiment ids, volumes, période
    created_at      timestamptz not null default now()
);

create table capacity_snapshot (
    id              bigserial primary key,
    client_id       uuid not null references client(id),
    day             date not null,
    capacity        numeric(6,1) not null,
    forecast_load   numeric(6,1) not null,
    saturation      numeric(5,2) not null,
    unique (client_id, day)
);

create table client_health (
    id              bigserial primary key,
    client_id       uuid not null references client(id),
    day             date not null,
    score           int not null,
    flags           text[] not null default '{}',
    unique (client_id, day)
);

create table invoice (
    id              uuid primary key default gen_random_uuid(),
    client_id       uuid not null references client(id),
    period          date not null,             -- 1er du mois facturé
    status          text not null default 'draft',
    external_id     text,
    unique (client_id, period)
);

create table invoice_line (
    id              uuid primary key default gen_random_uuid(),
    invoice_id      uuid not null references invoice(id),
    kind            text not null,             -- setup, retainer, meeting, meeting_client_cancel
    meeting_id      uuid references meeting(id),
    amount_eur      numeric(10,2) not null
);

create table ai_call_log (
    id              bigserial primary key,
    workflow        text not null,
    model           text not null,
    input_tokens    int not null,
    output_tokens   int not null,
    cost_usd        numeric(10,5) not null,
    at              timestamptz not null default now()
);

create table workflow_error (
    id              bigserial primary key,
    workflow        text not null,
    node            text,
    message         text not null,
    retryable       boolean not null,
    payload         jsonb,
    resolved_at     timestamptz,
    at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Vues de reporting (une seule définition des métriques, 05-DONNEES E4)
-- ---------------------------------------------------------------------------

create view v_client_funnel_month as
select
    l.client_id,
    date_trunc('month', l.created_at)::date                                  as month,
    count(distinct l.contact_id)                                            as contacts,
    count(m.id) filter (where m.direction = 'out')                          as emails_sent,
    count(m.id) filter (where m.direction = 'out' and m.bounced)            as bounces,
    count(r.id) filter (where r.class not in ('OOO', 'BOUNCE'))             as replies,
    count(r.id) filter (where r.class = 'POSITIVE')                         as positives
from lead l
left join message m on m.lead_id = l.id
left join reply r   on r.message_id = m.id
group by 1, 2;

create view v_client_meetings_month as
select
    mt.client_id,
    date_trunc('month', mt.scheduled_at)::date                              as month,
    count(*)                                                                as booked,
    count(*) filter (where mt.status = 'held')                              as held,
    count(*) filter (where mt.status = 'held' and mt.qualified)             as held_qualified,
    count(*) filter (where mt.status = 'no_show')                           as no_show,
    count(*) filter (where mt.status = 'client_cancel')                     as client_cancel,
    round(avg(mt.quality_score), 2)                                         as avg_quality,
    count(o.meeting_id)                                                     as outcomes_reported,
    count(o.meeting_id) filter (where o.status = 'won')                     as won,
    coalesce(sum(o.amount_eur) filter (where o.status = 'won'), 0)          as won_amount_eur
from meeting mt
left join meeting_outcome o on o.meeting_id = mt.id
group by 1, 2;

-- Lignes facturables d'un mois, selon le contrat en vigueur à la date du RDV.
create view v_billable_meetings as
select
    mt.client_id,
    date_trunc('month', mt.scheduled_at)::date as month,
    mt.id                                      as meeting_id,
    (case mt.status
        when 'held'          then c.price_per_meeting
        when 'client_cancel' then c.price_per_meeting * c.client_cancel_rate
    end)::numeric(10,2)                        as amount_eur
from meeting mt
join contract c on c.id = mt.contract_id
where mt.qualified
  and mt.status in ('held', 'client_cancel');
