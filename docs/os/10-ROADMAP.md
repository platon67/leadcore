# 10 — Roadmap 30 / 60 / 90 jours, puis 10 → 100 clients

Partie de l'[Operating System outbound & delivery](README.md).

Le calendrier part d'une contrainte physique : **14 jours de warm-up** avant
le premier envoi réel. Rien ne l'accélère. Tout ce qui peut se faire en
parallèle se fait pendant ces 14 jours.

```
Jours   1────7────14───────30──────────────60──────────────90
Infra   ████ achat, DNS, boîtes, warm-up ██████ ramp-up ───► plein volume
Moteur A      séquences, QA      ▲ 1ers envois   ▲ 1ers RDV   ▲ 1res signatures
Moteur B                                     ▲ client 1 (onboarding 10 j) ▲ clients 2-5
Données  ████ schéma, n8n, sources ███ LC-001→008 ███ LC-009→022 ███ tout
Mesure                                   1ers taux réels ▲    1ers J+30 ▲
```

---

## J1 — Jours 1 à 7 : infrastructure minimale

| Objectif | Actions | Livrable | Responsable |
|---|---|---|---|
| Démarrer l'horloge du warm-up | 5 domaines + 2 de réserve achetés (J1) ; tenant Google ; 14 boîtes ; DNS ; Instantly ; warm-up actif (J3 au plus tard) | Parc en chauffe | Opérateur |
| Socle de données | VPS n8n (UE) ; Supabase (UE) ; `schema.sql` chargé ; LC-028 et LC-030 en service | Base vide, sauvegardée | Opérateur |
| Sources | Comptes Apollo, FullEnrich, MillionVerifier, API France Travail, Claude ; LC-001, LC-002 en staging | Premier sourcing de test (200 comptes) | Opérateur |
| Niche | Grille A1.3 remplie pour 5 candidates ; 3 retenues pour le test | Décision écrite | Direction |
| Mesures de départ | Échantillon de 500 domaines passé au vérificateur (part de catch-all) ; couverture Apollo sur 200 comptes Sirene | Deux chiffres qui corrigent le simulateur | Opérateur |
| Juridique | Questions J1-J11 envoyées à un avocat | Rendez-vous pris | Direction |
| Contrat type | Clauses MAJ-OFFRE §2 + H8 rédigées pour relecture | Brouillon | Direction |

**Critère de fin de semaine** : warm-up actif sur 14 boîtes, base en
service, 3 niches choisies.

## J2 — Jours 8 à 30 : premières campagnes

| Semaine | Actions | Livrable |
|---|---|---|
| S2 (J8-14) | Séquences des 3 niches (A6), relues `stop-slop` ; LC-003 → LC-008 et LC-023 en production ; page d'opposition et notice ; Attio, Cal, Yousign, Stripe | Machine prête, QA à blanc |
| S3 (J15-21) | Premiers envois (5-10/boîte/jour), contacts `valid`, paliers A-B ; setter sur les réponses | 1ers taux réels |
| S4 (J22-30) | Ramp-up selon A8 ; 1ers RDV ; LC-009 → LC-012, LC-017, LC-018 en production ; relecture de 100 classifications | 1ers RDV tenus ; tableau de bord du moteur A |

**Volume visé à J30** : ~1 800 contacts envoyés sur les 3 niches (600
chacune), ~20-25 réponses, 5-8 RDV bookés. **Première signature attendue
entre J30 et J45** (cycle de vente de 1 à 2 semaines après le RDV).

**Décisions à J30** :

- les taux réels (réponse, positif, booking) remplacent les hypothèses du
  simulateur (`--set`) ;
- si une niche produit 0 positif sur 600 contacts avec un placement correct,
  elle sort ;
- ajustement du nombre de boîtes pour tenir 4 signatures/mois (28 boîtes,
  A7.5) : commander la seconde vague de 14 boîtes à J20 pour qu'elle soit
  chaude à J35.

## J3 — Jours 31 à 60 : optimisation

| Objectif | Actions | Livrable |
|---|---|---|
| Choisir la niche | Comparer les 3 niches sur RDV tenus / 1 000 contacts, à valeur client comparable | **Niche unique pour 6 mois** (MAJ-OFFRE §5 fermé) |
| Premiers clients | Clients 1 à 3 onboardés selon I2.1 ; LC-013 → LC-015, LC-019, LC-025, LC-029 en production | 1ers envois clients vers J45-J55 |
| Tests | Angles du moteur A : témoin + 1 variante par niche restante (B9) | 1ers apprentissages écrits |
| Délivrabilité | Tests de placement hebdo ; DMARC en `quarantine` sur les domaines propres depuis 30 j | Tableau de santé stable |
| Qualité des RDV | Relecture des 20 premiers RDV : qualifiés ? taux de signature ? | Ajustement des critères de qualification du setter |
| Contrat et conformité | Réponses de l'avocat intégrées ; DPA signé avec chaque client | Contrat type final (MAJ-OFFRE §6 coché) |

**Indicateurs de passage** : taux de positif réel ≥ 1 % sur la niche retenue ;
présence ≥ 65 % ; au moins 3 clients signés ; aucune alerte S1.

## J4 — Jours 61 à 90 : scale

| Objectif | Actions | Livrable |
|---|---|---|
| 5 clients actifs | Moteur A à 2 signatures/mois minimum | Parc de 5 |
| Premier recrutement | **Opérateur delivery** avant le premier closer (A15.3) : c'est la delivery qui sature en premier | Opérateur formé sur I2 |
| Premiers J+30 | Statuts J+30 des premiers RDV clients | 1ers chiffres de CA signé |
| Automatisation | LC-020 (tests), LC-021 (capacité), LC-022 (santé), LC-024 (nurture), LC-026 (facture) en production | Machine complète |
| Économie | Simulateur recalé ; marge réelle par client vs modèle | Écart expliqué |
| Cas clients | Viser 2 clients avec CA signé documenté (condition de la grille établie) | Cas en préparation |

