# Leadcore — Fonctionnement complet

Document de référence opérationnel. Version : septembre 2026, révisée.

> Révision de septembre 2026 : ticket plancher porté à 7 000 €, frais de setup
> de 1 200 €, engagement initial de 3 mois, promesse de volume ramenée à 8–12
> rendez-vous par mois, politique de no-show et suivi du devenir des rendez-vous
> à J+30. Le détail et la justification de ces changements sont dans
> [`MAJ-OFFRE-2026-09.md`](MAJ-OFFRE-2026-09.md).

---

## 1. Positionnement et modèle économique

Leadcore est une agence B2B de génération de leads et de rendez-vous commerciaux.

### Objectif principal

Aider des entreprises B2B à alimenter leur pipeline commercial avec des prospects qualifiés et des rendez-vous commerciaux, en prenant en charge une partie importante de la prospection outbound.

### Cible

- PME / entreprises à forte valeur client.
- Ticket moyen minimum : **7 000 €**, ou un revenu récurrent de valeur
  équivalente sur la durée de vie du client. En dessous, le client ne récupère
  pas assez par rapport à ce qu'il dépense, et il ne renouvelle pas.
- Entreprises disposant d'une offre claire, d'une capacité de vente et d'une capacité de livraison suffisante.
- Priorité aux secteurs où un nouveau client a une valeur suffisamment élevée pour rendre l'acquisition outbound rentable.

### Offre

Leadcore prend en charge tout ou partie de la chaîne :

1. définition du ciblage ;
2. constitution des bases de prospects ;
3. enrichissement et qualification ;
4. préparation des domaines et infrastructures d'envoi ;
5. séquences d'email outbound ;
6. qualification des réponses ;
7. prise de rendez-vous ;
8. transmission des rendez-vous au client ;
9. suivi des performances ;
10. optimisation continue.

### Promesse opérationnelle

Le produit vendu n'est pas simplement une liste de contacts ou des emails envoyés. C'est un système de génération d'opportunités commerciales qualifiées.

### Modèle de prix utilisé comme base

**Phase initiale / preuve :**

- 1 200 € de frais de setup, facturés une fois au démarrage ;
- 500 € / mois de retainer ;
- 200 € par rendez-vous qualifié honoré ;
- engagement initial de 3 mois, puis reconduction mensuelle.

**Après obtention de preuves, résultats et cas clients chiffrés :**

- 1 500 € de frais de setup ;
- 1 500 € / mois de retainer ;
- 150 € par rendez-vous qualifié honoré.

Les frais de setup couvrent la période où rien ne sort encore : domaines, DNS,
boîtes, warm-up, construction de la base et rédaction des séquences. Sans eux,
le premier mois est déficitaire.

L'engagement de 3 mois correspond à la durée technique minimale : 2 à 3
semaines de warm-up, puis un cycle complet d'optimisation.

Le déplacement progressif du poids vers le retainer est volontaire : en phase de
preuve, l'essentiel de la recette est variable, ce qui rend un mauvais mois de
délivrabilité difficile à absorber.

Ces montants constituent une base de travail et peuvent être adaptés au volume, au secteur et à la complexité de la campagne.

### Objectif de livraison

**Annoncé au client : 8 à 12 rendez-vous qualifiés par mois**, une fois
l'infrastructure chaude.

Objectif interne : 15 à 20 par mois lorsque le marché, l'offre et
l'infrastructure le permettent. L'écart est volontaire. Sur-livrer fidélise,
manquer une promesse annoncée coûte le client et le cas client.

Volumes de production correspondants pour 12 rendez-vous honorés : environ
1 900 contacts uniques en ICP, 7 600 emails, une dizaine de boîtes actives et
environ 120 réponses à traiter dans le mois.

---

## 2. Architecture générale de Leadcore

Leadcore fonctionne autour de deux moteurs distincts :

**Moteur A — Acquisition des clients Leadcore**
Prospection → qualification → rendez-vous → closing → contrat → onboarding.

**Moteur B — Livraison pour les clients**
Ciblage → scraping → enrichissement → infrastructure → séquences → réponses → qualification → booking → livraison → reporting → optimisation.

Les deux moteurs doivent être documentés séparément afin de pouvoir être standardisés, mesurés et progressivement automatisés.

---

## 3. Moteur A — Trouver les clients de Leadcore

### Étape 1 — Choix du niche

Avant de scraper massivement, définir le segment cible.

Critères de sélection :

