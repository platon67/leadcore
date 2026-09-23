# 00 — Recherche : plan, sources, constats

Partie de l'[Operating System outbound & delivery](README.md). Recherche menée
les 22 et 23 septembre 2026.

Ce fichier répond à une seule question avant tout le reste : **que faut-il
savoir pour concevoir la meilleure machine possible en septembre 2026 ?** Les
autres fichiers s'appuient sur les constats de la section 3 et renvoient ici
quand une décision dépend d'un chiffre externe.

---

## 1. Plan de recherche (phase 0)

Vingt-quatre catégories. Pour chacune : ce qu'on cherche à savoir, ce qu'on
compare, où on cherche, ce qu'on mesure, et l'hypothèse qu'on veut confirmer
ou tuer.

| # | Catégorie | Questions | Outils / options comparés | Sources prioritaires | Métriques | Hypothèse à vérifier |
|---|---|---|---|---|---|---|
| 1 | Infrastructure outbound | Quelle chaîne minimale pour envoyer 7 600 emails/client/mois sans toucher au domaine principal ? | Google Workspace, Microsoft 365, revendeurs (Mailforge, Infraforge, Zapmail, Maildoso), SMTP | Docs Google/Microsoft, pages tarifs | €/boîte, boîtes/domaine, délai de mise en service | Des boîtes Google/Microsoft réelles restent le bon standard pour du B2B FR |
| 2 | Délivrabilité | Quelles règles les boîtes de réception appliquent-elles réellement ? | Règles Gmail, Outlook, Yahoo | support.google.com, techcommunity.microsoft.com, RFC 7489 / 8058 | Seuil de plaintes, bounce, auth | Sous 5 000 envois/jour/domaine, les règles « bulk » ne s'appliquent pas entièrement, mais leurs seuils servent de garde-fous |
| 3 | Domaines / boîtes | Combien de boîtes par domaine, combien d'envois par boîte ? | 2, 3, 5 boîtes/domaine ; 20 à 50 envois/jour | Retours d'opérateurs, docs fournisseurs | Taux de suspension, placement inbox | 3 boîtes/domaine et ≤ 30 envois/jour limitent la casse |
| 4 | Bases de leads | Quelle couverture France pour les PME cibles ? | Apollo, Sales Navigator, Kaspr, Lusha, Pharow, bases publiques (Sirene) | Pages tarifs, tests sur échantillon | Taux de match, fraîcheur, coût/contact | Apollo couvre mal les PME françaises hors tech ; Sirene + enrichissement comble le trou |
| 5 | Scraping web | Quelles sources publiques exploitables, à quel risque ? | Google Maps (via Apify / Outscraper), sites web, annuaires | Conditions d'utilisation, CNIL | Coût/1 000 lignes, taux de complétude | Utile pour les verticales locales (santé, services), inutile pour le SaaS |
| 6 | Enrichissement | Waterfall ou fournisseur unique ? | Clay, FullEnrich, Dropcontact, Apollo | Tarifs, tests | Taux de trouvaille, taux de bounce après enrichissement | Le waterfall trouve 20 à 40 % d'emails de plus qu'une source unique |
| 7 | Vérification | Quel vérificateur, que faire des catch-all ? | MillionVerifier, NeverBounce, ZeroBounce, vérif intégrée au séquenceur | Tarifs, tests | €/1 000, part de catch-all, bounce réel | Les catch-all sont 20 à 40 % des domaines PME ; les jeter coûte trop de volume |
| 8 | Données LinkedIn | Qu'a-t-on le droit de collecter et comment ? | Sales Navigator (manuel), extensions, scrapers | CNIL (décision KASPR), CGU LinkedIn | Risque juridique, risque de bannissement | Le scraping de LinkedIn n'est pas une base de production défendable |
| 9 | Signaux d'intention | Quels signaux prédisent un besoin de Leadcore ? | Offres d'emploi (France Travail, TheirStack), levées, BODACC, changements de dirigeant, publicité | APIs publiques, tarifs | Coût/signal, fraîcheur, lift de réponse | Un recrutement de commercial double la probabilité de réponse |
| 10 | Personnalisation IA | Quel niveau paie ? | Aucune, variables, entreprise, persona, signal, recherche profonde | Tarifs API, benchmarks | Coût IA/contact, lift de réponse | Au-delà de la personnalisation par signal, le coût marginal dépasse le gain |
| 11 | Séquençage | Quel outil pour une agence multi-clients ? | Instantly, Smartlead, lemlist, Saleshandy | Pages tarifs, docs API | €/mois à 1, 10, 50 clients ; API ; webhooks | Le modèle de facturation par workspace décide du choix, pas les fonctionnalités |
| 12 | CRM | Quel CRM pour 2 pipelines + reporting client ? | Attio, HubSpot, Pipedrive, base maison (Postgres) | Tarifs, docs API | €/siège, API, objets personnalisés | Le CRM doit rester l'interface ; la vérité des données vit dans Postgres |
| 13 | Automatisation | n8n cloud ou auto-hébergé ? | n8n, Make, Zapier, code | Tarifs, licence | €/exécution, limites | n8n auto-hébergé suffit jusqu'à 100 clients |
| 14 | Classification des réponses | Règles, IA intégrée au séquenceur, ou LLM maison ? | Tags natifs, Claude Haiku/Sonnet | Tarifs API | Précision, coût/réponse | Un LLM atteint > 95 % de précision sur 8 classes avec 50 exemples |
| 15 | Prise de rendez-vous | Lien, créneaux proposés, ou booking fait par le setter ? | Cal.com (déjà utilisé par le site), Calendly, agenda client | Docs Cal | Taux de booking, show rate | Proposer 2 créneaux bat l'envoi d'un lien |
| 16 | Automatisation commerciale | Contrat, signature, paiement sans friction | Yousign, Stripe, GoCardless, Pennylane | Tarifs | Délai signature → paiement | Signature et paiement en un seul lien réduisent le délai à < 48 h |
| 17 | Onboarding client | Combien de jours entre signature et premier envoi ? | Questionnaire, appel, templates | Pratique interne | Délai, heures | 10 jours ouvrés sont tenables si les domaines sont achetés d'avance |
| 18 | Delivery client | Qu'est-ce qui distingue une campagne à 20 RDV d'une à 5 ? | Segmentation, signal, offre | Données internes, benchmarks | RDV/1 000 contacts | La qualité de l'offre du client pèse plus que la copy |
| 19 | Reporting | Quels chiffres le client doit-il voir ? | Dashboard, rapport hebdo, J+30 | Pratique | Rétention | Montrer l'activité sans le résultat business fait churner |
| 20 | Expérimentation | Quelle taille d'échantillon pour conclure ? | Tests A/B, bandits | Statistiques | Contacts/variante | Sur des taux de 1 à 3 %, il faut 1 000+ contacts par variante |
| 21 | Conformité | Quelle base légale, quelles obligations en B2B France ? | RGPD, L34-5 CPCE, CNIL | cnil.fr, Légifrance | Obligations, sanctions | Intérêt légitime + opt-out suffit en B2B si le message porte sur la fonction |
| 22 | Scalabilité | Où la machine casse-t-elle en premier ? | Traitement des réponses, infra, données | Modèle | Heures/client | Le goulot est humain, pas technique |
| 23 | Économie d'agence | Marge par client, CAC, payback | Modèle maison | Simulateur | Marge %, CAC, payback | Marge brute > 55 % dès la phase de preuve |
| 24 | Agents IA | Quelles tâches confier à un agent autonome ? | Workflows n8n + LLM, agents | Docs Anthropic | Taux d'erreur, coût | Recherche de comptes et brouillons de réponse oui ; envoi autonome non |

