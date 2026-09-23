#!/usr/bin/env python3
"""Simulateur de l'Operating System outbound de Leadcore.

Un seul modèle pour tous les chiffres de docs/os/ : volumes, infrastructure,
charge humaine, coûts et marge, pour le moteur B (delivery client) et le moteur
A (acquisition des clients de Leadcore), à 1, 5, 10, 25, 50 et 100 clients.

Aucune dépendance : Python 3.9+, bibliothèque standard.

    python3 tools/simulateur_os.py                      # tout, scénarios par défaut
    python3 tools/simulateur_os.py --section client     # un client, 4 scénarios
    python3 tools/simulateur_os.py --section scale      # 1 → 100 clients
    python3 tools/simulateur_os.py --section acquisition
    python3 tools/simulateur_os.py --objectif 20        # volumes pour 20 RDV honorés
    python3 tools/simulateur_os.py --set positive_rate=0.01 --set show_rate=0.7

Les paramètres sont des hypothèses, pas des mesures. Chaque valeur par défaut
est justifiée dans docs/os/06-ECONOMIE.md. Remplacer par les chiffres réels dès
que le CRM en produit : c'est l'usage prévu de --set.
"""

import argparse
import math
from copy import deepcopy

USD_EUR = 0.90  # conversion prudente ; les outils facturent en dollars

# ---------------------------------------------------------------------------
# Moteur B — paramètres par client et par mois
# ---------------------------------------------------------------------------

BASE_CLIENT = {
    # Production
    "contacts_per_month": 1900,     # contacts uniques nouveaux entrant en séquence
    "touches": 4,                   # emails par contact
    "sends_per_mailbox_day": 30,    # plafond par boîte, en dessous des 35 du doc de référence
    "working_days": 21,
    "mailbox_reserve": 0.25,        # boîtes en chauffe / au repos / de remplacement
    "mailboxes_per_domain": 3,
    # Entonnoir (par contact unique)
    "reply_rate": 0.063,            # toutes réponses, auto-réponses exclues
    "positive_rate": 0.015,         # réponses positives / contacts
    "booked_per_positive": 0.55,
    "show_rate": 0.75,
    # Données (en euros)
    "sourcing_yield": 0.60,         # part des contacts bruts qui finissent envoyables
    "cost_source_raw": 0.02,        # base B2B / scraping, par contact brut
    "cost_enrich_final": 0.06,      # waterfall email, par contact final
    "cost_verify_raw": 0.004,       # vérification, par email testé
    "cost_ai_final": 0.01,          # personnalisation + scoring IA, par contact final
    "cost_ai_reply": 0.003,         # classification + brouillon, par réponse
    # Infrastructure (en euros)
    "mailbox_month": 6.90,          # Google Workspace Business Starter, HT
    "domain_year": 12.0,
    # Main-d'œuvre
    "hourly_cost": 28.0,            # coût complet d'un opérateur, €/h
    "min_per_reply": 4,
    "min_per_positive": 15,         # qualification + booking
    "min_per_booked": 10,           # confirmation, passation, suivi no-show
    "fixed_hours": 13,              # revue hebdo, reporting, listes, copy, tests
    # Recette
    "setup_fee": 1200,
    "retainer": 500,
    "price_per_meeting": 200,
    "billable_cap": None,           # plafond mensuel de RDV facturés, None = aucun
    "setup_amortization_months": 6, # durée de vie moyenne supposée
}