- ticket moyen élevé ;
- marge suffisante ;
- marché suffisamment large ;
- décideurs identifiables ;
- offre compréhensible ;
- problème commercial réel ;
- capacité à traiter de nouveaux clients ;
- potentiel de récurrence ;
- possibilité de démontrer rapidement un ROI.

Exemples de cibles possibles :

- agences spécialisées ;
- cabinets B2B ;
- sociétés de services ;
- entreprises SaaS ;
- prestataires à forte valeur ;
- certains acteurs de santé / esthétique ou autres verticales selon economics.

### Étape 2 — Scraping

Construire une base de prospects correspondant au profil client idéal.

Données recherchées :

- entreprise ;
- site web ;
- secteur ;
- localisation ;
- taille ;
- nom du décideur ;
- fonction ;
- email professionnel ;
- LinkedIn lorsque pertinent ;
- informations permettant la personnalisation ;
- signaux commerciaux.

Sources possibles :

- bases B2B ;
- Google Maps / recherche web selon le secteur ;
- LinkedIn et sources autorisées ;
- annuaires professionnels ;
- bases de données spécialisées ;
- scraping de sites publics lorsque juridiquement approprié.

### Étape 3 — Enrichissement

Ajouter les informations nécessaires à la qualification et à la personnalisation.

Exemples :

- offre principale ;
- taille de l'entreprise ;
- marché adressé ;
- signaux de croissance ;
- recrutement ;
- présence publicitaire ;
- technologie utilisée ;
- éléments différenciants ;
- problèmes potentiels observables.

### Étape 4 — Qualification

Attribuer un statut à chaque prospect :

- ICP / hors ICP ;
- priorité ;
- taille ;
- ticket potentiel ;
- pertinence ;
- niveau de personnalisation nécessaire.

### Étape 5 — Outreach

Utiliser principalement l'email outbound et, selon le contexte, d'autres canaux.

Structure type :

- accroche courte ;
- observation personnalisée ;
- problème / opportunité ;
- proposition de valeur ;
- call-to-action simple ;
- relances.

**Principe :** le message doit vendre la conversation, pas essayer de vendre tout le service dans le premier email.

### Étape 6 — Booking

Lorsqu'un prospect manifeste un intérêt :

- vérifier qu'il correspond au profil ;
- identifier le besoin ;
- confirmer le potentiel ;
- proposer / réserver un créneau ;
- renseigner les informations utiles dans le CRM ;
- transmettre le rendez-vous au closer.

### Étape 7 — Closing

Le closer conduit le rendez-vous selon un process standardisé.

Structure indicative :

1. introduction ;
2. contexte ;
3. situation commerciale actuelle ;
4. volume de leads / acquisition ;
5. problème du pipeline ;
6. coût du problème ;
7. objectif ;
8. présentation de Leadcore ;
9. fonctionnement de la campagne ;
10. attentes et conditions ;
11. objections ;
12. proposition ;
13. closing.

### Étape 8 — Contrat et documents

Avant démarrage :

- contrat de prestation ;
- conditions commerciales ;
- modalités de facturation ;
- définition d'un lead / rendez-vous qualifié ;
- responsabilités respectives ;
- politique d'annulation / no-show ;
- traitement des données ;
- confidentialité ;
- durée / résiliation ;
- modalités de paiement.

### Étape 9 — Onboarding

Collecter :

- offre ;
- ICP ;
- zones géographiques ;
- secteurs interdits ;
- personas ;
- ticket moyen ;
- cas clients ;
- arguments de vente ;
- objections ;
- concurrents ;
- calendrier commercial ;
- CRM ;
- calendrier de réservation ;
- informations nécessaires à la qualification.

Créer ensuite l'espace client, les documents de campagne et les tableaux de suivi.

---

## 4. Moteur B — Livraison client

### Phase 1 — Onboarding et recherche

Objectif : comprendre précisément ce qui constitue une opportunité commerciale intéressante pour le client.

Livrables :

- ICP ;
- personas ;
- critères d'exclusion ;
- proposition de valeur ;
- angles outbound ;
- objections ;
- définition du rendez-vous qualifié.

### Phase 2 — Construction de la liste

Créer une base suffisamment large pour supporter la campagne.

Workflow :

1. définir les filtres ;
2. scraper ;
3. dédupliquer ;
4. enrichir ;
5. vérifier les données ;
6. retirer les prospects hors ICP ;
7. scorer ;
8. répartir les prospects dans les campagnes.

Exemple de segmentation :

