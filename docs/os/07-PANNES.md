# 07 — Comment cette machine peut se casser

Partie de l'[Operating System outbound & delivery](README.md).

Chaque panne suit le même chemin : **PROBLÈME → DÉTECTION → ALERTE → ACTION →
RÉTABLISSEMENT**. Les seuils renvoient à A7.7 (délivrabilité), A13
(capacité), B11 (client success). Les alertes passent par LC-017, LC-021,
LC-022 et LC-028.

## G0 — Niveaux de gravité

| Niveau | Définition | Délai de prise en charge | Qui |
|---|---|---|---|
| **S1** | Risque légal, envoi à des opposants, fuite de données, production d'un client à zéro | Immédiat, même hors heures ouvrées | Direction + opérateur |
| **S2** | Production d'un client dégradée de > 30 %, boîtes ou domaine en rouge | < 2 h ouvrées | Opérateur du client |
| **S3** | Dégradation locale (une campagne, une boîte, un workflow non critique) | < 1 jour ouvré | Opérateur |
| **S4** | Anomalie sans impact immédiat | Revue hebdo | Campaign manager |

Chaque S1 et S2 donne lieu à un post-mortem d'une page (cause, détection,
délai, correction, prévention) versé dans la revue hebdomadaire.

---

## G1 — Données

| Problème | Détection | Alerte | Action | Rétablissement | Niveau |
|---|---|---|---|---|---|
| **Mauvaises données** (titres faux, entreprises fermées) | Taux de `WRONG_PERSON` > 5 % des réponses ; bounce > 2 % ; qualité J+1 basse | LC-017, LC-022 | Geler la source concernée (`enrichment_log.provider`) ; audit de 50 lignes | Revérification, nouveau fournisseur sur le segment, re-scoring | S2 |
| **Bounce élevé** | Bounce 7 j par boîte > 2 % | LC-017 immédiat | Pause des boîtes concernées ; arrêt des lots issus de la même source | Revérification de tout le lot (MillionVerifier puis ZeroBounce sur catch-all) ; reprise à 50 % du volume 3 jours | S2 |
| **Doublons** | Même contact dans 2 campagnes ; même personne sous 2 emails | Porte Q4 ; contrôle hebdo E5 | Blocage du lot | Fusion (LC-001.a) ; excuse manuelle si un prospect a reçu deux fils | S3 |
| **Fournisseur de données qui change ses conditions / prix** | Coût par contact trouvé +30 % sur 2 semaines ; taux de trouvaille –30 % | LC-002 hebdo | Basculer le waterfall sur le fournisseur suivant | Réévaluer le fournisseur principal ; renégocier | S3 |
| **Segment épuisé** | Volume restant < 2 mois de production | LC-022 | Préparer le segment 2 | Plan de renouvellement (MAJ-OFFRE) | S3 |
| **Marché trop petit** | Carte du marché < 12 mois de production | LC-015 à l'onboarding | Alerte au campaign manager | Élargir l'ICP avec le client, ou refuser la mission en semaine 1 (document de référence) | S2 |

## G2 — Délivrabilité et infrastructure

| Problème | Détection | Alerte | Action | Rétablissement | Niveau |
|---|---|---|---|---|---|
| **Spam (plaintes)** | Postmaster : taux de spam > 0,1 % sur un domaine | LC-017 quotidien | Pause du domaine ; revue ciblage + copy de la campagne | Reprise à 30 % du volume après 7 jours sous 0,1 % ; si > 0,3 %, domaine retiré | S2 |
| **Postmaster en échec de conformité** | Statut v2 « échec » | LC-017 | Arrêt des envois du domaine | Corriger l'exigence en échec (auth, PTR, désinscription) ; attendre le retour au vert | S2 |
| **Réputation de domaine dégradée** (placement < 70 %) | Tests de placement hebdo ; taux de réponse de la boîte < 50 % de la moyenne | LC-017 | Volume –50 % ; warm-up renforcé | Si pas d'amélioration en 14 jours : retirer le domaine, puiser dans la réserve | S2 |
| **Domaine en liste noire** | Contrôle quotidien des listes (Spamhaus DBL…) | LC-017 immédiat | Retrait du domaine, pause de ses boîtes | Remplacement par la réserve ; demande de retrait si pertinente ; enquête sur la cause | S2 |
| **Boîte suspendue par Google / Microsoft** | Erreur d'authentification du séquenceur ; webhook « account disconnected » | LC-017 immédiat | Retirer la boîte des campagnes ; les leads en cours passent sur une boîte du même domaine | Contacter le support ; si perdue, remplacer par la réserve (déjà chaude, < 24 h) | S2 |
| **Tenant entier suspendu** | Plusieurs boîtes d'un même tenant en erreur | LC-017 | Arrêt des campagnes du tenant | Bascule sur le second tenant (Google ↔ Microsoft, A7.4) ; recours auprès du fournisseur | S1 si > 50 % de la production d'un client |
| **DNS cassé** (SPF, DKIM supprimés par erreur) | Rapports DMARC en échec ; test d'authentification quotidien | LC-017 | Arrêt des envois du domaine | Restaurer depuis l'état en base (`domain`) ; contrôle | S2 |
| **Règles Google / Microsoft durcies** | Veille mensuelle (pages Tier 1 de 00-RECHERCHE) ; chute simultanée du placement sur tous les clients | Revue mensuelle ; LC-017 (corrélation) | Réunion de crise ; baisse globale du volume | Adapter l'infrastructure ; accélérer le canal 2 (LinkedIn, téléphone) | S1 |
| **Séquenceur en panne** | Webhooks absents > 2 h en heures ouvrées ; API en erreur | LC-028 | Aucune action destructive : les envois s'arrêtent d'eux-mêmes | Reprise automatique ; si > 48 h, bascule vers le second séquenceur (compte du moteur A) pour les clients prioritaires | S2 |
| **Séquenceur qui dégrade sa délivrabilité** | Placement en baisse sur tous les clients, sans cause interne | Tests de placement mensuels comparés | Test A/B d'infrastructure : une partie des boîtes connectée à un autre séquenceur | Migration (2 semaines, vérité dans Postgres) | S2 |