---

## 2. Hiérarchie des sources (phase 1)

| Niveau | Nature | Exemples utilisés ici | Usage |
|---|---|---|---|
| **Tier 1** | Documentation officielle, tarifs publics, régulateurs, standards | Gmail Help (sender guidelines), Microsoft Tech Community, CNIL, INSEE / data.gouv, pages tarifs Smartlead, API France Travail, tarifs API Anthropic | Fait foi. Une décision qui contredit un Tier 1 est fausse. |
| **Tier 2** | Spécialistes reconnus, études techniques | Rapport de benchmark Instantly 2026 (données agrégées d'un fournisseur, donc biaisé mais volumineux), Red Sift, dmarcian | Donne des ordres de grandeur. Recoupé avant usage. |
| **Tier 3** | Retours terrain | Forums d'opérateurs, comparatifs d'agences | Repère les limites cachées, les bannissements, les écarts marketing / réalité. Jamais un chiffre seul. |
| **Tier 4** | Marketing | Blogs d'outils concurrents qui publient les tarifs des autres, comparatifs affiliés | Utilisé pour trouver une piste, jamais comme preuve. |

Règle appliquée dans tout l'OS : **un tarif cité vient d'une page officielle
quand elle a pu être lue ; sinon il est marqué « à confirmer »** et le
simulateur le traite comme une hypothèse modifiable.

### Ce qui a été lu à la source et ce qui ne l'a pas été

| Donnée | Niveau obtenu | Statut |
|---|---|---|
| Règles d'envoi Gmail | Tier 1 (support.google.com/a/answer/81126) | Vérifié |
| Règles Outlook ≥ 5 000/jour | Tier 1 (annonce Microsoft) + Tier 2 | Vérifié |
| Annulation de la limite de 2 000 destinataires externes par boîte (Exchange Online) | Tier 2 (BleepingComputer, office365itpros, janvier 2026) | Vérifié par recoupement |
| Régime B2B de la prospection email en France | Tier 1 (cnil.fr, page datée juin 2026) | Vérifié |
| Sanction KASPR, 240 000 €, 5 décembre 2024 | Tier 1 (cnil.fr) | Vérifié |
| Tarifs Smartlead | Tier 1 (smartlead.ai/pricing) | Vérifié le 23/09/2026 |
| Tarifs Instantly, Apollo, Clay, HeyReach, FullEnrich, MillionVerifier, n8n | Tier 4 (comparatifs) recoupés entre 2 à 5 sources | **À confirmer sur la page officielle avant achat** |
| Tarif Google Workspace Business Starter en euros | Tier 4 recoupé | À confirmer |
| Tarifs API Claude | Tier 1 (documentation Anthropic, cache au 24/06/2026) | Vérifié |
| Benchmarks de réponse cold email | Tier 2 (Instantly, données 2025) | Ordre de grandeur, biaisé vers les utilisateurs de l'outil |
| Taux de présence aux RDV outbound | Tier 3/4 | Ordre de grandeur |

---

## 3. Constats (phase 2)

Chaque constat suit le même format : sources, contradictions, ce qui paraît
fiable, incertitude, conclusion pour Leadcore.

### 3.1 Les règles des boîtes de réception

**Sources.** [Gmail sender guidelines](https://support.google.com/a/answer/81126),
[FAQ Gmail](https://support.google.com/a/answer/14229414),
[Microsoft, exigences Outlook](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730),
[Postmaster Tools v2](https://www.suped.com/blog/ultimate-guide-to-google-postmaster-tools-v2).

**Ce qui est établi.**

| Exigence | Tous expéditeurs vers Gmail | ≥ 5 000 msg/jour vers Gmail | ≥ 5 000 msg/jour vers Outlook.com |
|---|---|---|---|
| SPF ou DKIM | Obligatoire | SPF **et** DKIM | SPF **et** DKIM |
| DMARC | Recommandé | Obligatoire (p=none suffit), aligné | Obligatoire (p=none suffit), aligné |
| PTR / DNS inverse valide | Obligatoire | Obligatoire | — |
| TLS | Obligatoire | Obligatoire | — |
| Taux de plainte | < 0,3 %, viser < 0,1 % | idem | — |
| Désinscription en un clic (RFC 8058) | — | Obligatoire pour les messages marketing | Recommandée |
| Conformité RFC 5322 | Obligatoire | Obligatoire | — |

Depuis novembre 2025, Gmail rejette ou retarde les messages non conformes au
lieu de les classer en spam. Postmaster Tools v2 (octobre 2025) remplace les
scores de réputation par un statut de conformité ; une analyse de
délivrabilité rédigée s'y ajoute depuis juin 2026.

Les lignes directrices Gmail disent aussi : « n'envoyez pas de messages à des
gens qui ne se sont pas inscrits » et « n'achetez pas d'adresses ». Le cold
email B2B est donc **toléré techniquement, pas approuvé** par Google. C'est le
premier risque structurel de tout le modèle : les règles d'un tiers peuvent
se durcir sans préavis.

**Contradiction.** Les outils de séquençage parlent de « bulk sender » comme si
chaque boîte comptait. Google compte au niveau du **domaine d'envoi** (les
messages vers des comptes Gmail personnels). Avec 5 domaines × 3 boîtes × 30
envois, un client envoie ~450 messages/jour : loin des 5 000. La plupart des
destinataires B2B français sont d'ailleurs sur Google Workspace ou Microsoft
365 professionnels, où les filtres d'entreprise s'appliquent et où la règle
« bulk » ne se transpose pas mot pour mot.

**Conclusion pour Leadcore.** Appliquer **toutes** les exigences « bulk » dès
le premier envoi, même sous le seuil : SPF + DKIM + DMARC alignés, en-tête
`List-Unsubscribe` + `List-Unsubscribe-Post` (un clic), plaintes < 0,1 %. Le
coût est nul, et la marge de sécurité est totale si Google baisse le seuil.

### 3.2 Microsoft 365 comme infrastructure d'envoi

**Sources.** [Microsoft : limite par boîte annulée](https://www.bleepingcomputer.com/news/microsoft/microsoft-cancels-plans-to-rate-limit-exchange-online-bulk-emails/),
[office365itpros, janvier 2026](https://office365itpros.com/2026/01/08/mailbox-external-recipient-rate/),
[limites Exchange Online](https://learn.microsoft.com/en-us/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits).

**Constat.** La limite de 2 000 destinataires externes par boîte et par 24 h,
annoncée pour avril 2026, est annulée « indéfiniment ». Une limite par
**tenant** (TERRL), calculée sur le nombre de licences, s'applique depuis
avril 2025. Pour 30 envois/jour/boîte, aucune de ces limites ne mord.

**Conclusion.** Microsoft 365 reste une option d'infrastructure valable,
utile pour **diversifier** : si un problème touche les boîtes Google, les
boîtes Microsoft continuent de produire. L'OS recommande un mélange 70 %
Google / 30 % Microsoft à partir du palier STANDARD (voir
[03-STACK](03-STACK.md)).

### 3.3 Volume par boîte

**Sources.** Tier 3/4 : [leadhaste](https://leadhaste.com/blog/google-workspace-cold-email-limits-2026),
[litemail](https://litemail.ai/blog/google-workspace-inbox-suspension-avoid),
[Instantly benchmark 2026](https://instantly.ai/cold-email-benchmark-report-2026).

**Constat.** La limite technique Google Workspace est de 2 000 messages/jour.
Les opérateurs convergent sur 15 à 40 envois/jour par boîte pour du cold
email, avec des déclencheurs de suspension connus : pic de volume sur une
boîte jeune, bounce > 2 %, plaintes > 0,1 %, authentification cassée, contenu
identique en masse, connexions anormales depuis l'outil d'envoi.

**Contradiction.** Le document de référence de Leadcore modélise 35 envois par
boîte et par jour. C'est dans la fourchette, mais proche du haut.

**Conclusion.** L'OS modélise **30 envois/jour/boîte** et **25 % de boîtes en
réserve** (chauffe, repos, remplacement). Pour 7 600 emails/mois, cela donne
13 boîtes actives et 17 provisionnées, contre « une dizaine » dans le
document de référence. L'écart coûte ~50 € par client et par mois. Il achète
une production qui ne tombe pas quand deux boîtes sont suspendues.

### 3.4 Warm-up

**Sources.** Tier 2/3 : [zeliq](https://www.zeliq.com/blog/email-warmup),
[warmforge](https://www.warmforge.ai/blog/does-email-warmup-work),
[Instantly benchmark](https://instantly.ai/cold-email-benchmark-report-2026).
Aucune source Tier 1 : Google et Microsoft ne documentent pas le warm-up.

**Ce qui converge.**

- Un domaine et une boîte neufs, sans historique, sont filtrés plus durement.
  Ce point fait consensus.
- Les réseaux de warm-up automatiques (boîtes qui s'envoient des messages et
  les sortent du spam entre elles) produisent des schémas que Gmail et
  Microsoft détectent de mieux en mieux depuis 2024, surtout les petits
  réseaux.
- Durées citées : 2 à 3 semaines minimum, 4 à 6 semaines selon Instantly
  (5 à 10 emails/jour au départ).

**Ce qui est du marketing.** Les scores de « santé » affichés par les outils
de warm-up mesurent le placement **au sein de leur propre réseau**. Ils ne
disent rien du placement chez un prospect réel sous Microsoft 365 avec une
passerelle de sécurité.

**Conclusion pour Leadcore.** Le warm-up automatique sert à créer un
historique d'envoi, pas une réputation. Ce qui construit la réputation, c'est
l'engagement réel : réponses, absence de plaintes, absence de bounce. L'OS
retient donc :

1. warm-up automatique du séquenceur (inclus, gratuit) pendant 14 jours
   minimum, maintenu à faible volume ensuite ;
2. ramp-up réel lent : les premiers envois vont aux segments les **mieux
   vérifiés et les plus susceptibles de répondre** (données propres, signal
   fort) ;
3. le critère de passage à plein volume est une mesure (bounce, plaintes,
   test de placement), pas une date. Détail en
   [01-MOTEUR-A §A8](01-MOTEUR-A.md#a8--warm-up--ramp-up).

### 3.5 Taux de réponse de référence

**Source.** [Instantly, Cold Email Benchmark Report 2026](https://instantly.ai/cold-email-benchmark-report-2026)
(données 2025, « des milliards d'interactions »), recoupé avec
[Apollo](https://www.apollo.io/insights/whats-the-expected-reply-rate-for-a-well-run-outbound-cold-email-campaign)
et [Snov](https://snov.io/blog/cold-email-statistics/).

| Indicateur | Valeur | Commentaire |
|---|---|---|
| Taux de réponse moyen | 3,43 % | Par email ou par contact selon les sources ; Instantly ne précise pas clairement |
| Top 25 % | ≥ 5,5 % | |
| Top 10 % | ≥ 10,7 % | |
| Part des réponses au 1er email | 58 % | Les relances produisent 42 % |
| Longueur optimale | < 80 mots | |
| Séquence | 4 à 7 touches | |
| Réponses positives / réponses | 30 à 50 % | Tier 4, fourchette large |
| Bounce cible | < 2 % | |

**Contradiction avec le modèle Leadcore.** Le document de référence suppose
1,5 % de réponses positives **par contact** et ~6,3 % de réponses totales
(120 réponses pour 1 900 contacts). C'est un taux de réponse proche du top
25 %, avec une part positive de 24 %, en dessous de la fourchette 30-50 %.
Les deux hypothèses se compensent : le positif par contact (1,5 %) tombe dans
la fourchette publiée de 0,5 à 2 %.

**Conclusion.** Le scénario BASE garde 1,5 % : il est défendable, sans marge.
LOW COST prend 1,0 %, HIGH PERFORMANCE 2,5 %. **La première donnée à
remplacer par une mesure réelle, c'est celle-ci**, dès les 2 000 premiers
contacts envoyés.

### 3.6 Taux de présence

**Sources.** Tier 3/4 : [RevenueHero](https://www.revenuehero.io/reports/no-show-benchmark-december-02-2024),
[growthspree](https://www.growthspreeofficial.com/blogs/b2b-saas-demo-show-up-rate-no-show-recovery-benchmarks-2026-by-channel-acv-reminder-cadence),
[SalesHive](https://saleshive.com/blog/how-to-reduce-b2b-meeting-no-shows).

**Constat.** RDV outbound bookés par SDR : 55 à 65 % de présence en médiane,
25 à 35 % de no-show. Une cadence de confirmation en 4 touches (confirmation
immédiate, J-1, SMS 1-2 h avant, rappel calendrier) ramènerait le no-show
sous 10 % selon les mêmes sources, ce qui paraît optimiste.

**Conclusion.** 75 % (hypothèse du document de référence) est atteignable
**uniquement avec la cadence de rappels** décrite en
[02-MOTEUR-B §B1](02-MOTEUR-B.md). Sans elle, compter 60 %. Le SMS 1 à 2 h
avant le RDV est le levier le moins cher et le plus fort ; il demande le
numéro du prospect, donc une question au moment du booking.

### 3.7 Séquenceur : le modèle de facturation décide

**Sources.** [Smartlead pricing](https://www.smartlead.ai/pricing) (Tier 1, lu
le 23/09/2026) ; Instantly via [Woodpecker](https://woodpecker.co/blog/instantly-ai-pricing/),
[Saleshandy](https://www.saleshandy.com/blog/instantly-pricing/),
[Salesforge](https://www.salesforge.ai/blog/instantly-ai-review) (Tier 4).

| | Smartlead | Instantly |
|---|---|---|
| Entrée utile | Pro 94 $/mois : 30 000 contacts, 90 000 emails, API + webhooks | Hypergrowth 97 $/mois : 25 000 contacts, 125 000 emails, webhooks |
| Palier suivant | Unlimited 174 $ : contacts illimités, 150 000 emails | Light Speed 358 $ : 100 000+ contacts, 500 000+ emails |
| Haut | Prime 379 $ : 500 000 emails, infrastructure privée, workspaces clients | Sur devis |
| Boîtes et warm-up | Illimités | Illimités |
| Multi-clients | Clients dans un compte ; marque blanche 29 $/client en option | **Un abonnement par workspace** : le coût croît avec chaque client isolé |

**Conclusion.** Pour le moteur B (N clients), Smartlead : le coût dépend du
volume d'emails, pas du nombre de clients. Pour le moteur A (un seul
« client », Leadcore), les deux se valent ; l'OS prend **un compte séparé**
pour que la réputation d'envoi de Leadcore ne dépende pas de celle des
clients. Détail et seuils de changement en [03-STACK](03-STACK.md).

### 3.8 Données : la France n'est pas les États-Unis

**Sources.** [Apollo pricing](https://www.warmly.ai/p/blog/apollo-pricing) (Tier 4),
[API Recherche d'entreprises](https://annuaire-entreprises.data.gouv.fr/donnees/api-entreprises) (Tier 1),
[base Sirene](https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret) (Tier 1),
[API Offres d'emploi France Travail](https://francetravail.io/data/api/offres-emploi) (Tier 1),
[Pappers API](https://www.pappers.fr/api), [Dropcontact](https://growth-hacker.fr/dropcontact/),
[FullEnrich](https://fullenrich.com/pricing).

**Constats.**

- Apollo : 49 à 119 $/siège/mois, crédits d'export limités (10 000/an sur
  Basic). Couverture forte sur la tech et les ETI, plus faible sur les PME
  françaises traditionnelles (cabinets, industrie, services locaux). Constat
  Tier 3, cohérent entre sources.
- La base **Sirene** est gratuite, exhaustive pour les entreprises
  françaises (SIREN, NAF, adresse, tranche d'effectif), accessible par API et
  en fichier. Elle ne donne ni contact nominatif ni email : c'est un
  **squelette de comptes**, pas une liste de prospects.
- L'**API Offres d'emploi** de France Travail est gratuite (compte + OAuth2,
  10 appels/s) et couvre ~300 000 offres actives. C'est le signal de
  recrutement le moins cher du marché français.
- Pappers : API payante dès ~20 €/mois, données financières (CA, résultat) et
  dirigeants issus des registres légaux.
- Dropcontact : enrichissement algorithmique sans base stockée, 24 à 99 €/mois,
  fort sur l'Europe, faible hors Europe, pas de mobiles.
- FullEnrich : waterfall sur 20+ fournisseurs, 1 crédit/email trouvé, rien
  facturé si rien trouvé, dès ~29 $/mois pour 500 crédits.

**Conclusion.** Architecture de données à deux entrées : **comptes** depuis
Sirene / Pappers (France) et Apollo (international, tech), **contacts** depuis
Apollo / Sales Navigator puis waterfall d'enrichissement. Le détail est en
[02-MOTEUR-B §B3-B4](02-MOTEUR-B.md).

### 3.9 Clay en 2026

**Sources.** Tier 4 recoupé : [Valley](https://www.joinvalley.co/blog/clay-pricing-and-credits-explained-2026),
[Cleanlist](https://www.cleanlist.ai/blog/2026-03-12-clay-pricing-changes-2026),
[Saruggia](https://michaelsaruggia.com/blog/clay-pricing-change-2026).

**Constat.** Mars 2026 : deux plans (Launch 185 $/mois, Growth 495 $/mois),
deux compteurs indépendants (crédits de données et « actions » de workflow),
coûts de la marketplace de données en baisse de 50 à 90 %.

**Conclusion.** Clay est un **accélérateur d'itération** (tester un filtre, un
enrichissement, un score en une heure), pas un moteur de production à bas
coût : chaque ligne traitée consomme des actions. L'OS le place au palier
STANDARD pour le prototypage, et fait tourner la production récurrente dans
n8n + Postgres dès que le workflow est validé (principe « automatiser après
validation »).

### 3.10 LinkedIn

**Sources.** [CNIL, sanction KASPR](https://www.cnil.fr/fr/aspiration-de-donnees-sanction-de-240-000-euros-lencontre-de-la-societe-kaspr) (Tier 1),
[HeyReach](https://overloop.com/blog/heyreach-review) (Tier 4),
[Sales Navigator](https://business.linkedin.com/sell/sales-navigator/compare-plans).

**Constats.**

- La CNIL a sanctionné KASPR de 240 000 € (5 décembre 2024) pour avoir
  collecté sur LinkedIn des coordonnées que les membres avaient choisi de
  masquer, entre autres manquements. Un client de Leadcore qui recevrait des
  contacts de cette origine hérite du risque.
- LinkedIn limite les invitations à ~100 par semaine et par compte, quel que
  soit l'outil. HeyReach plafonne à 25-40/jour et 200/semaine. LinkedIn a
  retiré la page entreprise de HeyReach le 25 mars 2026.
- Sales Navigator Core : ~121 €/mois (UE), ~91 €/mois en annuel.

**Conclusion.** LinkedIn est un **canal d'appoint et une source de
qualification manuelle**, pas une source de données de masse ni un canal
Blitzkrieg. L'OS l'utilise : (1) Sales Navigator pour construire et vérifier
des listes de comptes, (2) comme second canal sur les comptes à score élevé,
à ~20 invitations/jour et par profil réel, jamais avec des comptes achetés.

### 3.11 Conformité France

**Sources.** [CNIL, prospection par courrier électronique](https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique)
(Tier 1, page datée juin 2026), article L34-5 du CPCE, RGPD art. 6.1.f, 14, 21 ;
[analyse Kohen avocats, 21/09/2026](https://kohenavocats.fr/2026/09/21/emails-commerciaux-non-sollicites-b2b-consentement-opposition-cnil-reparation-2026/) (Tier 2).

**Constat.** En B2B, pas de consentement préalable si le message porte sur
la fonction professionnelle du destinataire, que la personne a été informée
et peut s'opposer simplement dans chaque message. Les adresses génériques
(contact@, info@) sortent du régime de la prospection. Aucune réforme du
L34-5 en 2025-2026 à la date de la recherche.

**Conclusion.** Base légale : intérêt légitime, avec une analyse documentée
(LIA). Obligation d'information à la première prise de contact (art. 14),
lien d'opposition dans chaque message, liste d'opposition globale et
permanente. Détail et points à faire valider par un avocat :
[08-CONFORMITE](08-CONFORMITE.md).

### 3.12 Coût de l'IA

**Source.** Documentation Anthropic (Tier 1).

| Modèle | Entrée $/M tokens | Sortie $/M tokens | Usage dans l'OS |
|---|---|---|---|
| Claude Haiku 4.5 | 1,00 | 5,00 | Classification des réponses, normalisation, scoring simple, première ligne personnalisée |
| Claude Sonnet 5 | 2,00 | 10,00 | Recherche de compte, brouillons de réponse, analyse de campagne |
| Claude Opus 5 | 5,00 | 25,00 | Analyse mensuelle, stratégie ICP, audits — faible volume |

L'API Batch coûte 50 % du tarif standard (réponse en asynchrone, sous 24 h),
et les lectures en cache de prompt environ 10 % du tarif d'entrée. Les deux
s'appliquent à la personnalisation de masse, qui n'est pas urgente.

**Ordre de grandeur calculé.** Une première ligne personnalisée à partir d'un
résumé de site (≈ 1 500 tokens en entrée, 150 en sortie) sur Haiku 4.5 en
batch : ≈ 0,0011 $ par contact, soit ~2 € pour 1 900 contacts. Une recherche
de compte avec Sonnet 5 et recherche web : 0,02 à 0,05 $ par compte.
**L'IA n'est pas un poste de coût significatif** ; les données et les heures
humaines le sont. Le détail par niveau de personnalisation est en
[01-MOTEUR-A §A10](01-MOTEUR-A.md#a10--personnalisation-ia).

### 3.13 Automatisation : n8n

**Sources.** Tier 4 recoupé ([sliplane](https://sliplane.io/blog/n8n-pricing),
[nocode.mba](https://www.nocode.mba/articles/n8n-pricing)).

**Constat.** n8n Cloud Starter ~20-24 €/mois (2 500 exécutions), Pro
~50-60 €/mois (10 000 exécutions). Community Edition auto-hébergée : gratuite,
exécutions illimitées, un VPS à 5-20 €/mois. Une exécution = un passage du
workflow, quel que soit le nombre de nœuds.

**Conclusion.** Auto-hébergé dès le départ. À 100 clients, les webhooks de
réponses seuls produisent ~12 000 à 16 000 exécutions/mois ; le plan cloud
deviendrait le poste limitant. Le coût réel de l'auto-hébergement est la
maintenance : sauvegardes, mises à jour, supervision (voir
[07-PANNES](07-PANNES.md)).

### 3.14 CRM

**Sources.** Tier 4 recoupé ([Attio](https://marketbetter.ai/blog/attio-crm-pricing-breakdown-2026/),
[HubSpot](https://saaspricehub.io/tools/hubspot-sales-hub),
[Pipedrive](https://www.apexure.com/blog/hubspot-vs-pipedrive)).

| | Prix/siège/mois | Point fort | Point faible pour Leadcore |
|---|---|---|---|
| Attio | 0 (3 sièges), 29 $, 69 $ | Objets personnalisés, API propre, pensé pour être alimenté par des données externes | Écosystème plus petit |
| HubSpot Starter | ~20 $ | Écosystème, familiarité des clients | Saut de prix au palier Pro (100 $ + 1 500 $ d'onboarding) |
| Pipedrive | 14 à 79 $ | Pipeline commercial simple | Modèle de données rigide pour le multi-client |

**Conclusion.** Attio pour le moteur A (pipeline de vente Leadcore) et comme
vue opérationnelle ; **Postgres (Supabase) comme source de vérité** pour les
données de delivery. Le CRM ne doit pas porter 190 000 contacts/mois à 100
clients : ce n'est pas son rôle.

### 3.15 Signature et paiement

**Sources.** [Yousign](https://salesdorado.com/closing/avis-yousign/) (Tier 4).

**Constat.** Yousign : 23 à 38 €/utilisateur/mois pour signature simple
illimitée ; API dès ~104 €/mois. Marque en transition vers « Youtrust » en
2026.

**Conclusion.** Plan Plus sans API au départ (le volume de contrats Leadcore
reste faible), déclenché par n8n via un modèle. Paiement : lien Stripe (ou
GoCardless pour le prélèvement SEPA du retainer), envoyé dans le même
message que la signature.

---

## 4. Incertitudes qui restent ouvertes

| Incertitude | Pourquoi elle compte | Comment la lever | Échéance |
|---|---|---|---|
| Taux de positif réel sur la niche choisie | Tout le modèle en dépend (±50 % sur les RDV) | Mesurer sur les 2 000 premiers contacts | J+30 du premier envoi |
| Part de catch-all dans les PME françaises ciblées | Fixe le rendement du sourcing | Échantillon de 500 domaines passé au vérificateur | Semaine 1 |
| Couverture Apollo sur la niche | Décide de l'achat Apollo vs Sales Nav + Sirene | Test : 200 comptes Sirene → combien de décideurs trouvés | Semaine 1 |
| Comportement des passerelles de sécurité (Mimecast, Proofpoint, Vade) chez les prospects | Le placement réel en B2B FR est moins bien mesuré que Gmail | Tests de placement sur des boîtes semences B2B | Mensuel |
| Évolution des règles Google/Microsoft | Risque de plateforme | Veille mensuelle (07-PANNES) | Continu |
| Tarifs à confirmer (voir tableau §2) | Écart de ±20 % sur les coûts outils | Lire la page officielle au moment de l'achat | À l'achat |