- secteur ;
- taille ;
- localisation ;
- fonction ;
- niveau de priorité ;
- angle de campagne.

**Renouvellement des segments.** Un segment travaillé à ce rythme s'épuise en 4
à 6 mois. Dès l'onboarding, un plan est écrit : segment 1 actif, segments 2 et 3
identifiés, volume disponible estimé pour chacun. Un tableau de suivi par client
tient le volume total, le volume déjà touché, le volume restant et le taux de
réponse observé. Quand le volume restant passe sous deux mois de production, le
segment suivant est préparé.

### Phase 3 — Infrastructure email

L'infrastructure doit être séparée de l'identité commerciale principale lorsque nécessaire.

Éléments :

- domaines d'envoi ;
- boîtes email ;
- DNS ;
- SPF ;
- DKIM ;
- DMARC ;
- tracking si utilisé ;
- limites d'envoi ;
- rotation des boîtes ;
- monitoring de délivrabilité.

**Warm-up.** Avant les volumes importants :

- créer progressivement l'activité ;
- augmenter les volumes progressivement ;
- surveiller les bounce rates ;
- surveiller les réponses ;
- surveiller les signaux de délivrabilité ;
- arrêter / réduire une boîte si sa réputation se dégrade.

**Principe :** la priorité est la délivrabilité et la qualité des données, pas le volume brut d'emails envoyés.

### Phase 4 — Copywriting

Chaque campagne doit être construite autour :

- d'un ICP ;
- d'un problème ;
- d'un angle ;
- d'une proposition de valeur ;
- d'un CTA.

Structure simple : email initial → relance 1 → relance 2 → relance 3 → relance finale.

La séquence doit rester courte, lisible et pertinente.

### Phase 5 — Lancement

Avant lancement :

- vérifier les listes ;
- tester les emails ;
- vérifier les liens ;
- vérifier la personnalisation ;
- vérifier les domaines ;
- vérifier les DNS ;
- vérifier les volumes ;
- lancer sur un petit volume ;
- contrôler les premiers résultats.

### Phase 6 — Gestion des réponses

Toutes les réponses doivent être classées.

Catégories :

- intéressé ;
- intéressé mais plus tard ;
- demande d'information ;
- objection ;
- pas intéressé ;
- mauvais contact ;
- absence de réponse ;
- demande de désinscription ;
- réponse automatique ;
- rendez-vous potentiel.

Les réponses positives sont transférées vers le process de qualification.

### Phase 7 — Qualification

Un rendez-vous ne doit être considéré comme qualifié que s'il respecte les critères convenus avec le client.

Exemples de critères :

- bon type d'entreprise ;
- bon décideur ;
- besoin identifiable ;
- intérêt réel ;
- timing pertinent ;
- capacité financière / ticket compatible lorsque cela peut être vérifié ;
- rendez-vous accepté.

### Phase 8 — Booking

Le prospect qualifié reçoit un lien ou une proposition de créneau.

Informations à récupérer :

- nom ;
- société ;
- fonction ;
- besoin ;
- contexte ;
- taille / volume lorsque pertinent ;
- informations utiles au commercial.

Le rendez-vous est enregistré dans le calendrier / CRM.

### Phase 9 — Rappel et réduction des no-show

Avant le rendez-vous :

- confirmation ;
- rappel ;
- informations pratiques ;
- éventuellement rappel automatique.

Après le rendez-vous :

- présence ;
- résultat ;
- qualification finale ;
- opportunité créée ou non.

---

## 5. Définition d'un lead / RDV qualifié

Cette définition doit être contractuelle et spécifique au client.

Exemple générique — un rendez-vous qualifié est un rendez-vous :

- avec une entreprise correspondant à l'ICP ;
- avec une personne disposant du pouvoir de décision ou ayant une influence directe ;
- ayant manifesté un intérêt réel ;
- ayant accepté explicitement le rendez-vous ;
- correspondant aux critères définis pendant l'onboarding.

**Politique de no-show :**

- Prospect absent : le rendez-vous est replanifié une fois, et n'est facturé que
  s'il a effectivement lieu.
- Annulation ou absence du côté du client : le rendez-vous est facturé à 50 %,
  la prestation ayant été rendue.

Cette politique est écrite au contrat. Le taux de présence dépend aussi du
client, de son délai de réponse et de sa tenue d'agenda ; Leadcore ne porte pas
seul un risque qu'il ne contrôle qu'en partie.

> **Important :** ne jamais modifier rétroactivement la définition d'un lead pour améliorer artificiellement les KPIs.