CLIENT_SCENARIOS = {
    "LOW COST": {
        "positive_rate": 0.010, "reply_rate": 0.05, "booked_per_positive": 0.50,
        "show_rate": 0.70, "sourcing_yield": 0.55, "cost_enrich_final": 0.04,
        "cost_ai_final": 0.002, "mailbox_month": 3.0 * USD_EUR,  # Mailforge
        "fixed_hours": 12,
    },
    "BASE": {},
    "HIGH PERFORMANCE": {
        "contacts_per_month": 2500, "positive_rate": 0.025, "reply_rate": 0.08,
        "booked_per_positive": 0.60, "show_rate": 0.85, "sourcing_yield": 0.65,
        "cost_source_raw": 0.04, "cost_enrich_final": 0.10,
        "cost_ai_final": 0.04, "fixed_hours": 16,
    },
    "SCALE": {
        "contacts_per_month": 2500, "positive_rate": 0.018,
        "booked_per_positive": 0.58, "show_rate": 0.80,
        "cost_enrich_final": 0.05, "cost_ai_final": 0.015,
        "min_per_reply": 1.5, "min_per_positive": 12, "min_per_booked": 5,
        "fixed_hours": 7,
        "setup_fee": 1500, "retainer": 1500, "price_per_meeting": 150,
    },
}


def params(scenario="BASE", overrides=None):
    p = deepcopy(BASE_CLIENT)
    p.update(CLIENT_SCENARIOS[scenario])
    if overrides:
        p.update(overrides)
    return p


def client_month(p, shared_tools_per_client=0.0):
    """Un client, un mois de production stable (infrastructure chaude)."""
    c = p["contacts_per_month"]
    emails = c * p["touches"]
    replies = c * p["reply_rate"]
    positives = c * p["positive_rate"]
    booked = positives * p["booked_per_positive"]
    honored = booked * p["show_rate"]

    active_mb = math.ceil(emails / (p["sends_per_mailbox_day"] * p["working_days"]))
    mailboxes = math.ceil(active_mb * (1 + p["mailbox_reserve"]))
    domains = math.ceil(mailboxes / p["mailboxes_per_domain"])

    raw = c / p["sourcing_yield"]
    data = raw * p["cost_source_raw"] + c * p["cost_enrich_final"] + raw * p["cost_verify_raw"]
    ai = c * p["cost_ai_final"] + replies * p["cost_ai_reply"]
    infra = mailboxes * p["mailbox_month"] + domains * p["domain_year"] / 12
    hours = (replies * p["min_per_reply"] + positives * p["min_per_positive"]
             + booked * p["min_per_booked"]) / 60 + p["fixed_hours"]
    labor = hours * p["hourly_cost"]
    direct = data + ai + infra + labor + shared_tools_per_client

    billed = honored if p["billable_cap"] is None else min(honored, p["billable_cap"])
    revenue = (p["retainer"] + billed * p["price_per_meeting"]
               + p["setup_fee"] / p["setup_amortization_months"])
    return {
        "contacts": c, "raw": raw, "emails": emails, "replies": replies,
        "positives": positives, "booked": booked, "honored": honored,
        "active_mb": active_mb, "mailboxes": mailboxes, "domains": domains,
        "data": data, "ai": ai, "infra": infra, "tools": shared_tools_per_client,
        "hours": hours, "labor": labor, "direct": direct, "revenue": revenue,
        "margin": revenue - direct,
        "margin_pct": (revenue - direct) / revenue if revenue else 0,
        "cost_per_contact": direct / c,
        "cost_per_email": direct / emails,
        "cost_per_honored": direct / honored if honored else float("inf"),
    }


def contacts_for(target_honored, p):
    per_contact = p["positive_rate"] * p["booked_per_positive"] * p["show_rate"]
    return target_honored / per_contact


# ---------------------------------------------------------------------------
# Pile d'outils partagée, par palier (euros / mois, HT)
# ---------------------------------------------------------------------------
# Coûts fixes du moteur B hors boîtes et données, qui ne croissent pas avec
# chaque client. Détail et justification : docs/os/03-STACK.md.

