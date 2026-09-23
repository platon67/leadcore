# 02 — Moteur B : delivery client

Partie de l'[Operating System outbound & delivery](README.md).

Le moteur B prend un client qui vient de payer son setup et en fait une
machine outbound qui produit des rendez-vous qualifiés, le plus vite possible
et sans jamais sacrifier la délivrabilité ni la définition contractuelle du
rendez-vous qualifié.

Tout ce que le moteur B manipule porte un `client_id`. Deux clients ne
partagent ni boîtes, ni domaines, ni campagnes, ni listes de prospects. Ils
partagent la **méthode**, les **workflows** et, anonymisés, les
**apprentissages** (B8).

```
                               MOTEUR B — vue d'ensemble

 Signature ─► Onboarding ─► ICP discovery ─► ICP → requêtes ─► Lead Data Engine
   (A14)        (B1)           (B2)              (B3)              (B4)
                                                                     │
      ┌──────────────────────────────────────────────────────────────┘
      ▼
 Campaign engine ─► Infrastructure ─► Envoi ─► Réponses ─► Qualification ─► Booking
      (B5)              (B6)                    (A11)      (B1 §RDV)       (B1 §RDV)
                                                                              │
      ┌───────────────────────────────────────────────────────────────────────┘
      ▼
 Livraison du RDV ─► Présence ─► J+30 ─► Reporting ─► Analyse ─► Nouvelle hypothèse
                                         (B10)       (B8)         (B9)
      └──────────── Overdelivery (B7) et Client success (B11) en surveillance continue ─┘
```

---

## B1 — Onboarding client

### B1.1 Chronologie

Le warm-up impose son rythme : il faut 14 jours de chauffe avant le premier
envoi réel (A8). Tout le reste de l'onboarding se fait **pendant** cette
chauffe. Le chemin critique, c'est l'achat des domaines : il part le jour du
paiement.

```
Jour ouvré : J0    J1    J2    J3    J4    J5    J6    J7    J8    J9   J10   J11   J12   J13   J14   J15  … J25
Domaines   : ██ achat + DNS
Boîtes     :       ██ création, signatures, warm-up auto ███████████████████████████████████████████████████████
Question.  : ██████ envoi → retour
Appel      :             ██ appel ICP (90 min)
ICP/Offre  :             ████████ cartes ICP, personas, anti-ICP
Messaging  :                         ████████████ angles, séquences, validation client
Données    :                   ██████████████████ sourcing, enrichissement, vérif., score
QA         :                                                   ██████
Lancement  :                                                               ██ 1ers envois (5-10/boîte/j)
Ramp-up    :                                                                     ████████████████ → plein volume
Premiers RDV:                                                                          ▲ attendu J15-J20
```

| Étape | Jour ouvré | Responsable | Livrable | Condition de sortie |
|---|---:|---|---|---|
| **SIGNATURE** | J0 | Closer | Contrat signé (Yousign) | Webhook reçu |
| **PAYMENT** | J0 | Client | Setup payé | Paiement Stripe confirmé. **Rien ne démarre avant** (règle MAJ-OFFRE) |
| Création de l'espace client | J0, < 1 h | LC-014 | Enregistrement `client`, dossier partagé, canal Slack Connect ou email dédié, fiche Attio | Automatique |
| **QUESTIONNAIRE** | J0 → J2 | Client | Formulaire B2.2 rempli, export de ses 20 à 50 meilleurs clients, liste d'exclusion | Formulaire complet |
| Domaines | J0 → J1 | Opérateur (LC-014) | 3 à 5 variantes proposées au client **dans le questionnaire** ; achat dès validation ; DNS par API | Domaines validés par le client |
| Boîtes | J1 → J2 | Opérateur | Boîtes créées aux noms des personnes du client qui « signent » les emails (avec leur accord), signatures, photos | Authentification SPF/DKIM/DMARC OK |
| **CALL** | J3 | Campaign manager | Appel de 90 min (B2.3) | Notes structurées |
| **ICP** | J3 → J5 | Campaign manager | Carte ICP, anti-ICP, paliers | Validée par écrit par le client |
| **OFFER** | J4 → J5 | Campaign manager | Offre d'appel (ce qu'on propose au prospect : audit, échange, démo) | Validée |
| **PERSONAS** | J4 → J5 | Campaign manager | 2 à 4 personas | Validés |
| **Définition du RDV qualifié** | J5 | Campaign manager + client | Critères écrits, en annexe du contrat | Signée ; **plus jamais modifiée rétroactivement** |
| **MESSAGING** | J5 → J9 | Campaign manager | 3 angles × séquence de 4 touches, variantes | Validés par le client (un seul aller-retour prévu) |
| **DATA** | J4 → J10 | List builder (LC-015) | Segment 1 (≥ 2 mois de production), segments 2 et 3 estimés | Plan de renouvellement écrit (MAJ-OFFRE) |
| **INFRASTRUCTURE** | J1 → J14 | Opérateur | Parc chaud, tests de placement | Critères A8 |
| **CAMPAIGN** | J10 → J12 | Opérateur | Campagnes créées dans le séquenceur, lots planifiés | — |
| **QA** | J12 → J13 | Opérateur + campaign manager | Portes Q1-Q9 (A9.3) | Aucune porte rouge |
| **LAUNCH** | J14 | Opérateur | Premiers envois | Monitoring vert 48 h |
| Plein volume | ~J25 | Automatique (A8) | 30 envois/boîte/jour | Critères A8 remplis |

**Temps humain d'onboarding** : 20 à 30 heures, cohérent avec le document de
référence. Objectif palier SCALE : 12 heures (voir B12).

### B1.2 Ce qu'on livre avant le premier RDV

Un client qui paie 1 200 € et ne voit rien pendant trois semaines doute. Le
moteur livre de la valeur visible avant le premier envoi :

| Jour | Livrable client | Coût interne |
|---|---|---|
| J5 | **Carte du marché** : nombre de comptes adressables par segment (Sirene + filtres), répartition géographique, taille, estimation du nombre de mois de production disponibles | ~1 h (automatisé par LC-015) |
| J9 | Séquences et angles, avec le raisonnement | Inclus |
| J12 | **Liste des 50 premiers comptes** contactés, avec la raison (signal, score) | Automatique |
| J14 | Rapport de lancement : infrastructure, tests de placement, volumes prévus | Automatique |

