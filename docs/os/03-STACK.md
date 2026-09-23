# 03 — Stack technique finale

Partie de l'[Operating System outbound & delivery](README.md).

La stack découle des objectifs et des constats de
[00-RECHERCHE](00-RECHERCHE.md), pas l'inverse. Trois principes l'ont
façonnée :

1. **Postgres est la source de vérité.** Les outils SaaS (séquenceur, CRM,
   Clay) sont des interfaces ou des moteurs d'exécution, remplaçables. Si on
   change de séquenceur, on ne perd ni l'historique, ni les scores, ni les
   apprentissages.
2. **Le coût doit dépendre du volume, pas du nombre de clients.** D'où
   Smartlead pour le moteur B (facturé au volume d'emails) plutôt qu'un outil
   facturé par workspace client.
3. **Un outil par fonction**, conformément au document de référence (§8).

Tarifs : voir le statut de vérification de chaque tarif en 00-RECHERCHE §2.
Conversion utilisée : 1 $ ≈ 0,90 €. HT.

```
                              ARCHITECTURE CIBLE

   Sources                     Cœur                               Exécution / interfaces
 ┌──────────────┐        ┌──────────────────────┐            ┌─────────────────────────┐
 │ Sirene API   │        │                      │   API      │ Smartlead (moteur B)    │
 │ Pappers      │──┐     │   n8n (auto-hébergé) │◄──────────►│ Instantly (moteur A)    │
 │ Apollo       │  │     │   workflows LC-0xx   │  webhooks  └─────────────────────────┘
 │ France Travail│ ├────►│                      │            ┌─────────────────────────┐
 │ TheirStack   │  │     └─────────┬────────────┘            │ Attio (pipeline A,      │
 │ FullEnrich   │  │               │                         │  vue opérationnelle)    │
 │ MillionVerif.│──┘               ▼                         └─────────────────────────┘
 └──────────────┘        ┌──────────────────────┐            ┌─────────────────────────┐
                         │ Postgres (Supabase)  │───────────►│ Metabase / dashboards   │
 ┌──────────────┐        │ source de vérité     │            │ rapports clients        │
 │ Claude API   │◄──────►│ (05-DONNEES)         │            └─────────────────────────┘
 │ Haiku/Sonnet │        └──────────────────────┘            ┌─────────────────────────┐
 └──────────────┘                                            │ Cal (booking), Yousign, │
                                                             │ Stripe, SMS, Slack      │
                                                             └─────────────────────────┘
   Boîtes : Google Workspace (70 %) + Microsoft 365 (30 %), tenants séparés A / B
   DNS : Cloudflare · Monitoring : Postmaster Tools v2, SNDS, tests de placement, blacklists
```

---

## C1 — Tableau de référence

| Fonction | Outil retenu | Alternative | Pourquoi | Coût | À partir de quel volume changer |
|---|---|---|---|---|---|
| Comptes France | **API Recherche d'entreprises / Sirene** | Pappers (payant), Pharow | Gratuit, exhaustif, officiel | 0 € | Jamais pour les comptes FR ; ajouter Pappers pour les données financières |
| Données financières, dirigeants | **Pappers API** | Société.com, Infogreffe | Registres légaux, API simple | ~20-50 €/mois | Au-delà de ~5 000 comptes enrichis/mois, négocier un forfait |
| Contacts nominatifs | **Apollo** Basic → Professional | Sales Navigator + enrichissement, Lusha, Kaspr | Meilleur rapport couverture/prix, API | 49-99 $/siège/mois | Si la couverture de la niche < 40 % des comptes : Sales Nav + waterfall en principal |
| Listes manuelles comptes A | **Sales Navigator Core** | Apollo seul | Meilleure donnée sur les personnes et leurs changements de poste | ~91-121 €/mois/siège | Un siège par setter au palier SCALE |
| Signaux de recrutement | **API France Travail** (+ TheirStack) | Scraping d'Indeed/Welcome (non retenu : CGU) | Gratuit, officiel, rapproché du SIRET | 0 € (+ 59-169 $/mois TheirStack) | TheirStack quand les offres des sites carrières manquent (tech, startups) |
| Enrichissement email | **FullEnrich** (waterfall) + **Dropcontact** (Europe) | Clay waterfall, Apollo seul | Ne facture que les emails trouvés ; 20+ sources | ~29-55 $/mois au départ, ~0,05-0,06 €/email à l'échelle | Au palier SCALE, négocier le volume ou passer par Clay si déjà utilisé |
| Prototypage d'enrichissement / scoring | **Clay** (Launch) | n8n directement | Itération en heures, pas en jours | 185 $/mois | Supprimer si l'équipe n'y prototype plus qu'une fois par mois |
| Vérification | **MillionVerifier** | ZeroBounce (meilleur sur catch-all), NeverBounce | Le moins cher, crédits remboursés sur catch-all | ~37-39 $/10 000 | Si le bounce réel dépasse 2 % malgré la vérif : ZeroBounce sur les catch-all |
| Crawl de sites | **n8n + service de crawl** (Firecrawl ou Apify) | Crawl maison | Texte propre pour l'IA | ~20-50 €/mois | — |
| IA (classification, personnalisation) | **Claude Haiku 4.5** (batch) | Sonnet 5 si la qualité ne suffit pas | Coût négligeable, qualité suffisante sur tâches courtes | < 50 €/mois à 25 clients | Monter en Sonnet 5 une tâche dont le juge qualité échoue > 2 % |
| IA (recherche, brouillons, analyse) | **Claude Sonnet 5** ; **Opus 5** pour l'analyse mensuelle | — | Qualité de raisonnement | ~20-150 €/mois | — |
| Orchestration | **n8n Community, auto-hébergé** | n8n Cloud Pro, Make | Exécutions illimitées ; données en Europe sur le VPS choisi | VPS 10-40 €/mois | Passer en n8n Enterprise (ou file de messages dédiée) au-delà de ~500 000 exécutions/mois |
| Base de données | **Supabase (Postgres)** | Postgres géré (Scaleway, OVH), Neon | Postgres standard + API + auth pour les dashboards | 25 $/mois (Pro) → 599 $ (Team) | Team quand la conformité (SSO, logs) l'exige |
| Séquenceur moteur B | **Smartlead** Pro → Unlimited → Prime | Instantly (par workspace), lemlist | Facturé au volume d'emails, boîtes illimitées, API + webhooks, blocklist globale | 94 → 174 → 379 $/mois | Voir C3 |
| Séquenceur moteur A | **Instantly** Hypergrowth | Smartlead (second compte) | Compte séparé = réputation séparée ; interface simple pour le setter | 97 $/mois | Light Speed (358 $) au-delà de 125 000 emails/mois (~20 signatures/mois) |
| Boîtes | **Google Workspace** + **Microsoft 365**, en direct | Mailforge, Zapmail, Infraforge | Isolement de réputation, contrat direct | ~6,90 €/boîte (Google), ~5-6 € (M365) | Revendeur pour les tests ; API Admin SDK au-delà de 500 boîtes |
| Domaines + DNS | **Cloudflare** (DNS + registrar quand l'extension le permet), OVHcloud pour les .fr | Porkbun, Namecheap | API DNS, prix coûtant | ~10-12 €/an/domaine | — |
| Monitoring délivrabilité | **Postmaster Tools v2** (Gmail), **SNDS** (Microsoft), blacklists par API, tests de placement | GlockApps, MailReach | Sources officielles gratuites + tests | 0 → ~50-150 €/mois | Outil payant de placement dès 10 clients |
| DMARC | **Rapports agrégés parsés par n8n** | dmarcian, EasyDMARC | Suffisant sous 100 domaines | 0 € | Service dédié au-delà de 200 domaines |
| CRM | **Attio** | HubSpot Starter, Pipedrive | Objets personnalisés, API, 3 sièges gratuits | 0 → 29 $/siège | HubSpot si les clients exigent l'intégration native HubSpot côté Leadcore |
| Booking | **Cal** (déjà sur le site, API publique) | Calendly | Déjà en place (site/assets/rdv.js), équipes, webhooks | 0 → ~15 $/siège | — |
| SMS de rappel | **Brevo** ou **Twilio** | OVH SMS | API, prix/SMS bas | ~0,05-0,08 €/SMS | — |
| Signature | **Yousign** (Plus) | Docusign | Français, eIDAS, modèles | 23-38 €/utilisateur/mois ; API dès ~104 €/mois | API quand > 10 contrats/mois |
| Paiement | **Stripe** (setup) + **GoCardless** ou Stripe SEPA (retainer) | Qonto, virement | Liens de paiement, webhooks | ~1,5 % + 0,25 € ; SEPA ~1 % plafonné | — |
| Facturation / compta | **Pennylane** | Axonaut | Standard des PME françaises, API | ~50-100 €/mois | — |
| Reporting | **Metabase** (auto-hébergé) sur Postgres | Looker Studio | Vues SQL = une seule définition des métriques | 0 € + VPS | Metabase Cloud si l'auto-hébergement pèse |
| Communication interne | **Slack** | — | Alertes n8n | 0 → ~7 €/siège | — |
| Documentation / SOP | **Notion** (ou `docs/` du dépôt pour la référence) | — | Déjà prévu au document de référence | ~10 €/siège | — |
| LinkedIn (canal 2) | **Manuel** puis **HeyReach** ou **La Growth Machine** sur profils réels | Waalaxy | Invitations plafonnées par LinkedIn ; risque CGU | 79 $/profil/mois | N'automatiser qu'après validation manuelle du canal (principe 4) |

---

## C2 — Trois configurations

### ULTRA LEAN (1 à 5 clients, fondateur + 1 personne)

| Fonction | Outil | Coût mensuel |
|---|---|---:|
| Comptes | Sirene | 0 € |
| Contacts | Apollo Basic, 1 siège | ~53 € |
| Enrichissement | FullEnrich Starter + Dropcontact Starter | ~50 € |
| Vérification | MillionVerifier (crédits) | ~15 € |
| IA | Claude API | ~5 € |
| Orchestration | n8n sur VPS | ~10-20 € |
| Base | Supabase Pro | ~23 € |
| Séquenceur B | Smartlead Pro | ~85 € |
| Séquenceur A | Instantly Growth → Hypergrowth | ~42-87 € |
| CRM | Attio Free | 0 € |
| Booking, signature, paiement | Cal, Yousign One/Plus, Stripe | ~25 € + frais |
| **Total outils** (hors boîtes, domaines, données variables) | | **~310-360 €** |

Le simulateur retient 171 € de quote-part moteur B pour ce palier (Smartlead
Pro, vérification, Supabase, VPS) ; le reste est porté par le moteur A.

Ce qu'on ne fait pas encore : Clay, tests de placement payants, Microsoft
365, Sales Navigator (sauf si la niche l'exige).

### STANDARD (6 à ~19 clients, 2 à 5 personnes)

| Ajout / changement | Pourquoi | Coût |
|---|---|---:|
| Smartlead Unlimited (150 000 emails) | Volume de 6 à 19 clients BASE | ~157 € |
| Clay Launch | Prototypage de segments et de scores par client | ~167 € |
| Attio Plus, 3 sièges | Pipeline A partagé | ~78 € |
| Microsoft 365 (30 % du parc) | Diversification | inclus dans les boîtes |
| Outil de tests de placement | Contrôle hebdomadaire par client | ~50-60 € |
| Metabase auto-hébergé | Dashboards clients | VPS |
| Sales Navigator, 1 siège | Comptes A | ~91-121 € |
| **Total outils moteur B** (simulateur) | | **~571 €** |

### SCALE (≥ 20 clients, 6 personnes et plus)

| Ajout / changement | Pourquoi | Coût |
|---|---|---:|
| Smartlead Prime (500 000 emails, workspaces clients, infrastructure privée) ; un second au-delà de ~65 clients | Volume et isolement | ~341 € par compte |
| Clay Growth | Plusieurs campaign managers | ~446 € |
| Supabase Team | Logs, SSO, conformité | ~540 € (au lieu de 23 €) — *le simulateur retient 99 $ ; à réévaluer selon le besoin réel de SSO* |
| Attio, 8 sièges | Équipe acquisition et CS | ~216 € |
| Monitoring payant, placement, alerting | Parc de 400+ boîtes | ~250 € |
| Serveurs n8n en file (mode queue, Redis) | Débit des webhooks | ~120 € |
| **Total outils moteur B** (simulateur) | | **~1 550-1 900 €** |

---

## C3 — Choix du séquenceur moteur B : quand changer

```
emails / mois       0 ──── 90 000 ──── 150 000 ─────────── 500 000 ────────── 1 000 000
Smartlead           │  Pro  │   Unlimited  │       Prime         │    2 × Prime       │
clients BASE        0       11             19                    65                   131
(7 600 emails)
```

> **RECOMMANDATION** — Smartlead pour tout le moteur B.
> **POURQUOI** — Coût lié au volume d'emails, pas au nombre de clients ; API
> et webhooks dès Pro ; blocklist globale (liste d'opposition unique) ;
> boîtes et warm-up illimités.
> **ALTERNATIVES** — Instantly : excellent produit, mais un abonnement par
> workspace isolé ; à 25 clients isolés, 25 abonnements. Instantly en workspace
> unique partagé : possible, mais l'isolement des données clients repose alors
> sur des tags, et une erreur de tag envoie la campagne d'un client depuis les
> boîtes d'un autre.
> **COÛT** — 94 $ → 174 $ → 379 $/mois.
> **QUAND CHANGER** — Si Smartlead dégrade sa délivrabilité (mesurée par les
> tests de placement, pas par ses propres scores) sur 2 mois, ou si l'API ne
> suit plus le débit. Le changement est possible en 2 semaines parce que la
> vérité est dans Postgres.
> **RISQUE** — Dépendance à un fournisseur unique pour tout l'envoi. Mitigation
> : le moteur A tourne sur Instantly, ce qui garde une compétence et un compte
> actifs sur un second outil.

---

## C4 — Coûts cachés

| Coût caché | Ordre de grandeur | Où il apparaît |
|---|---|---|
| TVA sur les outils étrangers (autoliquidation) | Neutre en trésorerie si récupérable | Compta |
| Change dollar/euro | ±10 % sur ~60 % des outils | Budget |
| Temps d'administration des tenants Google / Microsoft | 2-4 h par client à l'onboarding, 1 h/mois ensuite | Heures opérateur (inclus dans `fixed_hours`) |
| Boîtes brûlées à remplacer | ~5-10 % du parc par trimestre (hypothèse Tier 3) | Réserve de 25 % |
| Domaines à renouveler | ~12 €/an/domaine, même après la fin du client si on les garde | Clause de propriété |
| Crédits d'enrichissement consommés sur des contacts finalement hors ICP | 10-20 % du budget data | Filtrer **avant** d'enrichir (A3) |
| Maintenance n8n auto-hébergé | 2-4 h/mois | Opérations |
| Onboarding HubSpot/Salesforce du client (intégration CRM) | 2-6 h par client | Setup |
| Temps de validation du client (séquences, ICP) | 3-10 jours calendaires | Chemin critique B1 |
