# 01 — Moteur A : acquisition des clients de Leadcore

Partie de l'[Operating System outbound & delivery](README.md).

Le moteur A a un seul client : Leadcore. Il trouve, contacte, qualifie et
signe des PME B2B dont le client moyen vaut au moins 7 000 €. Il ne partage
avec le moteur B ni domaines, ni boîtes, ni compte de séquenceur, ni liste
d'opposition de campagne (la liste d'opposition **légale** est commune, voir
[08-CONFORMITE](08-CONFORMITE.md)).

```
                         MOTEUR A — vue d'ensemble

  ICP Leadcore ──► Sourcing ──► Pipeline de données ──► Signaux ──► Score
       (A1)          (A2)             (A3)               (A4)      (A1)
                                                                    │
       ┌────────────────────────────────────────────────────────────┘
       ▼
  Matrice stratégie ──► Angle ──► Séquence ──► Envoi ──► Réponse ──► Classement
       (A5)             (A6)       (A9)        (A7-8)     (A11)       (A11)
                                                                        │
       ┌────────────────────────────────────────────────────────────────┘
       ▼
  Setter ──► Booking ──► Closer ──► Proposition ──► Contrat ──► Paiement ──► Onboarding
   (A12)      (A12)      (A13)        (A14)          (A14)       (A14)       (→ B1)
```

---

## A1 — ICP Engine

### A1.1 L'ICP de Leadcore en règles machine

Le document de référence décrit la cible en mots. Le moteur la décrit en
filtres et en points. Deux étages :

1. **Filtres éliminatoires** (knock-out) : un seul échec suffit à exclure.
2. **Score de 0 à 100** sur les comptes qui passent, pour ordonner le travail.

#### Filtres éliminatoires

| # | Règle | Donnée | Source | Raison |
|---|---|---|---|---|
| K1 | Vend en B2B | NAF + analyse du site | Sirene, IA sur le site | Leadcore ne fait pas de B2C |
| K2 | Valeur client ≥ 7 000 € (ou récurrent équivalent) | Estimée : grille tarifaire publique, type d'offre, secteur | Site, IA, appel | Seuil de rentabilité du client (MAJ-OFFRE §1) |
| K3 | Entreprise active, ≥ 2 ans | Date de création, état administratif | Sirene | Une entreprise trop jeune n'a ni offre stable ni capacité de closing |
| K4 | Effectif 5 à 250 | Tranche d'effectif | Sirene, Apollo | En dessous : pas de capacité de vente. Au-dessus : cycle d'achat long, SDR internes |
| K5 | Au moins une personne qui vend (dirigeant commercial ou commercial dédié) | Titres des contacts | Apollo, Sales Nav | Sans capacité de closing, les RDV livrés meurent |
| K6 | Hors liste d'exclusion | Domaine, SIREN | Postgres `suppression` | Clients actuels, anciens clients, opposants, concurrents |
| K7 | Pas en procédure collective | Statut | BODACC / Pappers | Risque d'impayé |
| K8 | Zone : France. Belgique, Suisse romande et Luxembourg seulement après validation juridique ([08-CONFORMITE §H10](08-CONFORMITE.md)) | Adresse | Sirene, Apollo | Langue de delivery ; régimes de prospection différents hors de France |

#### Score ICP (0 à 100)

| Variable | Points max | Barème | Source |
|---|---:|---|---|
| Valeur client estimée | 20 | 7-15 k€ : 10 · 15-50 k€ : 16 · > 50 k€ : 20 | Site, IA, Pappers |
| Industrie (niche prioritaire) | 15 | Niche active : 15 · niche testée : 8 · autre : 0 | NAF + classification IA |
| Taille (effectif) | 10 | 10-50 : 10 · 5-9 : 6 · 51-250 : 7 | Sirene |
| CA | 5 | 1-20 M€ : 5 · 0,5-1 M€ : 3 · autre : 1 | Pappers |
| Équipe commerciale | 10 | ≥ 2 commerciaux : 10 · 1 : 6 · dirigeant seul : 3 | Apollo, Sales Nav |
| Croissance | 10 | Effectif +15 %/an : 10 · recrutements ouverts : 6 · stable : 2 | Sales Nav, France Travail |
| Dépendance à l'inbound / au réseau | 10 | Pas de publicité, pas d'outbound visible : 10 · SEO seul : 6 · déjà une agence outbound : 0 | Site, bibliothèques publicitaires, IA |
| Présence digitale | 5 | Site clair + preuves : 5 · site pauvre : 2 | IA sur le site |
| Maturité commerciale | 5 | CRM détecté, cas clients publiés : 5 | Technos (site), site |
| Signal actif (A4) | 10 | Somme pondérée des signaux, plafonnée à 10 | A4 |
| **Total** | **100** | | |

| Palier | Score | Traitement |
|---|---|---|
| A | ≥ 70 | Personnalisation par signal + recherche courte ; LinkedIn en second canal ; priorité de booking |
| B | 50-69 | Personnalisation par entreprise et persona |
| C | 35-49 | Séquence standard du segment ; tests d'angles |
| D | < 35 | Pas contacté ; réévalué si un signal apparaît |

Le score est **recalculé** à chaque nouveau signal et chaque trimestre.
Chaque recalcul écrit un `event` (voir [05-DONNEES](05-DONNEES.md)) : on
peut toujours expliquer pourquoi un compte a été contacté.

### A1.2 Calibrer le score

Les poids ci-dessus sont des hypothèses. Après 300 RDV tenus :

1. exporter les comptes contactés avec leur score et leur issue (RDV, signé) ;
2. comparer le taux de RDV par tranche de score (A/B/C) ;
3. si la tranche C produit autant de RDV que la B, le score ne discrimine
   pas : régression logistique simple sur les variables, nouveaux poids ;
4. versionner le modèle (`score_version`), ne jamais réécrire l'historique.

### A1.3 Le choix de la niche (sujet ouvert)

La niche reste à trancher (MAJ-OFFRE §5). Le moteur fournit une grille de
décision, pas la décision. Chaque critère noté de 1 à 5, pondéré :

| Critère | Poids | Mesure |
|---|---:|---|
| Valeur client moyenne | 20 % | ≥ 7 k€ requis ; plus c'est haut, mieux c'est |
| Taille du marché adressable en France | 15 % | Nombre de SIREN (Sirene, NAF) × taux d'ICP estimé ; minimum 3 000 comptes |
| Décideurs identifiables par email | 15 % | Taux de trouvaille sur un échantillon de 200 comptes |
| Douleur d'acquisition | 15 % | Part des comptes sans outbound visible |
| Capacité de closing typique | 10 % | Présence de commerciaux |
| Vitesse de preuve | 10 % | Cycle de vente du client < 60 jours |
| Réutilisabilité (angles, preuves) | 10 % | Les clients se ressemblent-ils ? |
| Risque réglementaire | 5 % | Secteurs réglementés (santé, finance) = note basse |

Candidats à tester (hypothèses, à noter avec des données de la semaine 1) :
agences B2B spécialisées, cabinets de conseil, éditeurs SaaS B2B verticaux,
ESN et intégrateurs, sous-traitants industriels, organismes de formation B2B,
cabinets de recrutement. **Méthode** : trois niches, 600 contacts chacune,
même séquence de base, 4 semaines. On garde celle qui produit le plus de RDV
tenus par 1 000 contacts, à valeur client comparable.

---

## A2 — Sourcing des prospects Leadcore

### A2.1 Sources comparées