### B1.3 Cycle de vie d'un rendez-vous

```
POSITIVE ─► qualification ─► créneaux proposés ─► booké ─► confirmation ─► J-1 ─► SMS H-2 ─► tenu ─► J+1 retour client ─► J+30 statut
   │              │                                  │                                          │
   │         critères du                    fiche envoyée au                            no-show prospect :
   │         RDV qualifié                   commercial du client                        1 replanification,
   │         (contrat)                      (contexte, besoin, échanges)                facturé si tenu
   └── si critère manquant : RDV non booké, ou booké « non qualifié » avec accord explicite du client, non facturé
```

| Étape | SLA | Automatisation |
|---|---|---|
| Positive → réponse avec créneaux | < 1 h ouvrée | Brouillon IA, validation setter |
| Booking | Créneaux lus dans l'agenda du client (Cal, lien d'équipe) | LC-010 |
| Fiche RDV au commercial du client | À la réservation | Email + CRM du client si connecté |
| Confirmation | Immédiate | Email |
| Rappel J-1 | 24 h avant | Email, avec question « toujours bon pour demain ? » |
| Rappel H-2 | 2 h avant | SMS (numéro demandé au booking) |
| Retour client J+1 | Formulaire 3 champs : tenu / no-show prospect / annulé côté client, qualité 1-5 | Relance automatique à J+2 |
| Replanification no-show prospect | Dans les 48 h | Séquence de 2 messages |
| Statut J+30 | Perdu / en cours / signé + montant | Formulaire, relance J+33, point mensuel si absent (obligation contractuelle) |

---

## B2 — ICP discovery

### B2.1 Ce qu'on doit extraire

| Élément | Question qui le produit | Format de sortie |
|---|---|---|
| ICP | Qui sont vos 10 meilleurs clients, et qu'ont-ils en commun ? | Carte ICP : secteurs (NAF), taille, zone, signaux, valeur |
| Anti-ICP | Quels clients ne voulez-vous plus jamais ? Pourquoi ? | Liste d'exclusions + règles |
| Personas | Qui signe ? Qui utilise ? Qui bloque ? | 2-4 fiches personas |
| Douleurs | Quel problème vos clients avaient-ils la veille de signer ? | 3-5 douleurs, dans les mots des clients |
| Résultats attendus | Qu'est-ce qui a changé chez eux 6 mois après ? | Résultats chiffrés quand possible |
| Déclencheurs d'achat | Qu'est-ce qui s'est passé juste avant qu'ils vous appellent ? | Liste de signaux → A4 |
| Objections | Pourquoi les prospects disent non ? | Bibliothèque d'objections + réponses |
| Concurrents | Contre qui perdez-vous ? Pourquoi ? | Liste + angle de différenciation |
| Preuves | Chiffres, logos citables, témoignages | Bibliothèque de preuves (avec autorisation) |
| Cas clients | 2-3 histoires complètes | Fiches cas |
| Offres | Qu'est-ce qu'un prospect peut accepter en 15 minutes ? | Offre d'appel |

### B2.2 Questionnaire (avant l'appel)

Formulaire en ligne, ~25 minutes, enregistré dans `client_brief`.

1. Votre offre en deux phrases, comme vous la diriez à un client.
2. Prix : panier moyen, fourchette, récurrence.
3. Vos 20 à 50 meilleurs clients : **export CSV** (nom, site, secteur, taille,
   montant, date de signature). Ils servent au lookalike et à l'exclusion.
