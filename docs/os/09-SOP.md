# 09 — SOP : que dois-je faire maintenant ?

Partie de l'[Operating System outbound & delivery](README.md).

Deux parties séparées, comme les moteurs : **Leadcore** (moteur A et
fonctionnement général) et **Nouveau client** (moteur B). Chaque ligne est
une action, avec son responsable et la section qui la détaille.

---

## I1 — Leadcore

### I1.1 Avant le premier envoi (une seule fois)

| # | Action | Responsable | Détail | Fait quand |
|---|---|---|---|---|
| 1 | Trancher la niche de test : 3 niches candidates, 600 contacts chacune | Direction | A1.3 | Grille remplie |
| 2 | Faire valider J1, J2, J4, J5, J10 par un avocat | Direction | H12 | Réponses écrites |
| 3 | Rédiger la LIA du moteur A et le registre | Direction | H2.2 | Documents signés |
| 4 | Acheter 5 domaines d'envoi Leadcore + 2 en réserve | Opérateur | A7.2 | J-28 |
| 5 | Créer le tenant Google du moteur A, 14 boîtes, DNS | Opérateur | A7.3-A7.4 | J-21 |
| 6 | Créer le compte Instantly (moteur A), connecter les boîtes, warm-up | Opérateur | A8 | J-14 |
| 7 | Installer n8n (VPS UE), Supabase (région UE), charger `schema.sql` | Opérateur | 04, 05 | J-14 |
| 8 | Brancher Sirene, Apollo, FullEnrich, MillionVerifier, Claude | Opérateur | 03-STACK | J-10 |
| 9 | Mettre en service LC-001 → LC-008, LC-017, LC-023, LC-028, LC-030 | Opérateur | 04 | J-7 |
| 10 | Page d'opposition et notice d'information en ligne | Opérateur | H3 | J-7 |
| 11 | Écrire 3 séquences (une par niche) à partir de A6, passer `stop-slop` | Direction | A6 | J-5 |
| 12 | Configurer Attio (pipeline A14.1), Cal, Yousign, Stripe | Opérateur | A14 | J-5 |
| 13 | Première QA complète sur un lot de 50 | Direction + opérateur | A9.3 | J-1 |
| 14 | Premier envoi : 5-10 emails/boîte/jour, contacts `valid` des paliers A-B uniquement | Opérateur | A8.3 | J0 |

### I1.2 Chaque jour

| Heure | Rôle | Action | Outil / workflow |
|---|---|---|---|
| 7 h 00 | Opérateur | Lire le résumé LC-017 : boîtes et domaines en orange ou rouge ; agir sur les rouges | Slack #alertes |
| 7 h 15 | Opérateur | Valider la QA du lot du jour (10 emails tirés au sort) | LC-006 |
| 8 h 00 | Setter | Vider la file des réponses de la nuit : positives d'abord | LC-009 |
| En continu | Setter | Positives < 1 h, questions < 2 h, objections < 4 h | A11 |
| 9 h 00 | Closer | Lire les briefs des RDV du jour | LC-012 |
| Après chaque RDV | Closer | Cocher la présence, écrire l'issue, envoyer la proposition sous 24 h | A12 |
| 12 h 00 | Setter | Traiter les no-shows de la veille (replanification) | LC-018 |
| 17 h 00 | Setter | CRM à jour, file vide, SLA du jour vérifié | Attio |
| 17 h 30 | Responsable | Coup d'œil à la saturation (LC-021) et aux propositions sans réponse | LC-021, LC-012 |

### I1.3 Chaque semaine

| Jour | Action | Qui | Détail |
|---|---|---|---|
| Lundi | Vérifier le sourcing de la semaine (volume, coût, taux de trouvaille) | Opérateur | LC-001, LC-002 |
| Lundi | Valider les lots de la semaine et la répartition témoin / exploration | Campaign manager | LC-004 |
| Mercredi | Test de placement sur 3 boîtes par domaine | Opérateur | A7.7 |
| Vendredi | **Revue hebdomadaire** (45 min) : tests (B9), segments, pipeline, SLA, incidents | Tous | LC-020, document de référence §13 |
| Vendredi | Décisions : arrêter, continuer, dupliquer ; écrire les apprentissages | Campaign manager | B8 |

### I1.4 Chaque mois

| Action | Qui | Détail |
|---|---|---|
| Recalculer CAC, taux de signature, cycle de vente, motifs de perte | Direction | F6, A14.1 |
| Veille des règles Google / Microsoft / CNIL (pages Tier 1) | Opérateur | 00-RECHERCHE §2 |
| Revue des coûts outils vs palier | Direction | 03-STACK C2 |
| Mettre à jour le simulateur avec les taux réels | Direction | `tools/simulateur_os.py --set` |
| Contrôle de conformité : oppositions traitées, délais, purges | Opérateur | LC-023, LC-027 |
| Test de restauration de sauvegarde (trimestriel) | Opérateur | LC-030 |

### I1.5 Quand quelque chose casse

1. Identifier le niveau (S1 à S4, G0).
2. Appliquer la ligne correspondante de [07-PANNES](07-PANNES.md).
3. S1 : prévenir la direction immédiatement, arrêter les envois concernés
   d'abord, comprendre ensuite.
4. Écrire le post-mortem d'une page pour tout S1 et S2.

---

## I2 — Nouveau client

### I2.1 De la signature au lancement