def tool_tier(n, emails_per_client=7600):
    """Palier d'outils et coût mensuel partagé du moteur B, pour n clients.

    Le séquenceur est choisi sur le volume d'emails, pas sur le nombre de
    clients : Smartlead Pro couvre 90 000 emails/mois, Unlimited 150 000,
    Prime 500 000 (tarifs publics, septembre 2026).
    """
    emails = n * emails_per_client
    if n <= 5 and emails <= 90_000:
        # Smartlead Pro, vérification, Supabase Pro ; VPS n8n ; Attio Free
        return "ULTRA LEAN", (94 + 49 + 25) * USD_EUR + 20
    if emails <= 150_000:
        # Smartlead Unlimited, Clay Launch, vérification, Supabase ;
        # VPS ; Attio Plus 3 sièges ; tests de placement
        return "STANDARD", (174 + 185 + 49 + 25) * USD_EUR + 40 + 3 * 27 + 60
    primes = math.ceil(emails / 500_000)
    # Smartlead Prime × k, Clay Growth, vérification, Supabase Team ;
    # infra ; Attio 8 sièges ; monitoring et tests de placement
    return "SCALE", (379 * primes + 495 + 99 + 99) * USD_EUR + 120 + 8 * 27 + 250


PRODUCTIVE_HOURS_FTE = 130  # heures productives / mois par ETP


def scale_row(n, scenario):
    p = params(scenario)
    tier, tools = tool_tier(n, p["contacts_per_month"] * p["touches"])
    r = client_month(p, tools / n)
    ops_fte = r["hours"] * n / PRODUCTIVE_HOURS_FTE
    # Encadrement : un responsable delivery pour 6 opérateurs, au-delà de 10 clients
    leads = math.ceil(ops_fte / 6) if n > 10 else 0
    lead_cost = leads * 4500
    return {
        "n": n, "tier": tier, "tools_total": tools, "r": r, "ops_fte": ops_fte,
        "leads": leads, "lead_cost": lead_cost,
        "margin_total": r["margin"] * n - lead_cost,
        "clients_per_operator": PRODUCTIVE_HOURS_FTE / r["hours"],
    }


# ---------------------------------------------------------------------------
# Moteur A — acquisition des clients de Leadcore
# ---------------------------------------------------------------------------

BASE_ACQ = {
    "new_clients_per_month": 4,
    "positive_rate": 0.012,
    "reply_rate": 0.05,
    "booked_per_positive": 0.60,
    "show_rate": 0.75,
    "close_rate": 0.22,              # clients signés / RDV tenus
    "touches": 4,
    "sends_per_mailbox_day": 30,
    "working_days": 21,
    "mailbox_reserve": 0.25,
    "mailboxes_per_domain": 3,
    "cost_per_contact_all_in": 0.12, # données + enrichissement + vérif + IA
    "mailbox_month": 6.90,
    "domain_year": 12.0,
    "setter_hourly": 28.0,
    "min_per_reply": 4,
    "min_per_positive": 15,
    "closer_hours_per_held": 2.0,    # préparation + appel + CRM + relances
    "closer_hourly": 45.0,
    "commission_per_client": 400.0,  # hypothèse, sujet ouvert (MAJ-OFFRE §5)
    "closer_capacity_held": 50,      # RDV tenus / mois / closer à plein temps
    "tools_month": 250.0,            # séquenceur A, CRM, n8n, Sales Nav
}


def acquisition(p):
    held = p["new_clients_per_month"] / p["close_rate"]
    booked = held / p["show_rate"]
    positives = booked / p["booked_per_positive"]
    contacts = positives / p["positive_rate"]
    emails = contacts * p["touches"]
    replies = contacts * p["reply_rate"]
    active_mb = math.ceil(emails / (p["sends_per_mailbox_day"] * p["working_days"]))
    mailboxes = math.ceil(active_mb * (1 + p["mailbox_reserve"]))
    domains = math.ceil(mailboxes / p["mailboxes_per_domain"])
    setter_h = (replies * p["min_per_reply"] + positives * p["min_per_positive"]) / 60
    closer_h = held * p["closer_hours_per_held"]
    cost = (contacts * p["cost_per_contact_all_in"]
            + mailboxes * p["mailbox_month"] + domains * p["domain_year"] / 12
            + setter_h * p["setter_hourly"] + closer_h * p["closer_hourly"]
            + p["new_clients_per_month"] * p["commission_per_client"]
            + p["tools_month"])
    return {
        "contacts": contacts, "emails": emails, "replies": replies,
        "positives": positives, "booked": booked, "held": held,
        "mailboxes": mailboxes, "domains": domains,
        "leads_per_day": contacts / p["working_days"],
        "meetings_per_week": booked / 4.33, "closings_per_week": p["new_clients_per_month"] / 4.33,
        "setter_h": setter_h, "closer_h": closer_h,
        "closers_needed": held / p["closer_capacity_held"],
        "cost": cost, "cac": cost / p["new_clients_per_month"],
    }