**À J90** : 5 clients, les 30 workflows en service, taux réels mesurés sur
~5 000 contacts du moteur A, premiers J+30.

---

## J5 — Scale 10 clients

| Dimension | Configuration |
|---|---|
| Rythme d'acquisition | ~2 signatures/mois |
| Équipe | Fondateur (direction + closing), 2 opérateurs delivery (dont un campaign manager), 1 setter partagé A/B |
| Stack | Palier STANDARD : Smartlead Unlimited, Clay Launch, Attio 3 sièges, tests de placement, Metabase |
| Infrastructure | ~170 boîtes et 60 domaines moteur B ; 28 boîtes moteur A ; mix Google/Microsoft |
| Volumes | ~19 000 contacts, 76 000 emails, ~1 200 réponses, ~118 RDV honorés par mois (BASE) |
| Goulot | Le temps du fondateur (closing + direction delivery) |
| Déclencheur de l'étape suivante | 2 cas clients chiffrés → passage à la grille établie (1 500 € / 1 500 € / 150 €) pour les nouveaux clients |
| Risque principal | Qualité des RDV qui baisse quand le fondateur ne relit plus |

## J6 — Scale 25 clients

| Dimension | Configuration |
|---|---|
| Rythme d'acquisition | ~3-5 signatures/mois |
| Équipe | 1 closer (commission sur setup + 3 premiers mois), 1 setter moteur A, 4-6 opérateurs, 1 responsable delivery |
| Stack | Palier SCALE : Smartlead Prime, Clay Growth, n8n en mode queue, Supabase Team si besoin |
| Infrastructure | ~425 boîtes, 150 domaines ; 2 tenants Google + 1 Microsoft par moteur ; automatisation Admin SDK / Graph pour la création |
| Volumes | ~47 500 contacts, 190 000 emails, ~3 000 réponses, ~294 RDV honorés par mois |
| Goulot | **Traitement des réponses** (~3 000/mois) et qualité de qualification |
| Ce qui risque de casser | SLA des positives ; cohérence des rapports ; gestion manuelle des tenants ; plafond de fréquence inter-clients (B4.2) si plusieurs clients ciblent la même zone |
| Chantier prioritaire | IA autonome sur les classes simples (≈ 60 % des réponses, 11-AUDIT-V2) |

## J7 — Scale 50 clients

| Dimension | Configuration |
|---|---|
| Rythme d'acquisition | ~6-10 signatures/mois |
| Équipe | 2 closers, 2 setters, 1 responsable acquisition ; 9-12 opérateurs, 2 responsables delivery ; 1 personne ops/data (n8n, qualité des données) |
| Stack | SCALE ; partitionnement de `event` ; monitoring payant ; revue du séquenceur (un seul compte Prime couvre ~65 clients BASE) |
| Infrastructure | ~850 boîtes, 300 domaines ; renouvellements de domaines automatisés |
| Volumes | ~95 000 contacts, 380 000 emails, ~6 000 réponses, ~590 RDV honorés par mois |
| Goulot | **Le marché de Leadcore** (A15.4) : la niche initiale s'épuise pour le moteur A |
| Ce qui risque de casser | Épuisement de niche ; dépendance au fondateur pour les grands comptes ; dette de données (doublons, scores périmés) |
| Chantier prioritaire | Seconde niche ; recommandations clients et partenariats comme canaux 2-3 |

## J8 — Scale 100 clients

| Dimension | Configuration |
|---|---|
| Rythme d'acquisition | ~11-20 signatures/mois |
| Équipe | 3-4 closers, 3 setters, 1 sales manager ; 17-24 opérateurs (selon le niveau d'automatisation), 3-4 responsables delivery ; 2 ops/data ; 1 responsable conformité (temps partiel) |
| Stack | 2 comptes Smartlead Prime ; n8n avec plusieurs workers (ou file dédiée) ; entrepôt de données séparé pour l'analytique |
| Infrastructure | ~1 700 boîtes, 600 domaines ; 4+ tenants par fournisseur ; création et rotation entièrement automatisées |
| Volumes | ~190 000 contacts, 760 000 emails, ~12 000 réponses, ~1 180 RDV honorés par mois |
| Goulot | Recrutement et formation des opérateurs ; concentration du risque de plateforme (un durcissement de Gmail touche 100 clients en même temps) |
| Ce qui risque de casser | Réputation globale de Leadcore auprès des passerelles ; qualité homogène entre 20 opérateurs ; coût d'encadrement |
| Chantier prioritaire | Canal 2 industrialisé ; spécialisation des équipes par niche ; opérateurs à 8-10 clients chacun grâce à l'automatisation |

### Effectif par palier (BASE vs SCALE)

| Parc | Opérateurs (BASE, 4,2 clients/opérateur) | Opérateurs (SCALE, 5,9 clients/opérateur) | Encadrants delivery | Équipe acquisition |
|---:|---:|---:|---:|---:|
| 10 | 2,4 | 1,7 | 0 | Fondateur + setter |
| 25 | 5,9 | 4,3 | 1 | 1 closer + 1 setter |
| 50 | 11,8 | 8,5 | 2 | 2 closers + 2 setters + 1 resp. |
| 100 | 23,6 | 17,0 | 3-4 | 3-4 closers + 3 setters + 1 manager |