4. Vos clients actuels et prospects en cours : export complet pour exclusion.
5. Les secteurs ou entreprises à ne jamais contacter.
6. Zones géographiques couvertes, langues.
7. Qui signe chez vos clients (fonctions) ? Qui influence ?
8. Les trois raisons pour lesquelles on vous choisit.
9. Les trois raisons pour lesquelles on ne vous choisit pas.
10. Concurrents cités par vos prospects.
11. Cas clients publiables, avec chiffres.
12. Cycle de vente moyen, taux de signature après un premier RDV.
13. Qui reçoit les RDV chez vous ? Combien par semaine au maximum ?
14. Agenda de réservation (lien Cal ou accès à l'agenda).
15. CRM utilisé ; accord pour y créer les RDV ?
16. Qui envoie les emails (nom, fonction, photo, LinkedIn) ? Accord écrit.
17. Choix parmi 3 à 5 variantes de domaine d'envoi proposées.
18. Ce qui constitue pour vous un RDV qualifié (brouillon, finalisé à l'appel).

La question 13 alimente le plafond de capacité du client (B7, B11). La
question 3 est la plus précieuse : un ICP dérivé des vrais clients bat
toujours un ICP déclaré.

### B2.3 Appel ICP (90 minutes)

| Min. | Bloc | Objectif | Sortie |
|---:|---|---|---|
| 0-10 | Cadre | Rappeler ce qu'on construit, ce qu'on attend du client (retours J+1, J+30) | — |
| 10-30 | Clients gagnés | Parcourir 5 clients de l'export : comment ils sont arrivés, pourquoi ils ont signé | Déclencheurs, douleurs, personas |
| 30-45 | Clients perdus / mauvais clients | Anti-ICP, objections | Exclusions, objections |
| 45-60 | Offre d'appel | Ce qu'on propose au prospect, preuves disponibles | Offre, preuves |
| 60-75 | Définition du RDV qualifié | Critères précis : taille, fonction, besoin, zone | Brouillon d'annexe contractuelle |
| 75-90 | Logistique | Agenda, capacité, CRM, expéditeur, validation des domaines | Checklist technique |

L'appel est enregistré (avec accord) et transcrit ; LC-014 extrait un
brouillon de carte ICP, de personas et de bibliothèque d'objections avec
Claude Sonnet 5, que le campaign manager corrige. Gain : ~3 heures par
onboarding.

### B2.4 Lookalike à partir des meilleurs clients

```
Export clients (CSV) ─► rapprochement SIREN (API Recherche d'entreprises)
                    ─► distribution NAF, tranche d'effectif, département, âge
                    ─► profils dominants (ex. : 60 % NAF 62.02A, 20-99 salariés, IDF + Rhône)
                    ─► requêtes Sirene + Apollo pour trouver les comptes semblables
                    ─► exclusion des clients actuels
```

Règle : si l'export contient moins de 10 clients, le lookalike n'a pas de
valeur statistique ; on part de l'ICP déclaré et on le teste (B9).

---

## B3 — ICP → requêtes exploitables

### B3.1 Table de traduction

| Attribut ICP | Sirene / API Recherche d'entreprises | Apollo | Sales Navigator | Clay / scraping |
|---|---|---|---|---|
| Secteur | `activite_principale` (code NAF), `section_activite_principale` | Industry + keywords | Industry | Classification IA du site |
| Taille | `tranche_effectif_salarie` (codes 11 = 10-19, 12 = 20-49, 21 = 50-99, 22 = 100-199, 31 = 200-249) | `# Employees` | Company headcount | — |
| Catégorie | `categorie_entreprise` (PME, ETI, GE) | — | — | — |
| Zone | `departement`, `region`, `code_postal` | Location (HQ) | Geography | — |
| Actif | `etat_administratif = A` | — | — | — |
| Âge | Date de création (filtre après appel) | Founded year | — | — |
| CA | — (Pappers) | Revenue (couverture faible en FR) | — | Pappers API |
| Fonction décideur | — | Titles + seniority | Function, seniority | — |
| Techno | — | Technologies | — | BuiltWith, TheirStack |
| Recrutement | — | Job postings (limité) | Hiring on LinkedIn | France Travail API, TheirStack |
| Croissance | — | Headcount growth | Headcount growth | — |

### B3.2 Exemple complet

Client fictif : cabinet de conseil en performance industrielle, valeur client
~25 000 €, cible des sites industriels de 50 à 250 salariés en
Auvergne-Rhône-Alpes, décideur = directeur d'usine ou directeur des
opérations.

**1. Comptes (Sirene, gratuit)**

```
GET https://recherche-entreprises.api.gouv.fr/search
    ?section_activite_principale=C            # industrie manufacturière
    &tranche_effectif_salarie=21,22,31        # 50-249 salariés
    &region=84                                # Auvergne-Rhône-Alpes
    &etat_administratif=A
    &per_page=25&page=1..N
```

(Paramètres à vérifier dans la documentation de l'API au moment de
l'implémentation ; la pagination et le débit sont limités, LC-015 gère les
pauses.)

→ Filtre NAF fin sur les divisions pertinentes, exclusion des SIREN clients,
calcul du nombre de comptes : c'est la **carte du marché** livrée à J5.

**2. Contacts (Apollo)**

- Company domains = domaines trouvés à l'étape 1 (rapprochement par API
  Apollo `organizations/enrich` ou par nom + ville) ;
- Person titles : « directeur d'usine », « directeur de site », « directeur
  des opérations », « directeur industriel », « plant manager », « COO » ;
- Seniority : director, VP, owner.

**3. Compléments (Sales Navigator, manuel ou export autorisé)**

Pour les comptes A sans contact trouvé : recherche par compte, titre, zone.
Saisie dans Postgres via un formulaire, pas de scraping.

**4. Enrichissement**

FullEnrich (waterfall) sur les contacts sans email ; MillionVerifier ;
Pappers (CA, dirigeants).

**5. Signaux**

France Travail : offres de « responsable amélioration continue », « ingénieur
méthodes », « directeur de production » dans les SIRET de la liste (un
recrutement de ce type signale un chantier de performance : angle direct).

### B3.3 Workflow concret (LC-015)

```
brief ICP ─► générateur de requêtes (table B3.1) ─► Sirene : comptes
                                                  ─► Apollo : contacts par domaine
                                                  ─► France Travail : signaux
         ─► fusion / dédup (A3) ─► enrichissement ─► vérification ─► score client
         ─► segments ─► carte du marché (J5) + plan de renouvellement (segments 1-2-3)
```

Le générateur de requêtes est une fonction qui prend la carte ICP (JSON) et
produit les requêtes des trois sources. Une modification de l'ICP régénère les
requêtes ; l'historique est gardé (`icp_version`).

---

## B4 — Lead Data Engine

Même pipeline que le moteur A (A3), avec quatre différences.

### B4.1 Isolement par client

Chaque ligne `lead` (un contact dans le contexte d'un client) porte
`client_id`. La table `contact` (la personne) et `company` (l'entreprise)
sont partagées **techniquement** pour dédoublonner et ne pas payer deux fois
l'enrichissement, mais :

- un client ne voit jamais les leads d'un autre ;
- l'historique d'échanges d'un contact avec le client X n'est jamais utilisé
  pour la campagne du client Y ;
- la question de savoir si Leadcore peut réutiliser un contact enrichi pour
  un autre client (Leadcore responsable de traitement de sa propre base, ou
  sous-traitant de chaque client) est un **point juridique à valider**
  ([08-CONFORMITE §H4](08-CONFORMITE.md)). En attendant, la règle
  conservatrice s'applique : les données de contact sont re-sourcées par
  client, seules les données d'entreprise (Sirene, publiques) sont partagées.

### B4.2 Plafond de fréquence inter-clients

Un même contact ne reçoit pas plus d'**un fil de prospection opéré par
Leadcore par période de 60 jours**, tous clients confondus. Deux raisons :
le prospect ne distingue pas les expéditeurs mais il se lasse, et un
destinataire qui signale plusieurs expéditeurs abîme toute la réputation de
Leadcore. Le contrôle Q4 (A9.3) l'applique.

### B4.3 Exclusivité

Leadcore ne travaille pas pour deux concurrents directs sur la même zone
(même offre, même ICP). Règle à écrire dans le contrat (exclusivité niche ×
zone pendant la durée du contrat). Sans elle, B4.2 bloque le second client
dès le premier mois.

### B4.4 Score client

Le score ICP est propre à chaque client (B2) : mêmes mécanismes que A1
(éliminatoires + points), poids initiaux dérivés du lookalike, recalibrés
après 100 RDV tenus avec le statut J+30. Le score **J+30** est la seule vraie
vérité : un segment qui produit des RDV qui ne signent jamais est un mauvais
segment, même s'il répond bien.

### B4.5 Segmentation

| Dimension | Exemples | Règle |
|---|---|---|
| Secteur | NAF, sous-niche | Un angle par secteur si les douleurs diffèrent |
| Taille | 10-49, 50-249 | Les personas changent avec la taille |
| Zone | Région | Utile si l'offre du client est locale |
| Persona | Dirigeant, directeur métier | Une séquence par persona |
| Signal | Recrutement, nouveau dirigeant, aucun | Le signal change l'angle et la priorité |
| Palier | A, B, C | Change le niveau de personnalisation |

Taille minimale d'un segment : **300 contacts** (en dessous, aucun test n'est
lisible, voir B9). Taille visée du segment 1 : 2 mois de production, soit
~3 800 contacts pour un client BASE.

---

## B5 — Client Campaign Engine

### B5.1 La méthode, par segment

```
ICP ─► SIGNAL ─► PERSONA ─► ANGLE ─► OFFER ─► SEQUENCE ─► PERSONALIZATION
 │        │         │          │        │          │              │
segment  A4 +     fiche     angle     offre     4 touches      N2/N3/N4
(B4.5)   déclen-  persona   dérivé    d'appel   (A6.structure) (A10)
         cheurs   (B2)      de la     (B2)
         client             douleur
```

Pour chaque segment, le campaign manager remplit un **brief de campagne**
(table `campaign_brief`) :

| Champ | Contenu |
|---|---|
| Segment | Définition exacte + taille |
| Hypothèse | « Les directeurs d'usine de 50-250 salariés en AURA qui recrutent un ingénieur méthodes ont un chantier de performance ouvert » |
| Signal | Signal requis ou préférentiel |
| Persona | Fiche |
| Douleur | Dans les mots des clients du client |
| Angle | 1 principal + 1 secondaire (touche 3) |
| Offre | Ce que le prospect accepte : « diagnostic de 30 min sur site » |
| Preuve | Cas client utilisable |
| CTA | Question ouverte (C) / créneaux (A) |
| Critère de succès | Positif ≥ 1,5 % à 1 000 contacts |
| Critère d'arrêt | Voir B9 |

### B5.2 Lancement : trois angles en parallèle

Le premier mois teste **trois angles** sur le segment 1, un tiers du volume
chacun. Au lieu d'attendre qu'un angle échoue pour essayer le suivant, on les
fait courir ensemble. C'est la seule manière d'avoir un gagnant en 4 à 6
semaines (voir les tailles d'échantillon en B9).

Sources des trois angles :

1. la douleur n°1 citée par les meilleurs clients du client (B2.3) ;
2. le déclencheur d'achat le plus fréquent (signal) ;
3. un angle de la bibliothèque Leadcore qui a gagné dans la même niche chez
   un autre client (B8.4), s'il existe.

### B5.3 Écriture

Mêmes règles que A6. Deux ajouts pour la delivery :

- l'email parle au nom du client, avec la voix du client : on relit les
  emails que le client écrit lui-même avant d'écrire les siens ;
- le client valide les séquences **une fois**, au lancement. Les variantes
  de test suivantes restent dans le cadre validé (angles, offres, ton) et ne
  repassent pas en validation, sauf changement d'offre ou de preuve. Clause
  à écrire au contrat.

---

## B6 — Infrastructure outbound client

### B6.1 Dimensionnement selon le volume

Chiffres produits par `tools/simulateur_os.py --objectif N` (entonnoir BASE,
30 envois/boîte/jour, 25 % de réserve, 3 boîtes/domaine).

| RDV honorés visés / mois | Contacts uniques / mois | Emails / mois | Boîtes actives | Boîtes provisionnées | Domaines | Réponses à traiter | Heures opérateur |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 8 (bas de promesse) | 1 293 | 5 172 | 9 | 12 | 4 | 81 | 25 |
| 12 (haut de promesse) | 1 939 | 7 758 | 13 | 17 | 6 | 122 | 31 |
| 20 (objectif interne) | 3 232 | 12 929 | 21 | 27 | 9 | 204 | 43 |
| 30 (sur-livraison ×2,5) | 4 848 | 19 394 | 31 | 39 | 13 | 305 | 58 |

**Règle de dimensionnement** : le parc est construit pour **l'objectif
interne (20)**, pas pour la promesse (8-12). La différence coûte ~70 €/mois de
boîtes et de domaines ; elle évite de devoir chauffer un second parc trois
semaines quand le client veut accélérer.

### B6.2 Configuration

| Élément | Règle |
|---|---|
| Domaines | Au nom du client (variantes validées au questionnaire), jamais son domaine principal |
| Propriété | Domaines et boîtes achetés par Leadcore, refacturés dans le setup ; **à la sortie, transfert au client sur demande** (clause MAJ-OFFRE §2, point 5, à trancher) |
| DNS | A7.3, DMARC `p=none` puis `quarantine` à 30 jours ; rapports agrégés vers une adresse Leadcore |
| Mix | 70 % Google / 30 % Microsoft au-delà de 15 boîtes |
| Expéditeurs | 2 à 3 personnes réelles du client (dirigeant, commercial), avec accord écrit et page LinkedIn cohérente |
| Warm-up | A8, 14 jours minimum |
| Volume | 30/boîte/jour au plafond |
| Rotation | Les boîtes en réserve remplacent une boîte en pause en < 24 h (elles sont déjà chaudes) |
| Repos | Une boîte dont le taux de réponse passe sous 50 % de la moyenne sur 300 envois passe 7 jours au warm-up seul |
| Monitoring | A7.7, par client et par boîte ; alertes vers l'opérateur du client |

### B6.3 Pool de réserve Leadcore

Au palier STANDARD, Leadcore garde un **stock de domaines neutres** (achetés
d'avance, sans nom de client) : ils ne servent pas à envoyer mais à vieillir.
Au paiement d'un nouveau client, on n'y puise pas (le domaine doit porter le
nom du client), mais le stock sert aux **tests de placement** et au moteur A.
Pour le moteur B, le seul vrai gain de vitesse est d'acheter les domaines à
J0 (automatisé).

---

## B7 — Overdelivery Engine

### B7.1 Ce que « 2× à 3× » veut dire ici

Le document de référence annonce 8 à 12 RDV par mois et vise 15 à 20 en
interne. Doubler ou tripler la **valeur** attendue par le client est
l'objectif, mais trois contraintes l'encadrent :

1. **Le client paie chaque RDV honoré.** À 200 €/RDV, 30 RDV font une facture
   variable de 6 000 € au lieu de 2 000 €. Sur-livrer en volume sans accord
   préalable surprend le client et peut le faire partir. Le contrat doit
   prévoir un **plafond mensuel de RDV facturables** choisi par le client, et
   un accord explicite avant de le dépasser. C'est une décision de pricing à
   prendre (voir [11-AUDIT-V2](11-AUDIT-V2.md)).
2. **La capacité de closing du client.** Au-delà de ce que ses commerciaux
   absorbent (question 13 du questionnaire), un RDV de plus dégrade le suivi
   des autres, et le taux de signature J+30 baisse. Le client juge Leadcore
   sur le CA signé, pas sur les RDV.
3. **La définition du RDV qualifié ne bouge pas.** Sur-livrer en relâchant la
   qualification est interdit.

Donc la sur-livraison se mesure en **valeur** : RDV qualifiés × taux de
signature J+30 × valeur moyenne, plus ce que le client obtient en dehors des
RDV (connaissance du marché, base, messages qui marchent). L'objectif de 2 à
3× s'applique à cette valeur, **dans le plafond de capacité et de budget du
client**.

```
valeur livrée = Σ RDV honorés × P(signé à J+30) × valeur client
              + valeur des actifs livrés (intelligence, base, playbook)

levier volume   → plus de RDV (dans le plafond)
levier qualité  → P(signé) plus haute
levier stratégie→ valeur client plus haute (meilleurs segments), actifs
```

### B7.2 Catalogue des leviers

Notation de 1 (faible) à 5 (fort). **Priorité** = impact × scalabilité ÷
(effort × coût), arrondie.

| Levier | Famille | Ce qu'on fait | Impact | Effort | Coût | Scalabilité | Priorité |
|---|---|---|---:|---:|---:|---:|---:|
| Signal-first sur les comptes A | Qualité | Contacter d'abord les comptes avec un signal frais (A4) | 5 | 2 | 1 | 5 | **12,5** |
| Cadence de rappels 4 touches + SMS | Volume (présence) | Passer de ~60 % à ~75-85 % de présence | 4 | 1 | 1 | 5 | **20** |
| Réponse < 1 h aux positives | Qualité | SLA A11, notifications | 4 | 2 | 1 | 4 | **8** |
| Trois angles en parallèle au lancement | Volume / qualité | B5.2 | 4 | 2 | 1 | 5 | **10** |
| Réactivation des « plus tard » | Volume | Nurture NOT_NOW à la date donnée | 3 | 1 | 1 | 5 | **15** |
| Multithreading (2e décideur du compte) | Volume | Si le 1er ne répond pas après 4 touches, contacter un 2e persona 30 j plus tard | 3 | 2 | 1 | 5 | **7,5** |
| Referrals (« voyez avec X ») | Volume | Contact de X en < 4 h | 2 | 1 | 1 | 5 | **10** |
| Recherche profonde N4 sur comptes A | Qualité | A10 | 4 | 3 | 3 | 3 | 1,3 |
| LinkedIn en 2e canal (comptes A) | Canal | Profil du client, 20 invitations/jour, message après acceptation | 3 | 3 | 2 | 2 | 1 |
| Appel téléphonique sur positives non bookées | Canal | Un appel du setter quand un positif ne répond plus depuis 48 h | 3 | 2 | 2 | 3 | 2,3 |
| Relance des no-shows | Volume | Replanification en 48 h | 3 | 1 | 1 | 5 | **15** |
| Reactivation de la base du client | Canal | Emailing aux anciens prospects **du client** (sa base, sa responsabilité juridique) | 4 | 2 | 1 | 3 | **6** |
| Segments 2 et 3 prêts avant épuisement | Volume | Plan de renouvellement (MAJ-OFFRE) | 4 | 2 | 2 | 4 | **4** |
| Rapport d'objections mensuel | Stratégie | Toutes les objections classées, avec fréquence et réponses qui ont marché | 3 | 1 | 1 | 5 | **15** |
| Intelligence marché (segments qui répondent) | Stratégie | Tableau par segment : taux de réponse, positif, signature | 4 | 1 | 1 | 5 | **20** |
| Veille concurrentielle (concurrents cités par les prospects) | Stratégie | Extraction IA des mentions de concurrents dans les réponses | 3 | 1 | 1 | 5 | **15** |
| Affinage ICP à J+30 | Stratégie | Recalibrer le score client sur les signatures | 5 | 2 | 1 | 4 | **10** |
| Livraison de la base enrichie en fin de contrat | Stratégie | Comptes et scores (dans le respect du RGPD, voir H) | 2 | 1 | 1 | 5 | **10** |
| Nouveaux personas | Revenu | Tester un persona adjacent (ex. DAF en plus du DG) | 3 | 2 | 1 | 4 | **6** |
| Nouvelle verticale / géographie | Revenu | Segment test de 500 comptes par trimestre | 4 | 3 | 2 | 3 | 2 |
| Nouvelle offre d'appel | Revenu | Tester une offre plus facile à accepter (diagnostic, benchmark) | 4 | 2 | 1 | 4 | **8** |
| Lookalike des clients signés via Leadcore | Qualité | Chaque signature J+30 enrichit le lookalike | 4 | 1 | 1 | 5 | **20** |
| Préparation du RDV pour le commercial du client | Qualité (closing) | Fiche RDV enrichie (A14.2 adapté) | 4 | 1 | 1 | 5 | **20** |
| Coaching post-RDV (retour sur les pertes) | Qualité (closing) | Analyse des motifs de perte J+30, 30 min/mois | 3 | 2 | 1 | 3 | 4,5 |

### B7.3 Le menu de sur-livraison par mois

| Mois | Ce que le client reçoit en plus des RDV |
|---|---|
| M1 | Carte du marché (J5) ; 50 premiers comptes et leur raison (J12) ; rapport de lancement |
| M2 | Intelligence marché : segments qui répondent, premiers taux ; objections du mois ; concurrents cités |
| M3 | Revue trimestrielle : RDV, J+30 (CA signé, pipeline), ROI, affinage ICP, recommandations pour son équipe commerciale, plan du trimestre suivant |
| Chaque mois | Fiche de préparation pour chaque RDV ; réactivation des « plus tard » ; segment test si les résultats le permettent |

Ces livrables coûtent peu parce qu'ils sortent automatiquement des données
que le moteur produit déjà (B8, B10). C'est le cœur de la sur-livraison
scalable : **vendre au client ce que le moteur sait déjà**.

### B7.4 Règles de déclenchement

| Situation | Leviers activés |
|---|---|
| Client sous la promesse (< 8 RDV) à M2 | Tous les leviers de priorité ≥ 10 ; revue de ciblage ; offre d'appel plus facile |
| Client dans la promesse (8-12) | Leviers ≥ 10 + multithreading + segment 2 |
| Client au-dessus (> 12) et capacité disponible | Proposer au client de relever le plafond ; LinkedIn sur comptes A |
| Client au-dessus et capacité saturée | Ne pas augmenter le volume ; basculer vers la qualité (comptes A, valeur plus haute) et les livrables stratégiques |

---

## B8 — Boucle d'apprentissage

```
CAMPAIGN ─► DATA ─► RESULTS ─► ANALYSIS ─► LEARNINGS ─► NEW HYPOTHESIS ─► NEW CAMPAIGN
   │          │         │           │            │               │               │
 brief     events   KPIs par     LC-020        table          table          campaign_brief
 B5.1      (05)     segment,     hebdo +       learning       experiment     v+1
                    angle,       Opus 5        (texte +       (B9)
                    variante     mensuel       preuves)
```

### B8.1 Données collectées automatiquement

Chaque envoi, réponse, classement, RDV, présence et statut J+30 écrit un
`event` horodaté, relié à la campagne, au segment, à l'angle, à la variante,
au palier et au signal. Sans cette granularité, on ne sait pas **pourquoi**
un mois a été bon.

### B8.2 Cadence d'analyse

| Fréquence | Qui | Quoi | Sortie |
|---|---|---|---|
| Quotidien | Automatique | Anomalies (A7.7, B11) | Alertes |
| Hebdomadaire (vendredi) | Campaign manager | Tests en cours (B9), segments, angles | Décisions : arrêter, continuer, dupliquer |
| Mensuel | Campaign manager + IA (Opus 5 sur l'export du mois) | Synthèse : ce qui a marché, ce qui a échoué, hypothèses | 3 `learning` + 2 `experiment` par client |
| Trimestriel | Direction | Apprentissages inter-clients par niche | Playbook de niche mis à jour |

### B8.3 Ce qu'est un apprentissage

Un apprentissage est une phrase **falsifiable**, reliée à ses preuves :

> « Dans la niche conseil industriel, l'angle "recrutement d'ingénieur
> méthodes" produit 2,4 % de positif contre 1,1 % pour l'angle générique
> "performance" (1 800 contacts chacun, 3 clients, août-septembre 2026). »

Pas « l'angle recrutement marche bien ».

### B8.4 Bibliothèque inter-clients

Les apprentissages sont agrégés **par niche**, anonymisés. Un nouveau client
d'une niche connue démarre avec les deux meilleurs angles de la niche et le
score de la niche (B5.2, angle 3). C'est l'avantage cumulatif de la
spécialisation, et l'argument principal pour trancher la niche (MAJ-OFFRE
§5) : sans niche, aucun apprentissage ne se transfère.

---

## B9 — A/B testing

### B9.1 La contrainte statistique

Les taux sont bas, les échantillons petits. Pour détecter une différence avec
80 % de puissance et 5 % de risque (test bilatéral) :

| Métrique | A | B | Contacts nécessaires **par variante** |
|---|---:|---:|---:|
| Positif | 1,5 % | 3,0 % (×2) | 1 531 |
| Positif | 1,5 % | 2,5 % (×1,7) | 3 073 |
| Positif | 1,5 % | 2,25 % (×1,5) | 5 131 |
| Réponse | 5 % | 7,5 % | 1 468 |
| Réponse | 6 % | 9 % | 1 206 |
| Réponse | 6 % | 8 % | 2 551 |

Un client BASE produit 1 900 contacts par mois. **Conséquence directe** : chez
un seul client, on ne peut détecter en un mois que des effets de l'ordre de
×2 sur le taux de positif. Les « cycles de test très courts » de la
philosophie Blitzkrieg ne valent que pour les grosses différences. Pour les
petites, il faut :

1. tester sur le **taux de réponse** comme indicateur avancé (plus fréquent,
   donc plus rapide), puis confirmer sur le positif ;
2. **mutualiser** les tests entre clients de la même niche (même angle testé
   chez 3 clients) : c'est l'autre raison de choisir une niche ;
3. tester d'abord ce qui produit de gros écarts (segment, signal, offre),
   ensuite seulement ce qui en produit de petits (objet, formulation).

### B9.2 Ordre de test

| Rang | Variable | Écart typique attendu | Pourquoi dans cet ordre |
|---:|---|---|---|
| 1 | ICP / segment | Très fort | Le mauvais segment ne se rattrape pas par la copy |
| 2 | Signal | Fort | Change la pertinence du moment |
| 3 | Offre d'appel | Fort | Change le coût d'un « oui » pour le prospect |
| 4 | Persona | Moyen à fort | |
| 5 | Angle | Moyen | |
| 6 | CTA | Moyen | Question ouverte vs créneaux |
| 7 | Personnalisation (N1 → N3) | Moyen | |
| 8 | Séquence (nombre de touches, écart) | Faible à moyen | |
| 9 | Copy (formulation, longueur, objet) | Faible | Tester seulement en mutualisé |
| 10 | Timing (jour, heure) | Faible | Rarement la cause d'un échec |
| 11 | Canal (email seul vs email + LinkedIn) | Moyen, coûteux | Seulement sur comptes A |

### B9.3 Règles de décision

Méthode bayésienne simple (loi Bêta sur le taux de positif, a priori
faiblement informatif Bêta(1, 60) ≈ 1,6 %), calculée par LC-020.

| Règle | Condition | Décision |
|---|---|---|
| **Arrêt précoce pour échec** | ≥ 500 contacts sur la variante, 0 positif, et taux de réponse < 2 % | Arrêter la variante |
| **Arrêt pour délivrabilité** | Bounce > 2 % ou plainte détectée sur la variante | Arrêter immédiatement, enquêter (ce n'est plus un test de copy) |
| **Gagnant** | ≥ 800 contacts par variante **et** P(B > A) ≥ 95 % | B devient le témoin ; nouvelle variante contre lui |
| **Égalité pratique** | ≥ 1 500 contacts par variante et P(écart > 25 %) < 20 % | Garder la moins coûteuse ; tester autre chose |
| **Durée maximale** | 6 semaines | Décider sur la tendance, noter « non concluant » |
| **Duplication** | Un gagnant dans 2 clients de la même niche | Devient l'angle par défaut de la niche (B8.4) |

Allocation : 80 % du trafic sur le témoin gagnant, 20 % sur l'exploration
(une à deux variantes). Pas de test à plus de deux variantes par segment en
dessous de 3 000 contacts/mois.

### B9.4 Ce qu'on ne teste jamais

- Une variante qui modifie la définition du RDV qualifié.
- Une variante qui supprime l'identité de l'expéditeur ou le lien
  d'opposition.
- Une variante qui promet un résultat que le client ne peut pas tenir.

---

## B10 — Reporting client

### B10.1 Les quatre étages

| Étage | Métriques | Vu par le client | Commentaire |
|---|---|:---:|---|
| **ACTIVITÉ** | Contacts ajoutés, emails envoyés, segments actifs, campagnes | Mensuel, résumé | Rassure au démarrage, n'intéresse plus après M2 |
| | Taux d'ouverture | **Non** | Mesure non fiable (confidentialité Apple, passerelles) ; tracking désactivé |
| | Bounce, placement | Non (sauf incident) | Métriques internes |
| **ENGAGEMENT** | Réponses, réponses positives, taux | Hebdo | Montre que le marché réagit |
| | Objections et concurrents cités | Mensuel | Valeur stratégique (B7) |
| **VENTES** | RDV bookés, RDV honorés, show rate, RDV qualifiés vs non qualifiés | Hebdo | La base de la facture |
| | No-shows et replanifications | Hebdo | Transparence sur la politique no-show |
| **BUSINESS** | Opportunités ouvertes, pipeline (€), CA signé, ROI | Mensuel, à partir de M2 | Dépend du retour J+30 du client |

### B10.2 Le rapport hebdomadaire (automatique, lundi 9 h)

Une page, en français, générée par LC-019 :

```
Semaine 41 — Client X
RDV honorés : 3 (cumul mois : 7 / promesse 8-12)
RDV à venir : 4 (dont 2 cette semaine)
Réponses positives : 6 · réponses totales : 27
No-show : 1 (replanifié jeudi)
Ce qui marche : segment « usines 50-99 salariés, recrutement méthodes » (2,8 % de positif)
Ce qu'on change : on arrête l'angle « coûts énergétiques » (0 positif sur 620 contacts)
Action attendue de votre part : statut J+30 de 3 RDV de septembre
```

### B10.3 Le rapport mensuel

| Section | Contenu |
|---|---|
| Résultats | RDV honorés, qualifiés, facturables ; comparaison à la promesse et au mois précédent |
| J+30 | Statut des RDV du mois précédent : perdu / en cours / signé + montant ; **coût par client signé** (MAJ-OFFRE) |
| ROI | CA signé cumulé ÷ dépenses Leadcore cumulées |
| Marché | Segments, taux par segment, volume restant par segment (plan de renouvellement) |
| Intelligence | Objections, concurrents, verbatims utiles |
| Tests | Ce qu'on a testé, ce qu'on a appris |
| Plan | Ce qu'on fait le mois prochain |

### B10.4 Dashboard

Un dashboard en lecture seule par client (Metabase ou page générée sur
Supabase), mêmes chiffres que les rapports, mis à jour chaque nuit. Le
client n'a jamais deux chiffres différents pour la même chose : toutes les
métriques viennent des mêmes vues SQL ([05-DONNEES](05-DONNEES.md)).

---

## B11 — Client success

### B11.1 Détection automatique

LC-022 calcule chaque nuit, par client, les indicateurs suivants et
déclenche les actions.

| Situation | Détection | Seuil | Action automatique | Action humaine | Délai |
|---|---|---|---|---|---|
| **Client satisfait** | RDV ≥ promesse **et** qualité moyenne J+1 ≥ 4/5 **et** retours J+30 à jour | 2 mois consécutifs | Demande de témoignage / recommandation (A15.4) | Proposer d'étendre (segment, plafond) | M3 |
| **Client sous-performant** | RDV honorés projetés < 8 sur le mois | Projection à J+15 du mois | Alerte campaign manager | Plan d'action écrit au client sous 48 h | 48 h |
| **Campagne sous-performante** | Positif < 50 % de la moyenne du client | 800 contacts | Réduction du trafic à 20 % | Revue de l'angle et du segment | Hebdo |
| **ICP incorrect** | RDV tenus jugés non pertinents par le client (qualité J+1 ≤ 2) **ou** 0 signé sur 15 RDV J+30 | 5 retours ≤ 2, ou 15 RDV | Alerte | Atelier ICP avec le client (B2 réduit) | 1 semaine |
| **Offre incorrecte** | Réponses nombreuses mais positif bas (réponse ≥ 5 %, positif < 0,7 %) ; objections « pas intéressé par X » dominantes | 1 000 contacts | Alerte | Tester une autre offre d'appel (B9 rang 3) | 1 semaine |
| **Suivi commercial insuffisant chez le client** | Retour J+1 absent sur > 30 % des RDV ; délai de réponse du commercial > 48 h ; annulations côté client ≥ 2/mois | Mensuel | Rappel automatique | Point avec le dirigeant du client ; rappel de la clause d'annulation à 50 % | 1 semaine |
| **Problème de capacité (client)** | RDV proposés à > 10 jours faute de créneaux ; plainte « trop de RDV » | 2 occurrences | Pause des nouveaux lots | Ajuster le plafond | 48 h |
| **Problème de délivrabilité** | Seuils A7.7 | Voir 07-PANNES | Pause des boîtes concernées | Diagnostic | Immédiat |
| **Épuisement du segment** | Volume restant < 2 mois de production | Continu | Alerte | Préparer le segment suivant (MAJ-OFFRE) | 2 semaines |
| **Retour J+30 manquant** | Statut absent à J+33 | Par RDV | Relance automatique | Point mensuel obligatoire | M+1 |
| **Risque de churn** | Score santé < 50 (ci-dessous) | Hebdo | Alerte direction | Appel du dirigeant de Leadcore | 72 h |

### B11.2 Score santé (0 à 100)

| Composante | Poids | Mesure |
|---|---:|---|
| RDV honorés vs promesse | 30 | 100 % de la promesse basse = 30 |
| Qualité J+1 moyenne | 20 | 5/5 = 20 |
| Retours J+30 à jour | 15 | % de RDV avec statut |
| Taux de signature J+30 | 15 | vs moyenne de la niche |
| Réactivité du client | 10 | Délai de réponse aux questions de Leadcore |
| Tendance | 10 | RDV du mois vs mois précédent |

---

## B12 — Scale engine

### B12.1 Montée en charge (scénario BASE)

Chiffres de `python3 tools/simulateur_os.py --section scale`.

| Clients | Palier outils | Outils / mois | Boîtes | Domaines | Contacts / mois | Emails / mois | Réponses / mois | RDV honorés / mois | ETP opérateurs | Encadrants | Coût direct / client | Marge brute totale / mois |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | ULTRA LEAN | 171 € | 17 | 6 | 1 900 | 7 600 | 120 | 12 | 0,2 | 0 | 1 364 € | 1 687 € |
| 5 | ULTRA LEAN | 171 € | 85 | 30 | 9 500 | 38 000 | 598 | 59 | 1,2 | 0 | 1 227 € | 9 121 € |
| 10 | STANDARD | 571 € | 170 | 60 | 19 000 | 76 000 | 1 197 | 118 | 2,4 | 0 | 1 250 € | 18 014 € |
| 25 | SCALE | 1 551 € | 425 | 150 | 47 500 | 190 000 | 2 992 | 294 | 5,9 | 1 | 1 255 € | 40 412 € |
| 50 | SCALE | 1 551 € | 850 | 300 | 95 000 | 380 000 | 5 985 | 588 | 11,8 | 2 | 1 224 € | 82 374 € |
| 100 | SCALE | 1 892 € | 1 700 | 600 | 190 000 | 760 000 | 11 970 | 1 176 | 23,6 | 4 | 1 212 € | 165 958 € |

### B12.2 Ce que le tableau montre

**Le coût direct par client ne baisse presque pas** entre 1 et 100 clients
(1 364 € → 1 212 €). Les outils partagés sont déjà amortis à 5 clients. Le
poste qui reste, c'est la main-d'œuvre : ~31 heures par client et par mois,
soit ~860 €, **70 % du coût direct**.

Donc la seule façon d'échapper à la linéarité, c'est de réduire les heures
par client. Le scénario SCALE (même simulateur, `--scenario SCALE`) suppose
1,5 min par réponse au lieu de 4 (classification et brouillons IA validés en
un clic), 7 heures fixes au lieu de 13 (reporting et analyse automatiques),
et la grille tarifaire établie :

| | BASE | SCALE |
|---|---:|---:|
| Heures opérateur / client / mois | 30,7 | 22,1 |
| Clients par opérateur | 4,2 | 5,9 |
| ETP opérateurs à 100 clients | 23,6 | 17,0 |
| Coût direct / client | ~1 212 € | ~1 046 € |
| Marge brute / client | ~1 700 € | ~3 700 € |

Même en SCALE, les heures restent le premier poste. La prochaine marche
(passer de 6 à 10 clients par opérateur) demande que l'IA traite seule les
classes `NOT_NOW`, `NEGATIVE`, `OOO`, `WRONG_PERSON`, `REFERRAL` (≈ 60 % des
réponses), et que l'humain ne touche plus que les positives, les questions et
les objections. Voir [11-AUDIT-V2](11-AUDIT-V2.md).

### B12.3 Unités par client (BASE, régime de croisière)

| Unité | Valeur | Source |
|---|---:|---|
| Coût marginal d'un client (hors encadrement) | ~1 200 € / mois | Simulateur |
| Temps opérateur | ~31 h / mois (SCALE : ~22 h) | Simulateur |
| Temps d'onboarding | 20-30 h, une fois (objectif 12 h) | B1 |
| Infrastructure | ~123 € / mois (boîtes + domaines) | Simulateur |
| Boîtes | 17 (13 actives) | B6.1 |
| Domaines | 6 | B6.1 |
| Contacts uniques | 1 900 / mois | Référence |
| Contacts bruts sourcés | ~3 200 / mois | Rendement 60 % |
| Emails | 7 600 / mois | 4 touches |
| Réponses à traiter | ~120 / mois | Référence |
| RDV honorés | ~12 / mois | Entonnoir BASE |
| Automatisations actives | 30 workflows partagés, 0 spécifique au client | [04-N8N](04-N8N.md) |

La dernière ligne compte : **aucun workflow n'est dupliqué par client**. Un
client est une ligne dans `client` et des paramètres dans `client_config`.
Ajouter le client n° 60 ne crée aucun workflow, aucun tableau, aucun
dashboard.