## G3 — Automatisation et IA

| Problème | Détection | Alerte | Action | Rétablissement | Niveau |
|---|---|---|---|---|---|
| **Panne d'API (source, enrichissement, IA)** | Codes 5xx / 429, timeouts | LC-028 | 3 tentatives exponentielles, puis file `dead_letter` | Rejouer après rétablissement ; fournisseur de repli dans le waterfall | S3 |
| **Scraper cassé** (site modifié, blocage) | Taux d'échec du crawl > 15 % ; texte vide | LC-002 | Personnalisation descend en N1 pour les comptes concernés | Corriger le parseur ; changer de service de crawl | S3 |
| **Hallucination IA dans une première ligne** | Juge Q2 ; relecture Q8 ; réponse du prospect « ce n'est pas nous » | LC-006 ; LC-008 (attribut) | Lot bloqué si > 2 % ; prompt revu | Règle « aucun fait sans source dans l'entrée » ; baisse du niveau de personnalisation ; test du prompt sur 50 cas avant remise en service | S2 si envoyé |
| **Mauvaise classification d'une opposition** | Revue humaine des confiances < 0,8 ; échantillon hebdo de 30 réponses | LC-008 ; revue | Détecteur de mots-clés en premier (LC-008 étape 3) ; dans le doute, suppression | Rejouer les réponses de la période avec le prompt corrigé | **S1** |
| **Positive classée négative** | Échantillon hebdo ; plainte du client | Revue hebdo | Relire toutes les `NEGATIVE` à confiance < 0,9 de la période | Contact manuel des positives manquées | S2 |
| **Workflow silencieux** (ne tourne plus) | LC-030 : dernière exécution réussie > 2 périodes | LC-030 | Alerte | Relance manuelle ; rattrapage des traitements manqués | S2 si LC-008 / LC-023 |
| **n8n / serveur hors service** | Sonde externe (uptime) | Alerte SMS | Redémarrage ; webhooks du séquenceur mis en attente par le fournisseur (vérifier sa politique de renvoi) | Reprise ; rapprochement séquenceur ↔ Postgres | S1 si > 1 h en heures ouvrées |
| **Perte de données** | Restauration impossible | — | — | Sauvegarde quotidienne séparée (LC-030) ; test de restauration trimestriel | S1 |
| **Coût IA qui dérape** | `ai_call_log` : coût du jour > 3 × la moyenne | LC-028 | Plafonner le workflow ; vérifier la boucle | Corriger ; plafond de dépense dans la console Anthropic | S3 |

## G4 — Ciblage, message, résultats