### Sujets ouverts

Niche, conformité RGPD, rémunération des commerciaux et ouverture d'un second
canal restent à trancher. Ils sont listés dans
[`MAJ-OFFRE-2026-09.md`](MAJ-OFFRE-2026-09.md), section 5.

---

## 6. Organisation des équipes

Structure possible :

```
CEO / Direction
├── Acquisition Leadcore
│   ├── Scrapers / Researchers
│   ├── Setters
│   └── Closers
├── Delivery
│   ├── Campaign Manager
│   ├── List Builder
│   ├── Email / Automation Operator
│   └── Setter / Qualifier
└── Operations
    ├── CRM
    ├── Reporting
    ├── Finance
    └── QA
```

### Setters

Responsabilités :

- traiter les réponses ;
- qualifier ;
- relancer ;
- booker ;
- mettre à jour le CRM ;
- respecter les scripts ;
- transmettre les informations au closer.

KPI :

- conversations traitées ;
- réponses traitées ;
- prospects qualifiés ;
- rendez-vous bookés ;
- show rate ;
- qualité des rendez-vous.

Un objectif indicatif précédemment envisagé était de 60 à 100 contacts traités par jour et par setter, mais le bon niveau dépend fortement du canal, du degré de personnalisation et du volume de réponses.

### Closers

Responsabilités :

- discovery ;
- qualification commerciale ;
- présentation de l'offre ;
- traitement des objections ;
- closing ;
- suivi des opportunités.

### Rémunération

Une structure envisagée pour les closers est une commission pouvant aller jusqu'à environ 20 % des deals selon le modèle et les responsabilités.

Pour les premières équipes, la rémunération peut être fortement variable afin d'aligner les coûts sur les revenus, mais elle doit rester économiquement soutenable et conforme au cadre contractuel applicable.

---

## 7. CRM et pipeline

Chaque prospect / client doit avoir un statut unique et traçable.

### Pipeline acquisition Leadcore

1. Scrapé
2. Enrichi
3. Qualifié
4. Contacté
5. Réponse
6. Qualification
7. RDV booké
8. RDV réalisé
9. Proposition
10. Négociation
11. Gagné
12. Perdu
13. Onboarding

### Pipeline delivery

1. Prospect identifié
2. Validé
3. Enrichi
4. Séquence programmée
5. Contacté
6. Réponse
7. Qualification
8. RDV booké
9. RDV réalisé
10. Opportunité
11. Client / perdu

Chaque changement de statut doit être traçable.

---

## 8. Stack outils

**Prospection / scraping :** outils de scraping, bases B2B, enrichissement email, recherche web.

**Automatisation :** n8n, webhooks, APIs, automatisations CRM.

**Email :** infrastructure multi-domaines, boîtes dédiées, plateforme de séquençage, monitoring de délivrabilité.

**CRM :** CRM central, calendrier, pipeline, reporting.

**Documentation :** Notion, SOP, base de connaissances, espace client.

**IA :** recherche, enrichissement, personnalisation, classification des réponses, aide au copywriting, analyse des performances, automatisations internes.

**Principe de stack :** chaque outil doit avoir une fonction claire. Éviter d'empiler des logiciels sans raison.

---

## 9. Automatisations

### Automatisation 1 — Scraping

Déclencheur : nouvelle campagne.

Actions : scraper, nettoyer, enrichir, dédupliquer, scorer, envoyer dans le CRM / table de campagne.

### Automatisation 2 — Email

Déclencheur : prospect validé.

Actions : assignation à une campagne, ajout à une séquence, envoi progressif, récupération des réponses.

### Automatisation 3 — Classification IA

Déclencheur : nouvelle réponse.

Actions : classification, détection d'intérêt, extraction d'informations, recommandation d'action, assignation au setter.

### Automatisation 4 — Booking

Déclencheur : réponse positive / qualification validée.

Actions : envoi du lien, réservation, synchronisation calendrier, mise à jour CRM, notification équipe.

### Automatisation 5 — Reporting

Déclencheur : quotidien / hebdomadaire.

Calculer : prospects ajoutés, emails envoyés, délivrés, réponses, réponses positives, RDV, show rate, opportunités, deals, CA généré, coût d'acquisition, ROI lorsque les données sont disponibles.

**Suivi à J+30.** Le client renvoie le statut de chaque rendez-vous un mois après
qu'il a eu lieu : perdu, en cours, ou signé avec le montant. C'est une obligation
contractuelle, pas une faveur. Sans cette donnée, le ROI n'est pas démontrable,
les prix ne peuvent pas monter et aucun cas client chiffré n'existe.

