# 05 — Architecture des données

Partie de l'[Operating System outbound & delivery](README.md).

Le schéma complet, exécutable, est dans [`schema.sql`](schema.sql) : 41
tables, 3 vues de reporting, testé sur PostgreSQL 16 (création, insertion
d'un parcours complet, vues, contraintes). Ce fichier explique chaque objet.

---

## E1 — Principes

1. **Postgres est la source de vérité.** Séquenceurs, CRM et Clay reçoivent
   des copies. En cas de désaccord, Postgres gagne et LC-011 resynchronise.
2. **Un seul schéma pour les deux moteurs.** Le moteur A est un client
   particulier (`client.engine = 'A'`, une seule ligne autorisée par index
   unique partiel). Les workflows, les vues et les rapports marchent pour A
   comme pour B.
3. **Journal append-only.** Chaque changement d'état écrit un `event`. On
   reconstitue n'importe quel état passé ; on explique n'importe quelle
   décision (« pourquoi ce contact a-t-il été contacté ? »).
4. **Données personnelles isolées et purgeables.** `contact`, `reply.body` et
   `suppression.value_clear` portent les données personnelles ; les
   agrégats (vues, `event`) survivent à leur purge.
5. **Le contrat en vigueur à la date du RDV fait foi.** `meeting.contract_id`
   fige la définition du RDV qualifié et le prix : une modification de contrat
   ne peut pas requalifier le passé.

---

## E2 — Les objets

Légende des fréquences : *temps réel* (webhook), *horaire*, *quotidien*,
*hebdo*, *à l'événement*.

### CLIENT

| | |
|---|---|
| Rôle | Un client de Leadcore (moteur B) ou Leadcore lui-même (moteur A) |
| Identifiant | `id` (uuid) |
| Clé métier | `siren` |
| Champs clés | `engine`, `name`, `main_domain`, `niche`, `status`, `owner_user` |
| Relations | 1-n `contract`, `segment`, `campaign`, `lead`, `domain`, `meeting` ; 1-1 `client_config` |
| Source | LC-013 (signature + paiement) |
| Mise à jour | À l'événement (changement de statut) |

### CONTRACT

| | |
|---|---|
| Rôle | Conditions commerciales et définition contractuelle du RDV qualifié |
| Identifiant | `id` |
| Champs clés | `setup_fee_eur`, `retainer_eur`, `price_per_meeting`, `client_cancel_rate` (0,50), `billable_cap`, `qualified_meeting_definition`, `initial_months` (3), `exclusivity`, `data_ownership` |
| Relations | n-1 `client` ; 1-n `meeting` |
| Source | Yousign (LC-013), avenants |
| Mise à jour | Jamais modifié : un avenant crée un nouveau contrat |

### COMPANY

| | |
|---|---|
| Rôle | Une entreprise, partagée techniquement entre clients (données publiques) |
| Identifiant | `id` |
| Clés métier | `siren` (unique), `domain` (unique) ; au moins l'un des deux |
| Champs clés | `name`, `naf`, `headcount_band` (code INSEE), `revenue_eur`, `postal_code`, `founded_on`, `site_summary`, `data` (valeur + source + date par attribut) |
| Relations | 1-n `contact`, `signal`, `company_score` |
| Source | Sirene, Pappers, Apollo, crawl |
| Mise à jour | Hebdo (sourcing) ; crawl si > 90 jours ; Sirene mensuel |

### CONTACT

| | |
|---|---|
| Rôle | Une personne |
| Identifiant | `id` |
| Clé métier | `email` (unique, insensible à la casse) ; sinon (prénom, nom, domaine) au dédoublonnage |
| Champs clés | `first_name`, `last_name`, `title`, `function_norm`, `email_status`, `email_source`, `email_verified_at`, `phone_e164`, `source`, `informed_at`, `last_interaction_at` |
| Relations | n-1 `company` ; 1-n `lead` |
| Source | Apollo, Sales Navigator (saisie), FullEnrich, Dropcontact |
| Mise à jour | À l'enrichissement ; revérification email si > 90 jours ; purge selon H6 |

`source` et `informed_at` servent la conformité : on doit pouvoir dire à la
personne d'où vient sa donnée et quand on l'a informée (art. 14 RGPD).

### LEAD

| | |
|---|---|
| Rôle | Un contact **dans le contexte d'un client et d'une campagne** |
| Identifiant | `id` |
| Clé métier | (`contact_id`, `campaign_id`) unique |
| Champs clés | `client_id`, `variant`, `tier`, `personalization` (ligne, niveau, sources, modèle), `status`, `external_id` (séquenceur) |
| Relations | n-1 `contact`, `campaign`, `batch` ; 1-n `message` ; 1-n `opportunity` |
| Source | LC-004 |
| Mise à jour | Temps réel (statuts du séquenceur) |

### CAMPAIGN et SEQUENCE (`sequence_step`)

| | |
|---|---|
| Rôle | Segment × angle × séquence, et ses étapes par variante |
| Identifiants | `campaign.id` ; `sequence_step` unique sur (`campaign_id`, `step`, `variant`) |
| Champs clés | `angle`, `sequencer`, `external_id`, `brief` (B5.1) ; étapes : `delay_days`, `subject`, `body` |
| Relations | n-1 `client`, `segment` ; 1-n `lead`, `batch`, `experiment` |
| Source | Campaign manager (brief), LC-007 |
| Mise à jour | À l'événement |

### MESSAGE

| | |
|---|---|
| Rôle | Un email envoyé ou reçu |
| Identifiant | `id` ; `external_id` unique (idempotence des webhooks) |
| Champs clés | `direction` (out/in), `step`, `mailbox_id`, `sent_at`, `bounced` |
| Relations | n-1 `lead`, `mailbox` ; 0-1 `reply` |
| Source | Séquenceur (API en lot pour les envois, webhook pour les réponses et rebonds) |
| Mise à jour | Horaire (envois) ; temps réel (réponses) |

### REPLY

| | |
|---|---|
| Rôle | Une réponse classée |
| Identifiant | `id` ; `message_id` unique |
| Champs clés | `body` (purgeable), `class`, `confidence`, `attributes` (date de rappel, personne référée, objection, concurrent), `reviewed_by`, `draft` |
| Relations | 1-1 `message` ; n-1 `lead` |
| Source | LC-008 |
| Mise à jour | Temps réel ; `reviewed_by` à la revue humaine |

### OPPORTUNITY

| | |
|---|---|
| Rôle | Une conversation commerciale ouverte par une réponse positive |
| Identifiant | `id` ; `crm_external_id` (Attio ou CRM du client) |
| Champs clés | `stage`, `priority`, `owner_user`, `lost_reason` (liste fermée) |
| Relations | n-1 `lead`, `client` ; 1-n `meeting`, `task` |
| Source | LC-009, LC-011 |
| Mise à jour | Temps réel |

### MEETING et MEETING_OUTCOME

| | |
|---|---|
| Rôle | Un rendez-vous et son devenir à J+30 |
| Identifiants | `meeting.id`, `booking_ref` (Cal) unique ; `meeting_outcome.meeting_id` |
| Champs clés | `scheduled_at`, `status` (booked, held, no_show, rescheduled, client_cancel, cancelled), `qualified`, `contract_id`, `reschedule_of`, `quality_score` (J+1) ; outcome : `status` (lost/open/won), `amount_eur`, `lost_reason` |
| Relations | n-1 `opportunity`, `client`, `contract` |
| Source | Cal (LC-010), LC-018, formulaire client J+1 et J+30 (LC-025) |
| Mise à jour | Temps réel ; J+1 ; J+30 |

### DOMAIN et MAILBOX

| | |
|---|---|
| Rôle | Infrastructure d'envoi |
| Identifiants | `domain.name` unique ; `mailbox.address` unique |
| Champs clés | domaine : `registrar`, `bought_on`, `renews_on`, `dmarc_policy`, `status`, `owner` ; boîte : `provider`, `sender_name`, `state`, `daily_limit`, `warmup_started_on` |
| Relations | domaine n-1 `client` ; boîte n-1 `domain` ; 1-n `message`, `mailbox_health` |
| Source | LC-029 |
| Mise à jour | État : quotidien (LC-017) ; santé : `mailbox_health` / `domain_health` quotidien |

### SIGNAL

| | |
|---|---|
| Rôle | Un fait daté qui augmente la probabilité d'un besoin |
| Identifiant | `id` ; unique sur (`company_id`, `type`, `occurred_on`) |
| Champs clés | `type`, `fact` (phrase utilisable), `occurred_on`, `source`, `url`, `weight`, `freshness_days`, `match_score` |
| Relations | n-1 `company` |
| Source | LC-016 |
| Mise à jour | Quotidien |

### TASK

| | |
|---|---|
| Rôle | Une action humaine attendue, avec échéance |
| Identifiant | `id` |
| Champs clés | `kind`, `assignee`, `due_at`, `done_at` |
| Relations | n-1 `client`, `opportunity` |
| Source | LC-009, LC-011, LC-022 |
| Mise à jour | Temps réel |

### SUPPRESSION

| | |
|---|---|
| Rôle | Tout ce qui ne doit pas être contacté |
| Identifiant | `id` ; unique sur (`scope`, `value_hash`, `client_id`) |
| Champs clés | `scope` (email, domain, siren), `value_hash` (sha256, survit à l'effacement), `value_clear`, `reason`, `client_id` (null = global) |
| Relations | Optionnelle vers `client` |
| Source | LC-023, LC-013 (clients), onboarding (exclusions client) |
| Mise à jour | Temps réel |

Les oppositions (`opt_out`, `hostile`) sont toujours **globales** : une
personne qui s'oppose ne reçoit plus rien de Leadcore, quel que soit le
client. Les exclusions commerciales (clients du client, concurrents) sont
propres à un client.

### EVENT

| | |
|---|---|
| Rôle | Journal de tout changement d'état |
| Identifiant | `id` (bigserial) |
| Champs clés | `at`, `client_id`, `entity`, `entity_id`, `type`, `data`, `actor` |
| Source | Tous les workflows |
| Mise à jour | Append-only, jamais modifié |

### Autres objets

| Objet | Rôle | Source | Fréquence |
|---|---|---|---|
| `client_config` | Capacité hebdo du client, expéditeurs, agenda, CRM | Onboarding | À l'événement |
| `client_brief` | Réponses au questionnaire, notes d'appel | LC-014 | Une fois + mises à jour |
| `icp_card` | Carte ICP versionnée, validée par le client | Campaign manager | À chaque révision |
| `persona`, `objection` | Personas et bibliothèque d'objections du client | Onboarding, LC-008 (fréquences) | Mensuel |
| `raw_record` | Ligne brute d'une source, pour audit et rejouabilité | LC-001 | Hebdo |
| `enrichment_log` | Chaque appel d'enrichissement, son résultat et son coût | LC-002 | À l'appel |
| `score_model`, `company_score` | Modèle de score versionné et scores historisés, par client | LC-003 | À chaque recalcul |
| `segment`, `segment_query` | Segments (rang 1 actif, 2-3 préparés) et requêtes sources | LC-015 | Mensuel |
| `strategy_rule` | Matrice A5 versionnée | Campaign manager | À la revue |
| `experiment`, `learning` | Tests B9 et apprentissages B8 | LC-020 | Hebdo |
| `batch` | Lot journalier et résultat QA | LC-004, LC-006 | Quotidien |
| `capacity_snapshot`, `client_health` | Pilotage A13 et B11 | LC-021, LC-022 | Quotidien |
| `invoice`, `invoice_line` | Facturation mensuelle | LC-026 | Mensuel |
| `ai_call_log` | Coût IA par workflow | Tous | À l'appel |
| `workflow_error` | Erreurs et reprises | LC-028 | À l'erreur |

---

## E3 — Modèle relationnel

```
                                   ┌──────────┐
                                   │ CONTRACT │
                                   └────┬─────┘
                                        │ n-1
 ┌───────────────┐   1-n   ┌────────────┴───┐   1-n   ┌─────────┐   1-n   ┌─────────┐
 │ client_config ├─────────┤     CLIENT     ├─────────┤ SEGMENT ├─────────┤CAMPAIGN │
 └───────────────┘   1-1   └──┬───┬─────┬───┘         └─────────┘         └────┬────┘
                              │   │     │ 1-n                                  │ 1-n
                     1-n ┌────┘   │     └──────────┐                           │
                   ┌─────┴──┐     │            ┌───┴────┐        n-1  ┌────────┴──┐
                   │ DOMAIN │     │            │  LEAD  ├─────────────┤  CONTACT  │
                   └───┬────┘     │            └───┬────┘             └─────┬─────┘
                       │ 1-n      │                │ 1-n                    │ n-1
                   ┌───┴─────┐    │            ┌───┴─────┐   0-1    ┌──────┴──────┐  1-n  ┌────────┐
                   │ MAILBOX ├────┼───────────►│ MESSAGE ├──────────┤    REPLY    │       │ SIGNAL │
                   └─────────┘    │            └─────────┘          └─────────────┘       └───┬────┘
                                  │                                                          │ n-1
                                  │ 1-n        ┌─────────────┐ 1-n ┌─────────┐ 1-1 ┌───────┴───────┐
                                  └───────────►│ OPPORTUNITY ├────►│ MEETING ├────►│MEETING_OUTCOME│
                                               └──────┬──────┘     └─────────┘     └───────────────┘
                                                      │ 1-n                  COMPANY ◄── contact, signal,
                                                   ┌──┴───┐                             company_score
                                                   │ TASK │
                                                   └──────┘
      SUPPRESSION (global ou par client)       EVENT (journal de tout)       LEARNING (par niche)
```

---

## E4 — Définitions des métriques

Une métrique = une définition = une vue SQL. Les rapports clients, le
dashboard et le simulateur utilisent les mêmes définitions.

| Métrique | Définition exacte | Vue / source |
|---|---|---|
| Contacts | Contacts uniques entrés en séquence dans le mois (date de création du lead) | `v_client_funnel_month.contacts` |
| Emails envoyés | Messages `out` | idem |
| Bounce rate | Messages `out` rebondis / messages `out` | idem |
| Réponses | Réponses hors `OOO` et `BOUNCE` | idem |
| Taux de réponse | Réponses / contacts (par contact, pas par email) | idem |
| Réponses positives | Classe `POSITIVE` | idem |
| Taux de positif | Positives / contacts | idem |
| RDV bookés | Meetings créés dans le mois, par date prévue | `v_client_meetings_month.booked` |
| RDV honorés | Statut `held` | `.held` |
| RDV qualifiés honorés | `held` et `qualified` | `.held_qualified` |
| Show rate | `held` / (`held` + `no_show`) | calcul |
| RDV facturables | `held` + `qualified` au prix du contrat ; `client_cancel` + `qualified` à 50 % | `v_billable_meetings` |
| Taux de retour J+30 | `outcomes_reported` / `held` des mois échus | `v_client_meetings_month` |
| CA signé | Somme `amount_eur` des outcomes `won` | `.won_amount_eur` |
| Coût par RDV honoré | Coûts directs du mois (simulateur ou compta) / `held` | 06-ECONOMIE |
| Coût par client signé (côté client) | Facture Leadcore cumulée / nombre de `won` | Rapport mensuel |

Attention au décalage : les contacts d'un mois produisent des réponses sur
le mois suivant (touches 3 et 4). Le rapport mensuel présente les taux par
**cohorte de contacts** (mois d'entrée), pas par mois calendaire de réponse.

---

## E5 — Règles de qualité des données

| Règle | Contrôle | Seuil | Action |
|---|---|---|---|
| Doublons de contacts | Même email ou (prénom, nom, domaine) | < 1 % | Fusion (LC-001.a) |
| Emails non vérifiés en séquence | `email_status = 'unverified'` et lead `sequenced` | 0 | Porte Q5 |
| Vérification périmée | `email_verified_at` > 90 jours au moment du lot | 0 | Revérification |
| Comptes sans SIREN (FR) | `country = 'FR'` et `siren` null | < 10 % | Rapprochement Sirene |
| Titre non normalisé | `function_norm` null | < 5 % | Table + IA |
| Signal sans source | `url` et `source` vides | 0 | Rejet |
| Personnalisation sans source | `personalization.sources` vide | 0 | Porte Q2 |
| Réponse non classée | `reply` absente pour un message `in` > 10 min | 0 | Alerte LC-028 |
| RDV sans statut à J+2 | `status = 'booked'` et date passée de 2 jours | 0 | Tâche LC-018 |

---

## E6 — Volumétrie

| Table | 1 client / mois | 25 clients / an | 100 clients / an |
|---|---:|---:|---:|
| contact | ~1 900 | ~570 000 | ~2 300 000 |
| lead | ~1 900 | ~570 000 | ~2 300 000 |
| message | ~7 700 | ~2 300 000 | ~9 200 000 |
| reply | ~120 | ~36 000 | ~144 000 |
| meeting | ~16 | ~4 800 | ~19 000 |
| event | ~25 000 | ~7 500 000 | ~30 000 000 |

À 100 clients, `event` et `message` dépassent quelques dizaines de millions
de lignes par an : partitionner `event` par mois (partitionnement natif
Postgres) au palier SCALE, et archiver les partitions de plus de 24 mois.