def ramp(target_clients, months, churn):
    """Nouveaux clients à signer par mois pour atteindre la cible."""
    # croissance linéaire du parc + remplacement du churn sur le parc moyen
    growth = target_clients / months
    avg_park = target_clients / 2
    return growth + churn * avg_park


# ---------------------------------------------------------------------------
# Affichage
# ---------------------------------------------------------------------------

def eur(x):
    return f"{x:,.0f} €".replace(",", " ")


def num(x, d=0):
    return f"{x:,.{d}f}".replace(",", " ")


def print_client(overrides):
    names = list(CLIENT_SCENARIOS)
    rows = {s: client_month(params(s, overrides), tool_tier(10)[1] / 10) for s in names}
    print("## Moteur B — un client, un mois (outils partagés au palier 10 clients)\n")
    print("| Poste | " + " | ".join(names) + " |")
    print("|---|" + "---:|" * len(names))
    lines = [
        ("Contacts uniques", "contacts", num), ("Contacts bruts sourcés", "raw", num),
        ("Emails envoyés", "emails", num), ("Réponses", "replies", num),
        ("Réponses positives", "positives", lambda x: num(x, 1)),
        ("RDV bookés", "booked", lambda x: num(x, 1)),
        ("RDV honorés", "honored", lambda x: num(x, 1)),
        ("Boîtes actives", "active_mb", num), ("Boîtes provisionnées", "mailboxes", num),
        ("Domaines", "domains", num),
        ("Données (sourcing, enrichissement, vérif.)", "data", eur), ("IA", "ai", eur),
        ("Boîtes et domaines", "infra", eur), ("Outils partagés (quote-part)", "tools", eur),
        ("Heures opérateur", "hours", lambda x: num(x, 1)), ("Main-d'œuvre", "labor", eur),
        ("**Coûts directs**", "direct", eur), ("**Recette** (setup lissé inclus)", "revenue", eur),
        ("**Marge brute**", "margin", eur),
        ("Marge brute %", "margin_pct", lambda x: f"{x*100:.0f} %"),
        ("Coût par contact", "cost_per_contact", lambda x: f"{x:.2f} €"),
        ("Coût par email", "cost_per_email", lambda x: f"{x:.3f} €"),
        ("Coût par RDV honoré", "cost_per_honored", eur),
    ]
    for label, key, fmt in lines:
        print(f"| {label} | " + " | ".join(fmt(rows[s][key]) for s in names) + " |")
    print()


def print_scale(scenario):
    print(f"## Moteur B — montée en charge, scénario {scenario}\n")
    print("| Clients | Palier outils | Outils/mois | Boîtes | Domaines | Contacts/mois "
          "| Emails/mois | Réponses/mois | RDV honorés/mois | ETP opérateurs | Clients/opérateur "
          "| Encadrants | Coût direct/client | Marge brute totale |")
    print("|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|")
    for n in (1, 5, 10, 25, 50, 100):
        s = scale_row(n, scenario)
        r = s["r"]
        print(f"| {n} | {s['tier']} | {eur(s['tools_total'])} | {num(r['mailboxes']*n)} "
              f"| {num(r['domains']*n)} | {num(r['contacts']*n)} | {num(r['emails']*n)} "
              f"| {num(r['replies']*n)} | {num(r['honored']*n)} | {num(s['ops_fte'], 1)} "
              f"| {num(s['clients_per_operator'], 1)} | {s['leads']} | {eur(r['direct'])} "
              f"| {eur(s['margin_total'])} |")
    print()