---

## 10. KPIs à suivre

**Top of funnel :** nombre de prospects, taux d'emails valides, volume envoyé, bounce rate, délivrabilité, taux de réponse.

**Mid funnel :** taux de réponse positive, taux de qualification, taux de booking, délai moyen de réponse.

**Bottom funnel :** nombre de rendez-vous, show rate, taux de closing, CA généré, valeur moyenne du deal.

**Économie :** coût par lead, coût par rendez-vous, coût par rendez-vous présent, coût d'acquisition client, MRR, marge brute, marge opérationnelle, churn, LTV, LTV/CAC.

---

## 11. Qualité et QA

**Avant chaque campagne :** vérifier l'ICP, les données, les emails, les domaines, les DNS, la copy, les variables, les exclusions.

**Pendant la campagne :** monitoring quotidien, contrôle des bounces, des réponses, de la délivrabilité, de la qualité des rendez-vous.

**Chaque semaine :** analyser les campagnes, identifier les segments performants, identifier les segments faibles, tester de nouveaux angles, ajuster les listes, ajuster les séquences.

---

## 12. SOP opérationnel quotidien

**Matin**

1. vérifier infrastructure ;
2. vérifier délivrabilité ;
3. vérifier réponses ;
4. traiter les réponses positives ;
5. vérifier les rendez-vous du jour ;
6. vérifier les no-shows / reports ;
7. contrôler les campagnes.

**Journée**

1. qualification ;
2. booking ;
3. relances ;
4. enrichissement ;
5. lancement de nouvelles listes ;
6. traitement des problèmes.

**Fin de journée**

1. mettre le CRM à jour ;
2. contrôler les KPIs ;
3. identifier les anomalies ;
4. préparer les actions du lendemain.

---

## 13. SOP hebdomadaire

**Acquisition :** volume de prospects, taux de réponse, rendez-vous, show rate, closing, CA signé.

**Delivery :** volume envoyé, délivrabilité, réponses, réponses positives, RDV, qualité, performance par segment, performance par copy.

**Operations :** charge setters, charge closers, incidents, automatisations cassées, coûts outils, marge par client.

**Décisions :** continuer, ajuster, arrêter un segment, augmenter un segment, tester un nouvel angle.

---

## 14. Onboarding client — checklist

- [ ] Contrat signé, durée initiale de 3 mois actée
- [ ] Frais de setup facturés et encaissés avant le démarrage technique
- [ ] Politique de no-show relue avec le client
- [ ] Canal de retour à J+30 défini
- [ ] Plan de renouvellement de segments écrit
- [ ] Paiement / facturation configurés
- [ ] ICP défini
- [ ] Personas définis
- [ ] Géographies définies
- [ ] Secteurs exclus définis
- [ ] Offre documentée
- [ ] Ticket moyen connu
- [ ] Cas clients collectés
- [ ] Objections collectées
- [ ] Calendrier récupéré
- [ ] CRM connecté
- [ ] Domaines configurés
- [ ] Boîtes configurées
- [ ] DNS vérifiés
- [ ] Séquences rédigées
- [ ] Listes créées
- [ ] QA effectuée
- [ ] Campagne lancée
- [ ] Reporting configuré

---

## 15. Process de scaling

**Ne pas scaler en premier le volume.**

Ordre recommandé :

1. prouver l'offre ;
2. obtenir des résultats reproductibles ;
3. documenter le process ;
4. standardiser ;
5. automatiser ;
6. recruter ;
7. augmenter le volume ;
8. multiplier les campagnes ;
9. ouvrir de nouveaux segments.

Le scaling doit se faire uniquement lorsqu'un client / segment possède : une offre validée, une campagne reproductible, une délivrabilité stable, un process de qualification, un reporting fiable.

---

## 16. Économie d'unité

Pour chaque client, calculer :

- **Revenu** = retainer + revenus variables liés aux rendez-vous qualifiés / présents.
- **Coûts directs** = infrastructure email + scraping / data + enrichissement + séquençage + automatisation + main-d'œuvre delivery + commissions applicables.
- **Marge brute** = revenu − coûts directs.

Puis mesurer : marge par client, marge par rendez-vous, coût de delivery, temps humain par client, capacité maximale par opérateur.

**Objectif :** construire un modèle dans lequel l'augmentation du nombre de clients n'entraîne pas une augmentation proportionnelle des coûts humains.