| Problème | Détection | Alerte | Action | Rétablissement | Niveau |
|---|---|---|---|---|---|
| **Mauvais ICP** | Qualité J+1 ≤ 2 sur 5 RDV ; 0 signé sur 15 RDV J+30 | LC-022 | Atelier ICP avec le client | Nouvelle carte ICP (version +1), re-scoring, segment de test | S2 |
| **Personnalisation ratée** (générique, flatteuse, fausse) | Juge Q2 ; taux de réponse N3 ≤ N1 dans un test | LC-006 ; LC-020 | Revenir en N1 sur le segment | Réécrire le prompt ; changer la source de la personnalisation (signal plutôt que site) | S3 |
| **Taux de réponse bas** | Réponse < 2 % sur 800 contacts | LC-020 | Vérifier d'abord la délivrabilité (placement), ensuite le message | Si placement OK : nouveau segment / signal / offre (ordre B9.2) | S3 |
| **Réponses mais pas de positif** | Réponse ≥ 5 %, positif < 0,7 % | LC-022 | L'offre ou la cible ne convient pas | Tester une offre d'appel plus facile ; revoir le persona | S3 |
| **Qualification faible** (RDV non qualifiés) | Part de RDV `qualified = false` > 15 % ; contestations du client | LC-022 ; LC-026 | Rappel des critères au setter ; revue de 10 RDV | Formation ; critères ajoutés au formulaire Cal | S2 |
| **No-show élevé** | Présence < 65 % sur le mois | LC-022 | Vérifier la cadence de rappels (SMS envoyé ?) ; délai booking → RDV | Raccourcir le délai (< 7 j) ; confirmation par téléphone pour les comptes A | S3 |
| **Échec commercial du client** (RDV tenus mais 0 signé) | 0 `won` sur 15 RDV J+30, qualité J+1 correcte | LC-022 | Analyse des motifs de perte | Coaching (B7), revue de l'offre du client ; si le problème est la vente du client, le dire avec les données | S2 |
| **Client qui ne renvoie pas le J+30** | Taux de retour < 70 % | LC-025, LC-022 | Relances ; point mensuel | Rappeler la clause contractuelle ; sans J+30, pas de hausse de prix ni de cas client | S3 |
| **Définition du RDV qualifié contestée** | Contestation d'un RDV à la facture | LC-026 | RDV exclu du brouillon de facture, revue | Arbitrage sur la base de la définition du contrat en vigueur à la date du RDV ; jamais de requalification rétroactive | S3 |

## G5 — Capacité et organisation

| Problème | Détection | Alerte | Action | Rétablissement | Niveau |
|---|---|---|---|---|---|
| **Capacité de closing insuffisante (Leadcore)** | Saturation prévue > 110 % | LC-021 | Volume –30 % sur les nouveaux lots ; priorisation des paliers A | Ouvrir des créneaux ; recruter ; qualifier plus dur | S2 |
| **Capacité du client insuffisante** | RDV proposés à > 10 jours ; plainte | LC-021, LC-022 | Pause des nouveaux lots | Ajuster le plafond ; basculer la sur-livraison vers la qualité | S3 |
| **Setter débordé** (SLA < 80 %) | Délai de réponse aux positives > 1 h sur > 20 % des cas | LC-009 | Réaffectation ; brouillons IA plus complets | Recrutement ou réduction du volume | S2 |
| **Personne clé absente** | — | — | Chaque client a un opérateur principal et un suppléant nommés | Documentation (SOP), accès partagés | S3 |
| **Dépendance à un fournisseur unique** | Revue trimestrielle | Revue | Deux séquenceurs (A et B), deux fournisseurs de boîtes, waterfall à 2+ fournisseurs | Plan de migration écrit par outil critique | S4 |

## G6 — Conformité et réputation

| Problème | Détection | Alerte | Action | Rétablissement | Niveau |
|---|---|---|---|---|---|
| **Email envoyé à un opposant** | Réponse d'un contact présent en `suppression` ; plainte | LC-008 (contrôle croisé) | Arrêt immédiat de toutes les séquences ; excuse écrite | Enquête : comment la porte Q3 a été contournée ; correction ; registre des incidents | **S1** |
| **Plainte CNIL / mise en demeure** | Courrier, email | — | Direction + conseil juridique | Réponse documentée (registre, LIA, preuves d'opposition) | **S1** |
| **Demande d'accès / d'effacement** | Réponse ou email dédié | LC-008 (attribut) | Traitement dans le mois (légal), objectif 72 h | LC-023 ; réponse écrite | S2 |
| **Fuite de données** (export, accès non autorisé) | Journal d'accès ; alerte d'un tiers | — | Confinement, évaluation | Notification CNIL sous 72 h si risque pour les personnes (art. 33) ; information des clients (sous-traitance) | **S1** |
| **Prospect hostile en public** (post LinkedIn) | Veille ; signalement | Direction | Réponse sobre, suppression immédiate | Revue du ciblage qui l'a produit | S2 |
| **Clients concurrents qui ciblent les mêmes comptes** | Porte Q4 ; conflit de segments | LC-004 | Exclusivité (B4.3) | Arbitrage commercial | S3 |