def print_acquisition(overrides):
    print("## Moteur A — acquisition, par rythme de signature\n")
    print("| Nouveaux clients/mois | Contacts/mois | Leads/jour | Emails/mois | Boîtes | Domaines "
          "| Réponses | Positives | RDV bookés/sem. | RDV tenus/mois | Signatures/sem. "
          "| Heures setter | Heures closer | Closers (ETP) | Coût total | CAC |")
    print("|---:|" + "---:|" * 15)
    for k in (2, 4, 8, 12, 20):
        p = deepcopy(BASE_ACQ)
        p.update(overrides or {})
        p["new_clients_per_month"] = k
        a = acquisition(p)
        print(f"| {k} | {num(a['contacts'])} | {num(a['leads_per_day'])} | {num(a['emails'])} "
              f"| {a['mailboxes']} | {a['domains']} | {num(a['replies'])} | {num(a['positives'])} "
              f"| {num(a['meetings_per_week'], 1)} | {num(a['held'], 1)} "
              f"| {num(a['closings_per_week'], 1)} | {num(a['setter_h'])} | {num(a['closer_h'])} "
              f"| {num(a['closers_needed'], 1)} | {eur(a['cost'])} | {eur(a['cac'])} |")
    print()
    print("### Rythme de signature nécessaire pour atteindre un parc de clients\n")
    print("| Parc cible | En 6 mois, churn 5 %/mois | En 12 mois, churn 5 %/mois "
          "| En 12 mois, churn 10 %/mois |")
    print("|---:|---:|---:|---:|")
    for n in (5, 10, 25, 50, 100):
        print(f"| {n} | {num(ramp(n, 6, 0.05), 1)} | {num(ramp(n, 12, 0.05), 1)} "
              f"| {num(ramp(n, 12, 0.10), 1)} |")
    print()


def print_objectif(target, overrides):
    p = params("BASE", overrides)
    c = contacts_for(target, p)
    p["contacts_per_month"] = c
    r = client_month(p)
    print(f"## Objectif : {target} RDV honorés / mois (entonnoir BASE)\n")
    print(f"- contacts uniques : {num(c)} (bruts à sourcer : {num(r['raw'])})")
    print(f"- emails : {num(r['emails'])} ; boîtes actives : {r['active_mb']} ; "
          f"provisionnées : {r['mailboxes']} ; domaines : {r['domains']}")
    print(f"- réponses à traiter : {num(r['replies'])} ; positives : {num(r['positives'], 1)} ; "
          f"bookés : {num(r['booked'], 1)}")
    print(f"- heures opérateur : {num(r['hours'], 1)}\n")


def parse_set(values):
    out = {}
    for v in values or []:
        k, _, raw = v.partition("=")
        if k not in BASE_CLIENT and k not in BASE_ACQ:
            raise SystemExit(f"paramètre inconnu : {k}")
        out[k] = None if raw == "None" else float(raw)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--section", choices=["client", "scale", "acquisition", "all"], default="all")
    ap.add_argument("--scenario", default="BASE", choices=list(CLIENT_SCENARIOS))
    ap.add_argument("--objectif", type=float, help="RDV honorés visés par client et par mois")
    ap.add_argument("--set", action="append", help="clé=valeur, remplace une hypothèse")
    a = ap.parse_args()
    ov = parse_set(a.set)
    client_ov = {k: v for k, v in ov.items() if k in BASE_CLIENT}
    acq_ov = {k: v for k, v in ov.items() if k in BASE_ACQ}
    if client_ov:
        for s in CLIENT_SCENARIOS:
            CLIENT_SCENARIOS[s] = {**CLIENT_SCENARIOS[s], **client_ov}
    if a.objectif:
        print_objectif(a.objectif, client_ov)
        return
    if a.section in ("client", "all"):
        print_client(client_ov)
    if a.section in ("scale", "all"):
        print_scale(a.scenario)
        if a.section == "all":
            print_scale("SCALE")
    if a.section in ("acquisition", "all"):
        print_acquisition(acq_ov)


if __name__ == "__main__":
    main()