| Source | Ce qu'elle donne | Couverture PME FR | Coût indicatif | Risque | Usage retenu |
|---|---|---|---|---|---|
| **Sirene / API Recherche d'entreprises** | Comptes : SIREN, NAF, effectif, adresse, date de création | Exhaustive | Gratuit | Nul | Squelette de comptes, filtres K1-K4, K8 |
| **Pappers API** | CA, résultat, dirigeants, procédures | Exhaustive (sociétés déposant leurs comptes) | ~20 €/mois + jetons | Faible | K7, variable CA, nom du dirigeant |
| **Apollo** | Contacts nominatifs, titres, emails, technos | Moyenne hors tech | 49-119 $/siège/mois | Moyen (qualité variable) | Contacts, titres, équipe commerciale |
| **LinkedIn Sales Navigator** | Personnes, titres, croissance d'effectif, changements de poste | Très bonne | ~91-121 €/mois | Faible en usage manuel, élevé en scraping | Construction et vérification de listes de comptes A ; signaux de changement de poste |
| **Google Maps (via Apify / Outscraper)** | Entreprises locales, site, téléphone | Bonne pour les services locaux | ~2-5 $/1 000 lignes | Moyen (CGU) | Verticales locales uniquement |
| **Sites web (crawl)** | Offre, prix, preuves, recrutement | — | Coût du crawl + IA | Faible sur pages publiques | Variables K2, présence digitale, dépendance inbound |
| **Annuaires professionnels / syndicats** | Membres d'une profession | Variable | Gratuit à faible | Vérifier les CGU | Niches précises (ex. : Syntec, fédérations) |
| **Offres d'emploi (France Travail, TheirStack)** | Recrutements en cours | Très bonne (FT) | FT gratuit ; TheirStack dès 59 $/mois | Nul | Signaux A4 |
| **Levées de fonds (presse, bases)** | Montant, date | Bonne pour startups | Gratuit (veille) à payant | Nul | Signal A4 |
| **Technographie (BuiltWith, Wappalyzer, TheirStack)** | CRM, outils marketing | — | Variable | Nul | Maturité commerciale |
| **Intent data tierce (Bombora…)** | Intérêt thématique | Faible en France | Élevé | Qualité douteuse en FR | Non retenu avant le palier SCALE |
| **Social (posts LinkedIn, événements)** | Activité, prises de parole | — | Manuel ou outils | Moyen | Personnalisation des comptes A |

### A2.2 Quatre configurations

Hypothèse de volume : 3 400 contacts envoyables par mois (4 clients signés
par mois, voir A15).

| Configuration | Composition | Coût mensuel | Coût / contact envoyable | Quand |
|---|---|---:|---:|---|
| **LOW COST** | Sirene + crawl du site + Dropcontact (Starter/Growth) + MillionVerifier | ~80-150 € | ~0,03-0,05 € | Tests de niche, budget serré, niches où les emails se devinent bien (dirigeant = décideur) |
| **STANDARD** | Sirene + Pappers + Apollo Basic (1 siège) + FullEnrich en waterfall + MillionVerifier | ~250-400 € | ~0,08-0,12 € | Recommandé pour la phase 0 → 25 clients |
| **HIGH VOLUME** | STANDARD + Clay Launch pour prototyper + 2 sièges Apollo + TheirStack | ~600-900 € | ~0,10-0,15 € | 8 signatures/mois et plus |
| **PREMIUM** | HIGH VOLUME + Sales Navigator pour chaque setter + recherche IA profonde sur les comptes A | ~1 200-1 800 € | ~0,20-0,40 € | Quand les comptes A représentent > 30 % des RDV |

> **RECOMMANDATION** — Configuration STANDARD dès le premier jour.
> **POURQUOI** — Sirene donne les comptes gratuitement ; Apollo donne les
> contacts ; le waterfall ne facture que les emails trouvés, ce qui protège le
> coût par contact quand la couverture Apollo est faible.
> **ALTERNATIVES** — LOW COST si la niche a des dirigeants-décideurs aux
> emails prévisibles ; Clay seul si l'équipe préfère une interface à n8n.
> **COÛT** — ~300 €/mois pour ~3 400 contacts envoyables.
> **QUAND CHANGER** — Passer en HIGH VOLUME quand le rythme dépasse 8
> signatures/mois ou quand le test d'un nouveau segment prend plus d'une
> semaine.
> **RISQUE** — Qualité Apollo variable : la vérification (A3) n'est pas
> optionnelle.

---

## A3 — Pipeline de données prospects

```
 SOURCE ─► SCRAPE ─► NORMALIZE ─► DEDUP ─► ENRICH ─► VERIFY ─► SCORE ─► SEGMENT ─► CAMPAIGN
   │         │           │          │         │         │         │         │          │
 Sirene    crawl      noms,       clé      waterfall  statut    A1 +      règles    séquenceur
 Apollo    site,      domaines,   SIREN    email,     email,    signaux   A5        A (API)
 SalesNav  offres     titres,     domaine  Pappers,   catch-all                      
 FT API    d'emploi   téléphones  email    IA site                                   
   │         │           │          │         │         │         │         │          │
 LC-001    LC-001     LC-001     LC-001    LC-002    LC-002    LC-003    LC-004     LC-007
```

Les numéros LC-xxx renvoient aux workflows de [04-N8N](04-N8N.md).

| Étape | Entrée | Sortie | Automatisation | Contrôle qualité |
|---|---|---|---|---|
| **SOURCE** | Requête (filtres NAF, effectif, zone ; recherche Apollo sauvegardée) | Lignes brutes `raw_record` avec `source`, `source_id`, date | LC-001 planifié chaque lundi ; import manuel CSV possible (Sales Nav) | Volume attendu vs obtenu ; alerte si < 50 % |
| **SCRAPE** | Domaines | Texte des pages clés (accueil, offre, tarifs, références, recrutement) | Crawl limité à 5 pages par domaine, robots.txt respecté | Taux d'échec du crawl < 15 % |
| **NORMALIZE** | Lignes brutes | Champs normalisés | Domaine en minuscules sans `www.` ni protocole ; raison sociale sans forme juridique ; prénom/nom capitalisés ; titre → fonction normalisée (`ceo`, `head_sales`, `sales_rep`…) par table + IA si ambigu ; téléphone en E.164 | Échantillon de 20 lignes relu à chaque nouvelle source |
| **DEDUP** | Lignes normalisées | Un `company` par SIREN ou domaine ; un `contact` par email ou (prénom, nom, domaine) | Clés : `siren` > `domain` pour les comptes ; `email_normalized` > (`first`, `last`, `domain`) pour les contacts ; fusion en gardant la valeur la plus récente par champ, avec sa source | Doublons résiduels < 1 % sur échantillon |
| **ENRICH** | Contacts sans email, comptes sans données | Email, CA, dirigeants, technos, résumé IA de l'offre | Waterfall : Apollo → FullEnrich (→ Dropcontact pour l'Europe) ; Pappers ; Haiku sur le texte du site | Taux de trouvaille par fournisseur suivi chaque semaine |
| **VERIFY** | Emails | `valid`, `catch_all`, `invalid`, `unknown` | MillionVerifier en masse ; revérification si l'email a > 90 jours | Bounce réel < 2 % ; si > 2 %, gel de la source |
| **SCORE** | Comptes + signaux | `icp_score`, `tier` | LC-003 | Distribution des paliers stable semaine à semaine |
| **SEGMENT** | Comptes scorés | `segment_id` | Règles A5 | Chaque segment ≥ 300 contacts, sinon fusion |
| **CAMPAIGN** | Contacts d'un segment | Leads dans le séquenceur | LC-004 → LC-007 via API | Aucun contact supprimé, aucun doublon inter-campagnes |

### Traitement des catch-all

Un domaine catch-all accepte tout : le vérificateur ne peut pas conclure. Dans
les PME, la part est élevée (à mesurer, voir 00-RECHERCHE §4).

| Cas | Décision |
|---|---|
| Email `valid` | Envoyé |
| Email `catch_all` trouvé par Apollo ou FullEnrich (pas deviné) | Envoyé, **plafonné à 20 % du volume quotidien d'une boîte** |
| Email `catch_all` deviné par motif (prenom.nom@) | Envoyé seulement pour les comptes A, avec le même plafond |
| `invalid`, `unknown` | Jamais envoyé |
| Rebond dur sur un domaine catch-all | Tout le domaine passe en « deviné interdit » |

---

## A4 — Signal Engine

Un signal est un fait daté, observable publiquement, qui augmente la
probabilité qu'un compte ait besoin de Leadcore **maintenant**.

### A4.1 Catalogue des signaux