**Repères actuels, par client et par mois, en phase de preuve à 12 rendez-vous
honorés :** recette 2 900 €, coûts directs 520 à 1 200 €, marge brute 1 700 à
2 380 €. Le facteur limitant n'est pas l'envoi mais le traitement des réponses :
un opérateur suit 4 à 6 clients. Seuil de rentabilité de la structure : 6 à 8
clients actifs.

---

## 17. Rétention

La rétention dépend principalement de : qualité des rendez-vous, capacité du client à closer, ROI, régularité, transparence du reporting, communication, vitesse de correction, capacité à renouveler les angles et segments.

Le client doit recevoir régulièrement : résultats, rendez-vous, opportunités, apprentissages, actions mises en place, prochaines optimisations.

Un mauvais résultat doit être expliqué par des données et accompagné d'un plan d'action.

---

## 18. Principes de fonctionnement

1. **Data avant volume.** Une mauvaise base détruit une bonne séquence.
2. **Qualité avant quantité.** Un rendez-vous pertinent vaut davantage que des dizaines de réponses inutiles.
3. **Process avant personnes.** Chaque tâche répétitive doit devenir un SOP.
4. **Automatiser après validation.** Ne pas automatiser un mauvais process.
5. **Mesurer chaque étape.** Scraping → délivrabilité → réponse → qualification → booking → show → closing.
6. **Séparer acquisition et delivery.** Leadcore doit avoir son propre moteur d'acquisition et un moteur de delivery standardisé.
7. **Conserver une boucle de feedback.** Les résultats commerciaux doivent revenir vers : ciblage, copy, qualification, offre, segmentation.
8. **La vitesse est un avantage.** Tester rapidement, mesurer rapidement, corriger rapidement.

---

## 19. Vision opérationnelle

Leadcore doit progressivement devenir une machine commerciale standardisée :

```
DATA → ENRICHISSEMENT → SCORING → OUTREACH → RÉPONSES
→ IA / CLASSIFICATION → QUALIFICATION → BOOKING → RÉUNION
→ OPPORTUNITÉ → CLIENT → REPORTING → OPTIMISATION → NOUVEAU CYCLE
```

À terme, l'objectif opérationnel est que la majorité des tâches répétitives soient automatisées, tandis que les humains se concentrent sur : stratégie de campagne, contrôle qualité, conversations à forte valeur, qualification complexe, closing, relation client, optimisation.

---

## 20. Documents / SOP à maintenir

| # | SOP |
|---|-----|
| 01 | ICP & Targeting SOP |
| 02 | Scraping SOP |
| 03 | Data Cleaning SOP |
| 04 | Enrichment SOP |
| 05 | Lead Scoring SOP |
| 06 | Domain Setup SOP |
| 07 | Email Deliverability SOP |
| 08 | Copywriting SOP |
| 09 | Campaign Launch SOP |
| 10 | Reply Handling SOP |
| 11 | Qualification SOP |
| 12 | Booking SOP |
| 13 | No-show SOP |
| 14 | Setter SOP |
| 15 | Closer SOP |
| 16 | Sales Call SOP |
| 17 | Client Onboarding SOP |
| 18 | Client Reporting SOP |
| 19 | QA SOP |
| 20 | Incident Management SOP |
| 21 | Weekly Review SOP |
| 22 | Hiring & Training SOP |
| 23 | CRM SOP |
| 24 | Automation / n8n SOP |
| 25 | Offboarding SOP |
| 26 | Renouvellement de segments SOP |

---

## 21. Résumé exécutif

Leadcore est une infrastructure commerciale B2B externalisée.

Le modèle repose sur une boucle simple :

1. trouver des entreprises correspondant à un ICP ;
2. identifier les décideurs ;
3. enrichir et nettoyer les données ;
4. contacter les prospects via outbound ;
5. gérer et classifier les réponses ;
6. qualifier les prospects ;
7. prendre les rendez-vous ;
8. transmettre des rendez-vous réellement pertinents ;
9. mesurer le résultat ;
10. optimiser la campagne ;
11. standardiser ce qui fonctionne ;
12. augmenter progressivement le volume.

En parallèle, Leadcore doit maintenir son propre pipeline commercial : scraping → outreach → booking → closing → contrat → onboarding.

Le véritable actif de Leadcore n'est donc pas uniquement la capacité à envoyer des emails. C'est la capacité à transformer de la donnée brute en opportunités commerciales de façon répétable, mesurable et progressivement automatisée.