| Jour ouvré | Action | Responsable | Détail | Critère de sortie |
|---|---|---|---|---|
| J0 | Vérifier contrat signé **et** setup payé ; sinon, rien ne démarre | LC-013 | MAJ-OFFRE | Les deux webhooks reçus |
| J0 | Espace client créé, questionnaire envoyé avec variantes de domaines | LC-014 | B2.2 | Email parti |
| J0 | Appel ICP planifié à J3 | Campaign manager | B2.3 | Invitation acceptée |
| J1 | Domaines validés → achat, DNS | Opérateur (LC-029) | A7.2-A7.3, B6.2 | Auth OK |
| J2 | Boîtes créées, signatures, warm-up lancé | Opérateur | A8 | Warm-up actif |
| J2 | Export clients reçu → lookalike, suppressions | LC-014 | B2.4 | Suppressions chargées |
| J3 | Appel ICP (90 min), enregistré avec accord | Campaign manager | B2.3 | Notes + transcription |
| J3-J5 | Carte ICP, anti-ICP, personas, offre d'appel, **définition du RDV qualifié** | Campaign manager | B2.1 | Validation écrite du client |
| J4-J5 | Carte du marché envoyée au client | LC-015 | B1.2 | Livrée |
| J5 | Capacité hebdomadaire du client et plafond de RDV notés | Campaign manager | B7.1, `client_config` | Renseigné |
| J4-J10 | Segment 1 construit (≥ 2 mois de production), segments 2-3 estimés | List builder | B3-B4 | Plan de renouvellement écrit |
| J5-J9 | 3 angles × séquence de 4 touches ; validation client | Campaign manager | B5 | Un aller-retour, validé |
| J10-J12 | Campagnes créées, lots planifiés | Opérateur | LC-004, LC-007 | — |
| J12 | 50 premiers comptes envoyés au client | LC-015 | B1.2 | Livrés |
| J12-J13 | QA complète (Q1-Q9) | Opérateur + campaign manager | A9.3 | Aucune porte rouge |
| J14 | Premiers envois (5-10/boîte/jour) ; rapport de lancement | Opérateur | A8 | Monitoring vert 48 h |
| J14-J25 | Ramp-up selon les critères mesurés | LC-017 | A8.2 | Plein volume |

### I2.2 En régime de croisière

| Fréquence | Action | Qui | Détail |
|---|---|---|---|
| Quotidien | Alertes du client (délivrabilité, santé) | Opérateur | LC-017, LC-022 |
| Quotidien | Réponses du client : positives < 1 h | Setter | A11 |
| Quotidien | Fiche RDV au commercial du client à chaque booking | LC-010 | B1.3 |
| Quotidien | Relancer les retours J+1 manquants | LC-018 | B1.3 |
| Lundi | Rapport hebdomadaire relu et envoyé avant 9 h 30 | Campaign manager | B10.2 |
| Vendredi | Tests du client passés en revue | Campaign manager | B9 |
| 1er ouvré du mois | Rapport mensuel, facture (relue), statuts J+30 | Campaign manager, finance | B10.3, LC-026 |
| Mensuel | Point de 30 min avec le client : résultats, J+30, intelligence, plan | Campaign manager | B7.3 |
| Mois 3 | Revue trimestrielle : ROI, affinage ICP, recommandations, proposition de suite | Campaign manager + direction | B7.3 |
| À l'alerte | Segment < 2 mois de production → segment suivant | List builder | B11 |

### I2.3 Si le client est sous la promesse

1. À J+15 du mois, LC-022 projette moins de 8 RDV : alerte.
2. Vérifier dans l'ordre : délivrabilité (placement) → volume réellement
   envoyé → taux de réponse → taux de positif → booking → présence.
   Le premier maillon anormal est la cause.
3. Écrire au client **sous 48 h** : chiffres, cause identifiée, plan, date du
   prochain point. Un mauvais résultat se présente avec des données et un
   plan (document de référence §17).
4. Activer les leviers de priorité ≥ 10 de B7.2.

### I2.4 Fin de contrat

| Action | Détail |
|---|---|
| Arrêt des séquences à la date de fin | LC-007 |
| Transfert des domaines si le contrat le prévoit | B6.2, H8 |
| Restitution / suppression des données | H6, LC-027 |
| Export des oppositions au client | H4 |
| Retour d'expérience écrit : ce qui a marché, pourquoi le client part | Alimente B8 et le moteur A |

---

## I3 — Correspondance avec les 26 SOP du document de référence

| # | SOP (document de référence §20) | Où dans l'OS |
|---|---|---|
| 01 | ICP & Targeting | A1, B2, B3 |
| 02 | Scraping | A2, A3, H5 |
| 03 | Data Cleaning | A3 (NORMALIZE, DEDUP), E5 |
| 04 | Enrichment | A3 (ENRICH), LC-002 |
| 05 | Lead Scoring | A1, B4.4, LC-003 |
| 06 | Domain Setup | A7.2-A7.4, B6, LC-029 |
| 07 | Email Deliverability | A7.7, A8, LC-017, G2 |
| 08 | Copywriting | A6, B5.3 |
| 09 | Campaign Launch | A9, B1, I2.1 |
| 10 | Reply Handling | A11, LC-008 |
| 11 | Qualification | A12, B1.3 |
| 12 | Booking | A12, LC-010 |
| 13 | No-show | B1.3, LC-018 |
| 14 | Setter | I1.2, A11-A12 |
| 15 | Closer | A12-A14 |
| 16 | Sales Call | A14.2 (brief), document de référence §3 étape 7 |
| 17 | Client Onboarding | B1, I2.1 |
| 18 | Client Reporting | B10, LC-019 |
| 19 | QA | A9.3, LC-006 |
| 20 | Incident Management | 07-PANNES, I1.5 |
| 21 | Weekly Review | I1.3, LC-020 |
| 22 | Hiring & Training | A15.3, 10-ROADMAP |
| 23 | CRM | A14.1, LC-011 |
| 24 | Automation / n8n | 04-N8N |
| 25 | Offboarding | I2.4 |
| 26 | Renouvellement de segments | B4.5, B11, LC-015 |