| Signal | Source | Méthode de détection | Fraîcheur utile | Poids | Angle associé (A6) |
|---|---|---|---:|---:|---|
| Offre d'emploi commercial / SDR / business developer | API France Travail, TheirStack, pages carrières | Requête quotidienne sur codes ROME D1402, D1406, M1707 + mots-clés « business developer », « SDR », « chargé d'affaires » ; rapprochement SIRET | 45 jours | 10 | 4 Coût du recrutement, 1 Pipeline insuffisant |
| Offre d'emploi marketing / growth | Idem | Codes et mots-clés marketing | 45 j | 5 | 3 Dépendance à l'inbound |
| Nouveau directeur commercial / VP Sales | Sales Navigator (changements de poste) | Alerte de liste sauvegardée, import hebdo | 90 j | 9 | 9 Nouveau leader |
| Nouveau dirigeant | BODACC / Pappers (modification de dirigeant) | Flux BODACC filtré sur les SIREN suivis | 90 j | 6 | 9 Nouveau leader |
| Levée de fonds | Presse, bases de levées | Veille hebdo, rapprochement nom → SIREN | 120 j | 8 | 8 Croissance / expansion |
| Croissance d'effectif > 15 % sur 6 mois | Sales Navigator | Comparaison de l'effectif LinkedIn à 6 mois d'écart | 90 j | 6 | 8 Croissance |
| Nouvelle implantation / établissement | Sirene (nouveau SIRET) | Diff mensuel des établissements | 120 j | 6 | 7 Nouveau marché |
| Nouveau produit / nouvelle offre | Site (diff du crawl), communiqués | Crawl mensuel, diff des pages offre, résumé IA | 60 j | 5 | 6 Nouveau produit |
| Publicité active (LinkedIn Ads, Google Ads) | Bibliothèques publicitaires publiques | Contrôle mensuel des comptes A et B | 30 j | 4 | 11 Coût d'acquisition payant |
| Participation à un salon | Listes d'exposants | Import par salon | Jusqu'à la date + 30 j | 5 | 12 Événement |
| Publication d'un cas client / d'un prix | Site, LinkedIn | Diff du crawl | 60 j | 3 | Personnalisation seulement |
| Avis négatifs sur la réactivité commerciale | Avis publics | Non automatisé | — | 0 | Non utilisé (risque d'image) |

### A4.2 Calcul

```
signal_score(compte) = min(10, Σ poids_i × décroissance(âge_i))
décroissance(âge)    = 1                         si âge ≤ fraîcheur / 2
                     = 1 − (âge − f/2) / (f/2)   si f/2 < âge ≤ f
                     = 0                         au-delà
```

Un compte qui passe de B à A à cause d'un signal est poussé dans la file
prioritaire du jour (LC-004), avec l'angle du signal le plus fort.

### A4.3 Architecture

```
  France Travail API ──┐
  TheirStack ──────────┤
  BODACC / Pappers ────┤      ┌──────────────┐     ┌────────────┐     ┌───────────────┐
  Sales Nav (export) ──┼────► │ LC-016       │────►│ table      │────►│ LC-003        │
  Crawl diff ──────────┤      │ Signal       │     │ signal     │     │ re-score      │
  Veille levées ───────┤      │ ingestion    │     │ (Postgres) │     │ → file du jour│
  Salons (CSV) ────────┘      └──────────────┘     └────────────┘     └───────────────┘
                                rapprochement           dédoublonné par
                                SIREN / domaine         (compte, type, date)
```

Le rapprochement se fait par SIRET (France Travail le fournit souvent), sinon
par nom normalisé + code postal, sinon par domaine. Un rapprochement incertain
(score de similarité < 0,9) part en file de validation humaine ; il ne crée
pas de signal automatiquement.

---

## A5 — Outbound Strategy Engine

### A5.1 La matrice

```
ICP × PERSONA × SIGNAL × PAIN × ANGLE × OFFER × CTA
```

Chaque contact reçoit une combinaison **calculée**, pas choisie à la main.
L'ordre de décision :

```
1. PERSONA   ← fonction normalisée du contact
2. SIGNAL    ← signal actif le plus fort du compte (ou « aucun »)
3. PAIN      ← table (persona, signal) → douleur probable
4. ANGLE     ← angle gagnant actuel pour (segment, persona, signal) ;
               sinon angle par défaut de la douleur ; 20 % du trafic en exploration
5. OFFER     ← palier du compte : A → audit offert ; B/C → échange de 15 min
6. CTA       ← palier + canal : question ouverte (C), proposition de créneau (A)
```

### A5.2 Personas Leadcore

| Persona | Titres typiques | Ce qu'il possède | Ce qu'il craint | Pouvoir d'achat |
|---|---|---|---|---|
| Dirigeant fondateur (P1) | CEO, gérant, fondateur, associé | Le CA, la trésorerie | Payer pour du vent, perdre du temps | Décide seul |
| Directeur commercial (P2) | Directeur commercial, head of sales, VP sales | Le pipeline, l'objectif | Rater l'objectif, dépendre d'un prestataire qu'il ne contrôle pas | Décide ou recommande |
| Directeur marketing (P3) | CMO, responsable marketing, growth | Les leads | Qu'on mesure ses leads contre des RDV outbound | Recommande |
| Directeur général non fondateur (P4) | DG, COO | La croissance, les coûts | Les recrutements ratés | Décide |

### A5.3 Table de décision (extrait)

| Persona | Signal | Douleur probable | Angle par défaut | Offre | CTA |
|---|---|---|---|---|---|
| P1 | Recrutement commercial | Recruter coûte cher et prend 6 mois avant de produire | 4 Coût du recrutement | Échange 15 min | « Ça vaut 15 minutes avant de signer le recrutement ? » |
| P1 | Aucun | Le CA dépend du réseau du fondateur | 3 Dépendance à l'inbound / au réseau | Échange 15 min | Question ouverte |
| P2 | Nouveau poste (< 90 j) | Doit montrer du pipeline vite | 9 Nouveau leader | Audit de pipeline offert | Proposition de 2 créneaux |
| P2 | Aucun | Commerciaux qui prospectent au lieu de vendre | 2 Commerciaux sous-utilisés | Échange 15 min | Question ouverte |
| P2 | Levée de fonds | Objectifs relevés, équipe pas encore à l'échelle | 8 Croissance | Audit offert | 2 créneaux |
| P3 | Publicité active | Coût par lead payant en hausse | 11 Coût d'acquisition payant | Benchmark | Question ouverte |
| P4 | Nouvelle implantation | Ouvrir une région sans réseau local | 7 Nouveau marché | Échange 15 min | 2 créneaux |
| Tous | Salon | Pipeline de salon qui retombe en 3 semaines | 12 Événement | Échange 15 min | Question ouverte |

La table complète vit dans Postgres (`strategy_rule`), versionnée. Les
opérateurs la modifient, jamais le code des workflows.

---

## A6 — Bibliothèque d'angles

Règles d'écriture communes, tirées des benchmarks (00-RECHERCHE §3.5) et du
document de référence :

- premier email < 80 mots, une seule question ou un seul CTA ;
- le premier email vend la conversation, pas le service ;
- pas de lien, pas d'image, pas de pièce jointe dans le premier email ;
- identité claire de l'expéditeur et lien d'opposition dans chaque email
  (obligation légale, voir 08-CONFORMITE) ;
- 4 touches sur 14 à 18 jours ; la touche 4 est une rupture courte ;
- aucune promesse de résultat chiffré (« 15 RDV garantis ») ;
- tirets cadratins interdits dans les emails, relecture `stop-slop` sur
  chaque nouvelle séquence.

Variables disponibles : `{{prenom}}`, `{{societe}}`, `{{ligne_perso}}`
(générée, voir A10), `{{signal_fait}}` (le fait daté, ex. « votre offre de
business developer publiée le 12 septembre »), `{{ville}}`, `{{niche}}`,
`{{preuve}}` (cas client de la même niche quand il existe).

Chaque angle ci-dessous donne : ICP, persona, déclencheur, message (touche
1), CTA, objection attendue et réponse, relance.

### Angle 1 — Pipeline insuffisant

| | |
|---|---|
| ICP | Palier A-B, 10-50 salariés, valeur client ≥ 15 k€ |
| Persona | P1, P2 |
| Déclencheur | Aucun signal requis ; renforcé par une croissance d'effectif |
| CTA | Question ouverte |

> Objet : pipeline {{societe}}
>
> Bonjour {{prenom}},
>
> {{ligne_perso}}
>
> Quand un client vaut plus de 15 000 €, trois rendez-vous de plus par mois
> changent une année. Chez la plupart des {{niche}} que nous voyons, ces
> rendez-vous dépendent encore du réseau des associés.
>
> Combien de nouveaux rendez-vous qualifiés votre équipe tient-elle par mois
> aujourd'hui ?
>
> {{signature}}

**Objection** : « On a assez de leads. » → « Tant mieux. Dans ce cas, la
question devient la marge : à quel moment de l'année le pipeline baisse-t-il,
et est-ce que vous le voyez venir ? »

**Relance (J+3)** : « {{prenom}}, je reformule plus court : si votre équipe
avait 8 rendez-vous qualifiés de plus par mois, pourriez-vous les absorber ? »

### Angle 2 — Commerciaux sous-utilisés

| | |
|---|---|
| ICP | ≥ 2 commerciaux (K5 renforcé) |
| Persona | P2 |
| Déclencheur | Équipe commerciale ≥ 2 visible sur LinkedIn |
| CTA | Question ouverte |

> Objet : le temps de vos commerciaux
>
> Bonjour {{prenom}},
>
> Vos {{nb_commerciaux}} commerciaux passent sans doute une partie de la
> semaine à chercher qui appeler. C'est le temps le plus cher de l'équipe
> passé sur la tâche la moins payée.
>
> Nous prenons cette partie : ciblage, premiers contacts, qualification. Vos
> commerciaux reçoivent des rendez-vous dans leur agenda.
>
> Quelle part de leur semaine part en prospection aujourd'hui ?

**Objection** : « Mes commerciaux doivent prospecter, ça fait partie du
métier. » → « Nous ne remplaçons pas leur prospection sur les comptes
stratégiques. Nous ouvrons les comptes qu'ils n'auront jamais le temps de
travailler. »

**Relance** : cas chiffré de la niche si `{{preuve}}` existe ; sinon, une
question : « Si je vous envoie trois comptes de votre marché que nous
contacterions en premier, ça vous aide à juger ? »

### Angle 3 — Acquisition dépendante de l'inbound ou du réseau

| | |
|---|---|
| ICP | Pas de publicité, pas d'outbound visible, site avec formulaire de contact seul |
| Persona | P1, P3 |
| Déclencheur | Aucun ; score « dépendance » ≥ 6 |
| CTA | Question ouverte |

> Objet : d'où viennent vos clients
>
> Bonjour {{prenom}},
>
> {{ligne_perso}}
>
> J'ai l'impression que vos clients arrivent surtout par recommandation.
> C'est le meilleur canal, et le seul qu'on ne peut pas accélérer.
>
> Nous ajoutons un canal que vous pilotez : des rendez-vous avec des
> {{cible_du_prospect}} choisis sur vos critères, que vous payez quand ils ont
> lieu.
>
> Est-ce que la recommandation suffit à votre objectif de l'an prochain ?

**Objection** : « Le cold email, ça ne marche pas dans notre secteur. » →
« Le volume ne marche pas. Un ciblage serré sur des comptes qui ont un signal
(recrutement, nouvelle implantation) marche mieux que ce que la plupart des
gens ont reçu. Vous lisez ce message, par exemple. »

### Angle 4 — Coût du recrutement

| | |
|---|---|
| ICP | Tout palier avec signal « offre d'emploi commercial » |
| Persona | P1, P2, P4 |
| Déclencheur | Offre d'emploi commercial < 45 jours |
| CTA | Question liée au recrutement |

> Objet : votre recrutement de {{poste}}
>
> Bonjour {{prenom}},
>
> J'ai vu {{signal_fait}}.
>
> Un commercial met en général 4 à 6 mois à produire, et sa première tâche
> sera de se construire un pipeline. Nous pouvons remplir ce pipeline pendant
> ce temps, ou tester le marché avant que vous ne signiez le recrutement.
>
> Ça vaut 15 minutes avant de finaliser le poste ?

**Objection** : « On recrute justement pour internaliser. » → « Logique.
Nous pouvons préparer le terrain : le commercial arrive avec des rendez-vous
déjà posés et des segments testés. On s'arrête quand il est autonome. »

**Relance** : « Le poste est toujours ouvert, je suppose que le recrutement
avance. Je peux vous envoyer la liste des 20 comptes qu'on contacterait en
premier dans votre marché, sans engagement. »

### Angle 5 — Mauvais taux de conversion / leads de mauvaise qualité

| | |
|---|---|
| ICP | Publicité active ou formulaires multiples |
| Persona | P2, P3 |
| Déclencheur | Publicité active |
| CTA | Question ouverte |

> Objet : leads vs rendez-vous
>
> Bonjour {{prenom}},
>
> Vos campagnes génèrent des leads. La question que se posent la plupart des
> directeurs commerciaux, c'est combien deviennent des rendez-vous avec un
> décideur.
>
> Nous livrons l'étape d'après : des rendez-vous qualifiés selon une
> définition écrite avec vous, payés quand ils ont lieu.
>
> Quel est votre taux de passage de lead à rendez-vous aujourd'hui ?

### Angle 6 — Nouveau produit / nouvelle offre

| | |
|---|---|
| Déclencheur | Diff du site : nouvelle page offre < 60 j |
| Persona | P1, P2 |

> Objet : {{nom_offre}}
>
> Bonjour {{prenom}},
>
> J'ai vu que {{societe}} lance {{nom_offre}}. Une nouvelle offre a rarement
> les clients de l'ancienne : il faut trouver qui l'achète, et vite.
>
> Nous testons plusieurs segments en parallèle pendant 4 à 6 semaines, et
> vous voyez lesquels répondent avant d'investir en marketing.
>
> Vous savez déjà qui sont les premiers acheteurs ?

### Angle 7 — Nouveau marché / nouvelle région

| | |
|---|---|
| Déclencheur | Nouveau SIRET, annonce d'implantation, offre d'emploi dans une nouvelle région |
| Persona | P1, P4 |

> Objet : {{ville}}
>
> Bonjour {{prenom}},
>
> {{signal_fait}}. Ouvrir une région sans réseau local, c'est souvent six
> mois de salons et de recommandations avant les premiers clients.
>
> Nous pouvons poser des rendez-vous avec les {{cible_du_prospect}} de
> {{region}} dès le premier mois de l'implantation.
>
> Qui porte le développement de {{ville}} chez vous ?

### Angle 8 — Croissance / expansion (levée, forte embauche)

> Objet : après la levée
>
> Bonjour {{prenom}},
>
> Félicitations pour {{signal_fait}}. Les objectifs commerciaux montent en
> général plus vite que l'équipe qui doit les tenir.
>
> Nous ajoutons du pipeline qualifié sans ajouter de salaires fixes pendant
> que vous recrutez.
>
> Le plan de recrutement commercial suit-il le nouvel objectif ?

### Angle 9 — Nouveau leader commercial

| | |
|---|---|
| Déclencheur | Prise de poste < 90 j (P2) ou nouveau dirigeant |
| Offre | Audit de pipeline offert |
| CTA | 2 créneaux |

> Objet : vos 90 premiers jours
>
> Bonjour {{prenom}},
>
> Vous avez pris le poste chez {{societe}} {{signal_fait}}. Les premiers mois
> se jugent souvent sur le pipeline qu'on a su créer, pas sur celui qu'on a
> trouvé.
>
> Je vous propose un audit de 30 minutes : vos segments, ce qu'ils valent en
> outbound, et combien de rendez-vous on peut en attendre. Mardi 10 h ou
> jeudi 14 h ?

### Angle 10 — Benchmark

| | |
|---|---|
| ICP | Niche active avec au moins 20 clients analysés |
| Offre | Benchmark de la niche (taux de réponse, segments qui répondent) |

> Objet : benchmark {{niche}}
>
> Bonjour {{prenom}},
>
> Nous avons contacté {{nb_contacts}} décideurs de {{marche}} ces derniers
> mois pour des {{niche}}. Certains segments répondent quatre fois plus que
> d'autres.
>
> Je peux vous envoyer la synthèse d'une page : quels segments, quels
> messages, quels taux. Je vous l'envoie ?

**Condition** : n'utiliser que des chiffres **mesurés** par Leadcore,
agrégés et anonymisés, jamais des données d'un client identifiable.

### Angle 11 — Coût d'acquisition payant

> Objet : coût par client
>
> Bonjour {{prenom}},
>
> Vous investissez en {{canal_pub}}. Nous comparons souvent un coût par
> rendez-vous qualifié en publicité et en outbound pour des {{niche}} : les
> écarts sont souvent larges, dans un sens ou dans l'autre.
>
> Vous connaissez votre coût par rendez-vous qualifié aujourd'hui ?

### Angle 12 — Événement / salon

> Objet : {{nom_salon}}
>
> Bonjour {{prenom}},
>
> Vous exposez à {{nom_salon}}. Les contacts d'un salon refroidissent en trois
> semaines si personne ne les rappelle, et l'équipe est souvent prise par les
> clients en cours.
>
> Nous pouvons poser des rendez-vous avant le salon, sur votre stand, avec
> des comptes choisis. Ça vous intéresse pour cette édition ?

### Angle 13 — Audit gratuit

Réservé au palier A : un audit de 30 minutes de la stratégie d'acquisition.
Coût interne : ~1 h de closer. À ne proposer que si le taux de passage audit
→ proposition dépasse 40 % (mesuré par LC-012).

### Angle 14 — Déplacement d'un concurrent

| | |
|---|---|
| Déclencheur | Le prospect utilise une agence outbound visible (signature d'email, mention) ou vient d'y mettre fin |
| Règle | **Aucun dénigrement.** On parle du modèle (setup, J+30, paiement au RDV honoré), pas du concurrent |

> Objet : votre prospection externalisée
>
> Bonjour {{prenom}},
>
> Vous avez déjà travaillé avec une agence de prospection. La question que
> posent la plupart des clients dans ce cas : combien de rendez-vous livrés
> sont devenus du chiffre d'affaires ?
>
> Nous suivons chaque rendez-vous à 30 jours avec vous (perdu, en cours,
> signé), et vous ne payez que les rendez-vous tenus.
>
> Qu'est-ce qui n'avait pas marché la dernière fois ?

### Angle 15 — Opportunité de marché inexploité

> Objet : {{segment_voisin}}
>
> Bonjour {{prenom}},
>
> Vos références sont surtout des {{segment_actuel}}. Les {{segment_voisin}}
> ont souvent le même problème et moins de prestataires qui les sollicitent.
>
> Nous testons ce genre de segment en 4 semaines sur 500 comptes. Vous l'avez
> déjà envisagé ?

### Angle 16 — Rupture (touche 4, commune à tous)

> Objet : je clos
>
> Bonjour {{prenom}},
>
> Je n'insiste pas. Si le sujet revient (recrutement commercial, nouvelle
> offre, trimestre en retard), répondez simplement « plus tard » et je
> reviendrai vers vous au moment qui vous convient.

### Structure de séquence standard

| Touche | Jour | Contenu | Rôle |
|---|---:|---|---|
| 1 | J0 | Angle principal | 58 % des réponses selon le benchmark Instantly |
| 2 | J+3 | Réponse au même fil, 2 lignes, reformulation | |
| 3 | J+8 | Nouveau fil, angle secondaire ou preuve | Rattrape les contacts que l'angle 1 n'a pas touchés |
| 4 | J+15 | Rupture (angle 16) | Génère les « plus tard » → nurture |

---

## A7 — Infrastructure outbound

### A7.1 Chaîne complète

```
 DOMAINES ──► DNS ──► BOÎTES ──► AUTH ──► WARM-UP ──► RÉPUTATION ──► ENVOI ──► MONITORING
    │          │        │          │          │             │            │           │
 .fr/.com   SPF      Google     DMARC     14 j min     Postmaster    séquenceur  LC-017
 proches    DKIM     Workspace  aligné    + ramp-up    v2, tests     30/j/boîte  alertes
 du nom     DMARC    + M365     List-     (A8)         placement     fenêtre     bounce,
 principal  MX       (70/30)    Unsub                                 8 h-18 h    plaintes
            redirect                                                              blacklists
```

### A7.2 Domaines

| Règle | Valeur | Raison |
|---|---|---|
| Domaine principal (leadcore.fr / .com) | **Jamais** utilisé pour la prospection | Protéger le domaine qui porte le site, les factures et les emails clients |
| Domaines d'envoi | Variantes proches et crédibles : `leadcore-conseil.fr`, `getleadcore.com`, `leadcore-rdv.fr`… | Le prospect doit reconnaître la marque |
| Extensions | .fr et .com en priorité ; pas de .xyz, .top, .info | Réputation des extensions exotiques |
| Âge | Acheter 3 à 4 semaines avant le premier envoi ; stock de 2 domaines d'avance | Un domaine de quelques jours est suspect ; un stock évite d'attendre en cas de brûlure |
| Redirection | Le domaine d'envoi redirige (301) vers le site principal | Un prospect qui tape l'URL tombe sur Leadcore |
| Boîtes par domaine | 3 | Compromis entre coût et dilution du risque |
| Registrar | Un seul (ex. : OVHcloud, Cloudflare Registrar), DNS chez Cloudflare | Automatisation des enregistrements par API |

### A7.3 DNS (par domaine d'envoi)

| Enregistrement | Valeur type (Google) | Contrôle |
|---|---|---|
| MX | `smtp.google.com` (priorité 1) | Réponses reçues |
| SPF (TXT) | `v=spf1 include:_spf.google.com ~all` | Un seul enregistrement SPF, < 10 lookups |
| DKIM (TXT) | Clé 2048 bits générée dans la console Google, sélecteur `google` | Signature valide sur un email de test |
| DMARC (TXT `_dmarc`) | `v=DMARC1; p=none; rua=mailto:dmarc@<domaine-rapports>; adkim=r; aspf=r` puis `p=quarantine` après 30 jours propres | Rapports agrégés lus par LC-017 |
| Tracking personnalisé (CNAME) | Désactivé au départ | Le tracking d'ouverture ajoute un pixel et un domaine de tracking partagé ; le gain de mesure ne vaut pas le risque |
| Redirection | Règle 301 vers le site principal | |

Pour Microsoft 365 : `include:spf.protection.outlook.com`, DKIM par deux CNAME
(`selector1`, `selector2`), MX `<domaine>.mail.protection.outlook.com`.

**Pas de suivi d'ouverture, pas de lien dans la touche 1.** Le taux
d'ouverture est devenu une métrique peu fiable (protection de la vie privée
d'Apple Mail, préchargement par les passerelles). La métrique pilote est la
réponse.

### A7.4 Boîtes

| Option | Coût / boîte / mois | Avantages | Inconvénients | Verdict |
|---|---:|---|---|---|
| **Google Workspace direct** (Business Starter) | ~6,90 € HT | Réputation Google, contrôle total, contrat direct | Configuration manuelle (ou scriptée), plus cher | **Recommandé**, 70 % du parc |
| **Microsoft 365 direct** (Business Basic) | ~5-6 € HT | Diversification ; bonne délivrabilité vers les tenants M365 | Console plus lourde | **Recommandé**, 30 % du parc à partir du palier STANDARD |
| Revendeurs Google/Microsoft (Mailforge, Zapmail, Infraforge…) | ~2,70-4 € | Mise en place en minutes, DNS automatique | Tenants partagés : la réputation d'autres expéditeurs peut vous toucher ; dépendance à un tiers | Acceptable pour les tests de niche (LOW COST) |
| SMTP / IP dédiées (Maildoso, serveurs privés) | < 1 € | Très bon marché à l'échelle | Réputation d'IP à construire, délivrabilité B2B moins prévisible | Non retenu |

> **RECOMMANDATION** — Boîtes Google Workspace et Microsoft 365 **en direct**,
> un tenant Google et un tenant Microsoft par moteur (A et B séparés), mix
> 70/30.
> **POURQUOI** — Le coût supplémentaire (~3 €/boîte/mois vs un revendeur)
> achète l'isolement de réputation, un contrat direct et l'absence de
> dépendance à un intermédiaire. À 17 boîtes par client, l'écart est de
> ~50 €/mois : moins d'un demi-RDV.
> **ALTERNATIVES** — Revendeur pour les tests de niche et les pics.
> **COÛT** — 6,90 €/boîte/mois (Google), domaine ~12 €/an.
> **QUAND CHANGER** — Au-delà de ~500 boîtes, la gestion manuelle des
> tenants devient le coût dominant : automatiser par l'API Admin SDK, ou
> passer une partie du parc chez un revendeur dont on a mesuré le placement
> sur 3 mois.
> **RISQUE** — Suspension d'un tenant entier par Google : d'où deux tenants
> par moteur et le mix Microsoft.

### A7.5 Moteur A : dimensionnement

Au rythme de 4 signatures par mois (A15) : ~3 400 contacts, ~13 500 emails,
**28 boîtes, 10 domaines**. Le parc est bâti en deux vagues de 14 boîtes,
espacées de 2 semaines, pour que tout ne soit pas neuf en même temps.

### A7.6 Paramètres d'envoi

| Paramètre | Valeur |
|---|---|
| Envois / boîte / jour | 30 (plafond), démarrage selon A8 |
| Fenêtre | 8 h 30 - 17 h 30, heure du destinataire, jours ouvrés |
| Intervalle aléatoire entre envois d'une boîte | 8 à 15 minutes |
| Texte | Brut, sans HTML riche, signature texte |
| Rotation | Le séquenceur répartit un même contact sur une seule boîte pour tout le fil |
| En-têtes | `List-Unsubscribe` (mailto + URL) et `List-Unsubscribe-Post: List-Unsubscribe=One-Click` |
| Nom d'expéditeur | Un vrai prénom + nom d'un membre de l'équipe, avec une vraie page LinkedIn |

### A7.7 Monitoring

| Mesure | Outil | Seuil d'alerte | Action (voir 07-PANNES) |
|---|---|---|---|
| Bounce dur par boîte, 7 jours glissants | Séquenceur (API) | > 2 % | Pause de la boîte, audit de la source de données |
| Plaintes (Gmail) par domaine | Postmaster Tools v2 | > 0,1 % | Pause du domaine, revue du ciblage et de la copy |
| Statut de conformité Postmaster | Postmaster Tools v2 | Échec | Arrêt des envois du domaine |
| Listes noires (Spamhaus DBL, etc.) | Contrôle quotidien via API (MXToolbox ou équivalent) | Toute inscription | Retrait du domaine du parc |
| Placement inbox | Tests de semences (Gmail, Outlook, M365 pro) | < 70 % en boîte principale | Réduction du volume, revue du contenu |
| Taux de réponse par boîte vs moyenne de la campagne | Postgres | < 50 % de la moyenne sur 300 envois | Suspicion de spam silencieux, test de placement |
| Rapports DMARC | LC-017 | Échecs d'alignement | Correction DNS |

---

## A8 — Warm-up & ramp-up

### A8.1 Ce qui fonctionne réellement

| Pratique | Ce qu'on en sait | Verdict |
|---|---|---|
| Warm-up automatique (réseau de l'outil) | Crée un historique ; détecté de mieux en mieux par Gmail/Microsoft depuis 2024 ; les scores affichés mesurent le réseau de l'outil | **Utile pour démarrer, insuffisant seul.** On l'utilise, on ne s'y fie pas |
| Warm-up organique (échanges réels) | Construit une vraie réputation : réponses, conversations | **Le plus solide.** Chaque boîte échange avec des adresses internes et des partenaires pendant la chauffe |
| Âge du domaine | Un domaine de quelques jours est plus filtré | Acheter 3-4 semaines avant |
| Âge de la boîte | Les pics de volume sur une boîte jeune déclenchent des suspensions | Ramp-up progressif |
| Volume | Le volume par boîte pèse moins que la régularité | 30/jour stable > 50 un jour, 0 le lendemain |
| Engagement | Les réponses sont le signal positif le plus fort | Démarrer sur les segments qui répondent le plus |
| Schéma d'envoi | Envois en rafale, horaires identiques, contenu identique = signatures de spam | Intervalles aléatoires, variantes de texte (spintax léger), fenêtre de journée |

### A8.2 Calendrier (par boîte)

| Période | Warm-up auto / jour | Envois réels / jour | Condition pour passer à la suite |
|---|---:|---:|---|
| J-28 à J-21 | — | — | Domaine acheté, redirection active |
| J-21 à J-14 | — | — | Boîtes créées, DNS complets, signature, photo de profil |
| J-14 à J-8 | 5 → 15 | 0 | Aucun échec d'authentification |
| J-7 à J-1 | 15 → 25 | 0 | Test de placement > 80 % en boîte principale |
| J0 à J+6 | 20 | 5 → 10 | Bounce < 1 %, aucune plainte |
| J+7 à J+13 | 15 | 10 → 20 | Bounce < 2 %, au moins une réponse humaine par boîte |
| J+14 et après | 10 (maintenu) | 20 → 30 | Test de placement > 70 %, plaintes < 0,1 % |

Le passage d'une étape à l'autre est **une mesure, pas une date** : LC-017
bloque l'augmentation si la condition n'est pas remplie.

### A8.3 Premiers envois réels

Les 500 premiers contacts d'un nouveau parc sont choisis pour maximiser les
réponses et minimiser les bounces : emails `valid` uniquement (pas de
catch-all), comptes A et B, signal actif. Ces premiers échanges pèsent sur la
réputation de toute la vie du domaine.

---

## A9 — Campaign Engine

```
Prospect ─► Segment ─► Angle ─► Séquence ─► Personnalisation ─► QA ─► Send ─► Reply ─► Classification ─► Action
  (A3)       (A5)      (A5)      (A6)          (A10)          (LC-006)  (LC-007) (A11)      (LC-008)       (LC-009…)
```

### A9.1 Objets

| Objet | Définition | Exemple |
|---|---|---|
| Segment | Ensemble de comptes homogènes (niche × taille × zone × palier) | `agences-b2b_10-50_idf_A` |
| Campagne | Un segment × un angle × une séquence, dans un séquenceur | `A-2026-10-agences-idf-angle4` |
| Variante | Une version d'une touche testée contre une autre | `t1-v2` |
| Lot | Contacts chargés dans une campagne un jour donné | `lot-2026-10-06` |

### A9.2 Cadence de production

| Moment | Action | Workflow |
|---|---|---|
| Lundi 6 h | Sourcing et enrichissement de la semaine | LC-001, LC-002 |
| Lundi 8 h | Scoring, segmentation, lots de la semaine | LC-003, LC-004 |
| Lundi-jeudi, chaque nuit | Personnalisation du lot du lendemain (API Batch) | LC-005 |
| Chaque matin 7 h | QA automatique du lot + échantillon humain de 10 emails | LC-006 |
| Journée | Envois ; réponses traitées en continu | LC-007, LC-008 |
| Vendredi | Revue des tests, décisions arrêter / dupliquer | LC-020 |

### A9.3 QA avant envoi (portes bloquantes)

| # | Contrôle | Automatique | Blocage si |
|---|---|:---:|---|
| Q1 | Aucune variable vide ou `{{` résiduelle | ✓ | 1 cas |
| Q2 | Ligne personnalisée : longueur 8-30 mots, pas de faits non sourcés, pas de flatterie générique | ✓ (Haiku en juge) | > 2 % du lot |
| Q3 | Aucun contact en opposition, client, ancien client, concurrent | ✓ | 1 cas |
| Q4 | Aucun contact déjà dans une autre campagne active (moteur A **et** B) | ✓ | 1 cas |
| Q5 | Email vérifié il y a < 90 jours | ✓ | 1 cas |
| Q6 | Lien d'opposition et identité présents | ✓ | 1 cas |
| Q7 | Mots à risque (gratuit, garanti, 100 %, € en objet…) | ✓ | Avertissement |
| Q8 | Relecture humaine de 10 emails tirés au hasard | Humain | Un email gênant |
| Q9 | Boîtes du lot en état « vert » (LC-017) | ✓ | Boîte orange ou rouge |

---

## A10 — Personnalisation IA

### A10.1 Cinq niveaux

| Niveau | Ce que c'est | Entrées | Modèle | Coût IA / contact | Effet attendu sur le taux de réponse |
|---|---|---|---|---:|---|
| N0 Générique | Variables simples (prénom, société) | CRM | — | 0 | Base |
| N1 Persona | Paragraphe choisi selon la fonction | Table de personas | — | 0 | +10 à +20 % (hypothèse) |
| N2 Entreprise | Une ligne tirée du site (offre, clients, positionnement) | Texte du site (≈ 1 500 tokens) | Haiku 4.5, batch | ~0,001 € | +15 à +30 % (hypothèse) |
| N3 Signal | Le fait daté + sa conséquence | Signal A4 + site | Haiku 4.5, batch | ~0,002 € | +50 à +100 % (hypothèse, le signal fait l'essentiel) |
| N4 Recherche profonde | Mini-dossier : actualité, posts, recrutements, hypothèse de douleur | Recherche web, site, LinkedIn public | Sonnet 5 + recherche web | ~0,03-0,08 € + 2 min de relecture humaine (~1 €) | +100 % et plus sur les comptes A (hypothèse) |

Les effets sont des **hypothèses à mesurer** (B9). Aucun benchmark Tier 1 ne
les établit ; les chiffres publiés par les outils de personnalisation sont du
Tier 4.

### A10.2 Rapport coût / effet

Sur la base BASE (1,5 % de positif, 55 % de booking, 75 % de présence, soit
~0,62 RDV tenu pour 100 contacts), et en valorisant un RDV tenu du moteur A à
sa valeur attendue : 22 % de signature × ~9 900 € de recette sur la période
initiale de 3 mois (1 200 € de setup + 3 × 2 900 €), soit ~2 200 € :

| Niveau | Coût / 1 000 contacts | RDV tenus / 1 000 (si l'hypothèse de lift tient) | RDV en plus vs N1 | Coût par RDV additionnel |
|---|---:|---:|---:|---:|
| N1 | 0 € | 6,2 × 1,15 = 7,1 | — | — |
| N2 | ~1 € | 6,2 × 1,25 = 7,7 | +0,6 | ~2 € |
| N3 | ~2 € | 6,2 × 1,75 = 10,8 | +3,7 | < 1 € |
| N4 (IA + relecture) | ~1 050 € | 6,2 × 2,2 = 13,6 | +6,5 | ~160 € |

**Lecture.** N2 et N3 coûtent presque rien : ils sont systématiques. N4 coûte
surtout du **temps humain** ; il ne paie que sur les comptes A, où la valeur
d'un RDV est la plus haute et le volume le plus faible.

> **RECOMMANDATION** — N3 par défaut (N2 si aucun signal), N4 réservé au
> palier A.
> **POURQUOI** — Le coût IA est négligeable ; le seul coût réel est la
> relecture humaine du N4.
> **ALTERNATIVES** — Personnalisation native du séquenceur (moins de
> contrôle, pas de juge qualité), Clay (plus cher par ligne).
> **COÛT** — ~2 € / 1 000 contacts en N3 ; ~1 € par compte A en N4.
> **QUAND CHANGER** — Si le test B9 montre que N3 ne bat pas N1 de plus de
> 20 % sur 3 segments, abandonner la ligne personnalisée et investir le temps
> dans le ciblage.
> **RISQUE** — Hallucination : un fait faux dans la première ligne détruit la
> crédibilité. D'où le juge (Q2) et la règle « aucun fait sans source dans
> l'entrée ».

Les prompts sont dans [12-PROMPTS](12-PROMPTS.md).

---

## A11 — Reply Engine

### A11.1 Classes et routage

| Classe | Définition | Action automatique | Humain | SLA |
|---|---|---|---|---|
| `POSITIVE` | Intérêt explicite, demande de RDV ou de créneaux | Stop séquence ; création d'une opportunité ; brouillon de réponse avec 2 créneaux | Setter valide et envoie | **< 1 h ouvrée** |
| `QUESTION` | Demande d'information (prix, fonctionnement, références) | Brouillon IA à partir de la FAQ | Setter valide | < 2 h ouvrées |
| `OBJECTION` | Objection argumentable (déjà un prestataire, pas le budget maintenant) | Brouillon IA à partir de la bibliothèque d'objections | Setter décide | < 4 h ouvrées |
| `REFERRAL` | « Voyez avec X » | Création du contact X ; brouillon citant la personne | Setter valide | < 4 h |
| `NOT_NOW` | « Plus tard », « recontactez-moi en janvier » | Stop ; nurture avec date extraite (défaut : +90 j) | — | Auto |
| `NEGATIVE` | Pas intéressé, sans demande d'opposition | Stop ; suppression de campagne 12 mois ; réactivation possible sur signal fort | — | Auto |
| `UNSUBSCRIBE` | Demande de ne plus être contacté, sous toute forme (« stop », « retirez-moi ») | **Suppression immédiate et définitive**, tous moteurs, domaine du contact marqué | — | **Immédiat** |
| `WRONG_PERSON` | Pas la bonne personne, sans renvoi | Stop ; contact marqué ; recherche d'un autre décideur du compte | — | Auto |
| `OOO` | Absence | Pause jusqu'à la date de retour + 2 jours | — | Auto |
| `BOUNCE` | Rebond | Contact invalide ; compteur de la source | — | Auto |
| `HOSTILE` | Menace de plainte, agressivité | Suppression définitive ; alerte au responsable | Responsable lit | < 4 h |

Un message peut porter deux intentions (« pas maintenant, mais envoyez-moi
votre plaquette ») : la classe retenue est la plus **engageante** (QUESTION),
avec la seconde en attribut.

### A11.2 Règle de sécurité

Toute réponse classée `UNSUBSCRIBE` ou `HOSTILE` avec une confiance < 0,9 part
**quand même** en suppression, puis en revue humaine. Dans le doute, on
supprime. Une opposition manquée coûte bien plus qu'un prospect perdu.

### A11.3 Enrichissement et score d'une réponse positive

À la réception d'un `POSITIVE`, LC-009 joint : score ICP, signaux, historique
des échanges, taille, résumé IA du compte, et calcule une **priorité de
booking** (A13). Le setter voit tout dans une seule fiche.

---

## A12 — Sales handoff

```
OUTBOUND ─► RÉPONSE QUALIFIÉE ─► SETTER ─► BOOKING ─► CLOSER ─► CONTRAT ─► PAIEMENT ─► ONBOARDING
            (A11)                 ≤ 1 h     ≤ 24 h      J       J+2        J+5         J+5 → B1
```

| Étape | Responsable | Entrée | Sortie | SLA | Mesure |
|---|---|---|---|---|---|
| Réponse positive → premier retour | Setter | Fiche LC-009 | Réponse envoyée avec 2 créneaux | < 1 h ouvrée | % dans le SLA |
| Qualification | Setter | Échange | Critères K2, K5 confirmés ; valeur client ; urgence | Dans l'échange, 1 à 3 messages | Taux de RDV disqualifiés au call < 15 % |
| Booking | Setter | Accord | Événement Cal, fiche opportunité, préparation lancée | < 24 h après accord | Délai réponse → RDV < 7 jours |
| Confirmation | Automatique | Événement | Email immédiat, J-1, SMS 2 h avant | — | Show rate |
| Préparation | Automatique + closer | Fiche | Brief d'appel (LC-012) | Envoyé J-1 18 h | Brief lu (oui/non) |
| Appel de découverte / closing | Closer | Brief | Issue : proposition, deuxième appel, perdu | — | Taux de proposition |
| Proposition | Closer | Notes d'appel | Proposition + contrat Yousign + lien de paiement du setup | < 24 h après l'appel | Délai |
| Signature | Prospect | Proposition | Contrat signé | Relances J+2, J+5, J+10 | Taux de signature |
| Paiement du setup | Prospect | Lien | Paiement reçu | Avant démarrage technique (règle MAJ-OFFRE) | Délai signature → paiement |
| Passage en delivery | Automatique | Paiement | Espace client, questionnaire, créneau d'appel d'onboarding (B1) | < 1 h après paiement | — |

---

## A13 — Sales capacity

### A13.1 Le problème

Si 100 RDV arrivent et que les closers en absorbent 40, les 60 autres sont
perdus, bâclés ou repoussés de trois semaines (et le show rate s'effondre).
Le moteur doit **mesurer la capacité et ajuster l'amont**, pas l'inverse.

### A13.2 Capacité

```
capacité_closer (RDV tenus / semaine) = créneaux ouverts × taux de présence attendu
charge_prévue (semaine s)            = RDV déjà bookés(s) + positives_en_cours × taux_booking
taux_de_saturation                    = charge_prévue / capacité_closer
```

Repères : un closer à plein temps tient 12 à 15 appels de vente par semaine
(préparation, appel, proposition, relances : ~2 h par RDV tenu), soit ~50 RDV
tenus par mois. Au-delà, la qualité de suivi baisse.

### A13.3 Règles automatiques (LC-021)

| Saturation prévue à 2 semaines | Action |
|---|---|
| < 60 % | Autoriser +20 % de volume d'envoi la semaine suivante (dans la limite de l'infrastructure chaude) |
| 60 à 90 % | Volume stable |
| 90 à 110 % | Priorisation : les créneaux vont d'abord aux paliers A ; les C reçoivent un créneau à J+10 minimum |
| > 110 % | Volume d'envoi réduit de 30 % ; setter qualifie plus dur (critère K2 vérifié avant booking) ; alerte au responsable pour ouvrir des créneaux ou recruter |

La réduction d'envoi ne touche jamais les campagnes en ramp-up (A8) : une
boîte en chauffe qui s'arrête perd son historique. On réduit les nouveaux
lots, pas les relances en cours.

### A13.4 Routage et priorisation

| Critère | Règle |
|---|---|
| Palier du compte | A → closer senior, créneau sous 3 jours ouvrés |
| Niche | Le closer qui a déjà signé dans la niche en priorité |
| Charge | Répartition au plus faible taux de saturation |
| Langue / zone | Closer francophone ; Belgique/Suisse (après validation H10) au closer qui en a l'habitude |
| Score de closing prédit | Après 200 RDV tenus : modèle simple (score ICP, signal, persona, délai de réponse) qui prédit la probabilité de signature ; utilisé pour ordonner, jamais pour refuser un RDV |

---

## A14 — Leadcore Sales OS

### A14.1 Pipeline (Attio)

| Étape | Critère d'entrée | Tâches créées automatiquement | Rappel si inactif |
|---|---|---|---|
| Réponse positive | LC-009 | « Répondre avec 2 créneaux » (setter, 1 h) | 1 h |
| Qualification | Premier échange | « Confirmer valeur client et équipe commerciale » | 24 h |
| RDV booké | Événement Cal | Brief J-1 ; rappels auto | — |
| RDV tenu | Présence cochée par le closer | « Envoyer proposition » (24 h) | 24 h |
| No-show | Absence cochée | Séquence de replanification (1 tentative + 1 relance) | 48 h |
| Proposition envoyée | Document Yousign créé | Relances J+2, J+5, J+10 | 2 j |
| Négociation | Réponse sur la proposition | « Traiter objection » | 3 j |
| Gagné | Contrat signé + setup payé | LC-013 → LC-014 | — |
| Perdu | Motif obligatoire (liste fermée) | Nurture 90 j ou 180 j selon motif | — |

Motifs de perte (liste fermée, pour l'analyse) : prix, timing, pas de
capacité de closing, valeur client trop basse, choisit un concurrent,
internalise, pas de réponse après proposition, autre (texte obligatoire).

### A14.2 Préparation d'appel automatique

LC-012 produit un brief d'une page, envoyé au closer la veille à 18 h :
entreprise en 3 lignes, offre, valeur client estimée et sa source, équipe
commerciale, signaux, échanges avec le setter, hypothèse de douleur,
questions de découverte suggérées, objections probables, **estimation du
nombre de comptes adressables pour ce prospect** (Sirene + filtres de son ICP
supposé). Ce dernier point sert au closing : montrer dès le premier appel
combien de comptes on peut contacter pour lui.

### A14.3 Proposition, contrat, paiement

| Élément | Outil | Automatisation |
|---|---|---|
| Proposition | Modèle (Google Docs ou page) rempli depuis Attio | LC-012 génère le brouillon ; le closer ajuste |
| Contrat | Yousign, modèle avec champs (setup, retainer, prix/RDV, définition du RDV qualifié, no-show, J+30, durée 3 mois, données) | Envoi depuis n8n, suivi du statut par webhook |
| Paiement setup | Lien Stripe (carte / virement) | Joint au même email que la signature |
| Retainer mensuel | Prélèvement SEPA (GoCardless ou Stripe SEPA) | Mandat signé au démarrage |
| Facturation variable (RDV) | Facture mensuelle générée depuis `meeting` (statut `held`, `client_cancel` à 50 %) | LC-026, relue avant envoi |

---

## A15 — Blitzkrieg client acquisition : 0 → 100 clients

Chiffres produits par `python3 tools/simulateur_os.py --section acquisition`
(hypothèses : 1,2 % de positif, 60 % booking, 75 % présence, 22 % de
signature sur RDV tenu, 4 touches). **Ce ne sont pas des promesses** : le
tableau montre ce qu'il faut produire si ces taux tiennent. Changer un taux
avec `--set`.

### A15.1 Volume par rythme de signature

| Signatures / mois | Contacts / mois | Leads / jour | Emails / mois | Boîtes | Domaines | RDV bookés / sem. | RDV tenus / mois | Closers (ETP) | Coût total / mois | CAC |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 1 684 | 80 | 6 734 | 14 | 5 | 2,8 | 9,1 | 0,2 | 2 470 € | 1 235 € |
| 4 | 3 367 | 160 | 13 468 | 28 | 10 | 5,6 | 18,2 | 0,4 | 4 691 € | 1 173 € |
| 8 | 6 734 | 321 | 26 936 | 54 | 18 | 11,2 | 36,4 | 0,7 | 9 116 € | 1 139 € |
| 12 | 10 101 | 481 | 40 404 | 82 | 28 | 16,8 | 54,5 | 1,1 | 13 556 € | 1 130 € |
| 20 | 16 835 | 802 | 67 340 | 134 | 45 | 28,0 | 90,9 | 1,8 | 22 407 € | 1 120 € |

Le CAC (~1 150 €) inclut données, infrastructure, setter, closer, une
commission hypothétique de 400 € par client signé et 250 €/mois d'outils.
**Les frais de setup de 1 200 € couvrent le CAC** : chaque client signé est
rentable dès la signature, avant le premier retainer. C'est l'argument le plus
fort pour ne pas brader le setup.

### A15.2 Rythme nécessaire pour atteindre un parc

| Parc cible | En 6 mois (churn 5 %) | En 12 mois (churn 5 %) | En 12 mois (churn 10 %) |
|---:|---:|---:|---:|
| 5 | 1,0 / mois | 0,5 | 0,7 |
| 10 | 1,9 | 1,1 | 1,3 |
| 25 | 4,8 | 2,7 | 3,3 |
| 50 | 9,6 | 5,4 | 6,7 |
| 100 | 19,2 | 10,8 | 13,3 |

### A15.3 Les étapes

| Étape | Parc | Rythme | Infra A | Équipe acquisition | Campagnes actives | Goulot principal | Ce qui débloque |
|---|---:|---|---|---|---:|---|---|
| **0 → 5** | 5 | 1-2 / mois | 14 boîtes, 5 domaines | Fondateur = closer ; 1 setter à mi-temps (ou le fondateur) | 3 (une par niche testée) | **La preuve** : pas de cas client | Signer 5 clients en phase de preuve, obtenir 2 cas avec CA signé (J+30) |
| **5 → 10** | 10 | 2 / mois | 14-28 boîtes | Fondateur closer ; 1 setter | 4-6 | Le temps du fondateur, partagé avec la delivery | Recruter le premier opérateur delivery avant le premier closer |
| **10 → 25** | 25 | 3-5 / mois | 28-40 boîtes, 2 tenants | 1 closer + fondateur ; 1 setter | 6-10 | La capacité de closing (A13) | Premier closer (commission sur le setup + 3 premiers mois, pas sur la vie du client) |
| **25 → 50** | 50 | 6-10 / mois | 54-82 boîtes | 2 closers ; 2 setters ; 1 responsable acquisition | 10-15 | La qualité des RDV (les closers se plaignent) | Score de closing prédit (A13.4), qualification plus dure |
| **50 → 100** | 100 | 11-20 / mois | 82-134 boîtes, 4 tenants | 3-4 closers ; 3 setters ; 1 sales manager | 15-25 | **Le marché** : une niche de 3 000 comptes s'épuise | Ouvrir 2 à 3 niches, LinkedIn et partenariats comme canaux 2 et 3 ; les recommandations clients commencent à peser |

### A15.4 Épuisement du marché de Leadcore

À 4 signatures par mois, le moteur A consomme ~3 400 contacts par mois, soit
~1 700 comptes (2 contacts par compte en moyenne). Une niche de 3 000 comptes
ICP s'épuise en **2 mois**. À 20 signatures par mois, il faut ~8 400 comptes
nouveaux par mois.

Conséquences :

1. la niche doit être choisie avec la taille de marché en tête (A1.3,
   critère à 15 %) ;
2. un compte « épuisé » (tous les contacts touchés sans réponse) redevient
   contactable après **6 mois**, avec un autre angle, si un signal apparaît,
   et s'il n'y a eu ni opposition ni réponse négative ;
3. au-delà de 25 clients, l'outbound seul ne suffit pas : les recommandations
   des clients satisfaits et les partenariats (experts-comptables, cabinets
   de conseil en stratégie commerciale) deviennent les canaux 2 et 3.

### A15.5 Coûts du moteur A

| Parc visé | Rythme | Coût mensuel du moteur A | Dont humain | CAC |
|---|---:|---:|---:|---:|
| 10 en 6 mois | 2 / mois | ~2 500 € | ~1 100 € | ~1 200 € |
| 25 en 6 mois | 5 / mois | ~5 800 € | ~2 800 € | ~1 160 € |
| 50 en 12 mois | 6 / mois | ~6 900 € | ~3 350 € | ~1 150 € |
| 100 en 12 mois | 11-13 / mois | ~13 500 € | ~6 700 € | ~1 130 € |

Le CAC reste stable parce que le modèle est linéaire : c'est une limite du
simulateur. En réalité, il **monte** quand la niche s'épuise (A15.4) et
**baisse** quand les recommandations et les cas clients arrivent. Suivre le
CAC réel par mois et par canal dans LC-011.
