# 08 — Conformité

Partie de l'[Operating System outbound & delivery](README.md).

**Ce fichier n'est pas un avis juridique.** Il rassemble les règles
identifiées pendant la recherche (sources Tier 1 en 00-RECHERCHE §3.11),
la façon dont l'OS les applique, et la liste des points qu'un avocat en
droit des données doit valider avant la mise en production. Le sujet est
ouvert dans MAJ-OFFRE §5 ; ce fichier prépare sa fermeture.

---

## H1 — Le cadre applicable

| Texte | Ce qu'il impose à Leadcore | Source |
|---|---|---|
| RGPD, art. 6.1.f | Base légale : intérêt légitime, à documenter par une mise en balance | Règlement (UE) 2016/679 |
| RGPD, art. 14 | Informer la personne dont les données n'ont pas été collectées auprès d'elle, au plus tard au premier contact | idem |
| RGPD, art. 21 | Droit d'opposition à la prospection : absolu, sans justification | idem |
| RGPD, art. 17 | Droit à l'effacement | idem |
| RGPD, art. 28 | Contrat de sous-traitance (DPA) quand Leadcore traite pour le compte d'un client | idem |
| RGPD, art. 30 | Registre des traitements | idem |
| RGPD, art. 33 | Notification de violation sous 72 h | idem |
| RGPD, chap. V | Transferts hors UE (outils américains) | idem |
| CPCE, art. L34-5 | Prospection par voie électronique : consentement préalable, sauf exception B2B (message en rapport avec la profession) | Code des postes et des communications électroniques |
| Doctrine CNIL | En B2B : information, opposition simple dans chaque message, objet en rapport avec la fonction ; adresses génériques hors régime | [cnil.fr](https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique), page datée juin 2026 |
| Règles Gmail / Outlook | Authentification, désinscription un clic, plaintes < 0,3 % | 00-RECHERCHE §3.1 |
| CGU LinkedIn | Interdiction du scraping et de l'automatisation non autorisée | CGU LinkedIn |

Sanctions de référence citées pendant la recherche : **KASPR, 240 000 €**
(CNIL, 5 décembre 2024) pour collecte de coordonnées sur LinkedIn malgré le
choix de visibilité des membres ; **Futura Internationale, 500 000 €**
(2019, confirmée par le Conseil d'État en 2021) pour démarchage malgré
opposition.

---

## H2 — Base légale et rôles

### H2.1 Deux traitements distincts

| Traitement | Qui décide des finalités | Rôle de Leadcore | Base légale envisagée |
|---|---|---|---|
| **Moteur A** : prospection des clients de Leadcore | Leadcore | Responsable de traitement | Intérêt légitime (prospection B2B) |
| **Moteur B** : prospection pour le compte d'un client | Le client (sa cible, son offre, son message validé) | **Sous-traitant** du client, a priori | Intérêt légitime **du client** |

**Point à valider (J1)** : dans le moteur B, Leadcore choisit les sources,
construit la base, décide du ciblage détaillé et réutilise sa méthode. Un
avocat doit dire si Leadcore reste sous-traitant, devient responsable
conjoint (art. 26), ou responsable distinct pour la constitution de la base.
Le rôle détermine qui signe quoi, qui répond aux demandes, et si Leadcore
peut réutiliser des données enrichies d'un client à l'autre (B4.1).

### H2.2 Mise en balance (LIA) à rédiger

Une page par moteur, conservée au registre :

| Question | Réponse attendue pour Leadcore |
|---|---|
| Intérêt poursuivi | Proposer un service B2B à des professionnels dont la fonction est concernée |
| Nécessité | Contacter une personne précise (décideur) est nécessaire ; pas de moyen moins intrusif équivalent pour une offre de niche |
| Attentes raisonnables | Un directeur commercial s'attend à être sollicité sur l'acquisition commerciale ; un comptable non |
| Garanties | Ciblage par fonction ; minimisation (données professionnelles seulement) ; information au premier email ; opposition en un clic ; plafond de fréquence (B4.2) ; durée de conservation ; pas de données sensibles |
| Conclusion | Intérêt légitime retenu sous ces garanties |

La règle « **le message porte sur la fonction du destinataire** » est
appliquée par la matrice A5 : le persona ciblé doit avoir un lien direct avec
l'offre. Un contact dont la fonction ne correspond à aucun persona n'est pas
contacté.

---

## H3 — Ce que chaque email contient

| Élément | Où | Obligatoire | Mise en œuvre |
|---|---|---|---|
| Identité de l'expéditeur | Signature | Oui (CNIL) | Nom, fonction, société (le client dans le moteur B), adresse ou site |
| Moyen d'opposition simple et gratuit | Pied de chaque email | Oui (CNIL, L34-5) | Phrase + lien vers une page d'opposition en un clic ; réponse « stop » traitée comme opposition (LC-008) |
| En-têtes `List-Unsubscribe` et `List-Unsubscribe-Post` | En-têtes | Gmail ≥ 5 000/j ; appliqué partout (00-RECHERCHE §3.1) | Configuration du séquenceur |
| Information art. 14 | Premier email : phrase courte + lien vers une notice | Oui (RGPD) | « Vos coordonnées professionnelles proviennent de [source publique / base B2B]. En savoir plus / vous opposer : [lien] » |
| Objet en rapport avec le contenu | Objet | Oui (pratique CNIL, loyauté) | Relecture QA |

**Point à valider (J2)** : la notice d'information peut-elle être un lien
(information en deux niveaux) plutôt qu'un texte complet dans l'email ? La
pratique courante et les lignes directrices européennes admettent
l'information par niveaux ; à confirmer pour le premier email de
prospection.

Exemple de pied d'email (moteur B, au nom du client) :

> Vous recevez ce message en tant que {{fonction}} chez {{societe}} ; vos
> coordonnées professionnelles proviennent de {{source}}. Pour ne plus être
> contacté : {{lien_opposition}} ou répondez « stop ». Informations sur vos
> données : {{lien_notice}}.

---

## H4 — Opposition et suppression

| Règle | Mise en œuvre |
|---|---|
| L'opposition vaut pour **tous** les messages futurs de l'émetteur | Suppression globale (LC-023), tous moteurs, tous clients |
| Traitement immédiat | Objectif < 1 h ; LC-023 arrête toutes les séquences |
| Toute formulation vaut opposition | Détecteur de mots-clés + classification ; dans le doute, suppression |
| Conserver la trace pour ne pas recontacter | Hash SHA-256 de l'email dans `suppression.value_hash`, conservé même après effacement |
| Le client transmet ses propres oppositions | Import à l'onboarding ; mise à jour mensuelle |
| Leadcore transmet les oppositions au client | Export mensuel au client (moteur B), pour sa propre base |

**Point à valider (J3)** : une opposition reçue pour le client X doit-elle
bloquer aussi les campagnes des clients Y et Z ? L'OS l'applique par
prudence (et pour la réputation d'envoi), mais la personne s'est opposée au
client X, pas à Y. Bloquer davantage est sans risque juridique ; vérifier
seulement que la conservation du hash au-delà de la relation avec X est
fondée.

---

## H5 — Sources de données

| Source | Statut dans l'OS | Condition |
|---|---|---|
| Sirene, Pappers (données d'entreprises) | Autorisée | Données publiques sur les personnes morales ; les noms de dirigeants sont des données personnelles, traitées comme telles |
| Bases B2B (Apollo…) | Autorisée sous conditions | Le fournisseur doit documenter l'origine et l'information des personnes ; clause contractuelle ; **point à valider (J4)** : diligence sur l'origine des données Apollo pour des personnes situées dans l'UE |
| Enrichissement (FullEnrich, Dropcontact) | Autorisée sous conditions | Idem ; Dropcontact revendique une génération algorithmique sans base stockée |
| Sales Navigator | Autorisée en usage manuel | Consultation et saisie ; pas d'extraction automatisée |
| Scraping de LinkedIn / extensions d'extraction de coordonnées | **Interdit** | Décision KASPR ; CGU LinkedIn |
| Google Maps via services tiers | Limité | Données d'entreprise (nom, site, téléphone du standard) ; pas de données personnelles |
| Sites web publics | Autorisé | Pages publiques, robots.txt respecté, usage limité à la personnalisation et à la qualification |
| Offres d'emploi (API France Travail) | Autorisé | Données d'entreprise ; API officielle |
| Adresses génériques (contact@) | Hors régime de la prospection (CNIL) | Utiles pour les TPE sans décideur identifiable ; taux de réponse faible |

---

## H6 — Durées de conservation

| Donnée | Durée proposée | Référence | À valider |
|---|---|---|---|
| Prospect sans réponse | 3 ans après la collecte ou le dernier contact émanant du prospect | Référentiel CNIL sur la gestion commerciale (prospects) | **J5** : durée plus courte (12-24 mois) pour une base de prospection froide ? |
| Prospect qui a répondu négativement | Données supprimées ; hash conservé en suppression | Opposition | — |
| Opposition (hash) | Tant que Leadcore prospecte | Nécessaire pour respecter l'opposition | J5 |
| Réponses (texte) | 12 mois, puis anonymisation du texte | Minimisation | J5 |
| Données de campagne d'un client terminé | Restitution ou suppression à la fin du contrat + 3 mois | DPA | J6 |
| Enregistrements d'appels d'onboarding | 6 mois | Minimisation | Consentement recueilli en début d'appel |
| Données de facturation | 10 ans | Code de commerce | — |

LC-027 applique ces durées chaque semaine.

---

## H7 — Sous-traitants et transferts

| Outil | Données personnelles traitées | Localisation / transfert | Document à obtenir |
|---|---|---|---|
| Smartlead, Instantly | Contacts, emails, réponses | États-Unis (à vérifier) | DPA + mécanisme de transfert |
| Apollo, FullEnrich, Clay | Contacts | États-Unis / UE selon l'outil | DPA + transfert |
| Dropcontact | Contacts | France | DPA |
| MillionVerifier | Emails | À vérifier | DPA |
| Anthropic (Claude API) | Textes de sites, réponses | États-Unis | DPA ; paramétrage de rétention |
| Supabase | Toute la base | Région UE à choisir à la création | DPA ; région UE |
| n8n (auto-hébergé) | Toute la chaîne | VPS en UE | — |
| Google Workspace, Microsoft 365 | Emails | UE / États-Unis | Conditions standard |
| Attio | Opportunités moteur A | À vérifier | DPA |
| Cal, Yousign, Stripe, Brevo / Twilio | RDV, signatures, paiements, téléphones | Variable | DPA |

Les transferts vers les États-Unis peuvent reposer sur le **Data Privacy
Framework** (décision d'adéquation de juillet 2023) pour les fournisseurs
certifiés, ou sur les clauses contractuelles types. **Point à valider (J7)** :
vérifier la certification DPF de chaque fournisseur américain et l'état des
recours contre la décision d'adéquation au moment de la mise en production.

Dans le moteur B, Leadcore sous-traitant fait appel à ces outils en tant que
**sous-traitants ultérieurs** : leur liste doit figurer au DPA signé avec le
client, avec son accord (art. 28.2).

---

## H8 — Contrat client (volet données)

À ajouter au contrat type (liste de MAJ-OFFRE §2, étendue) :

1. DPA art. 28 : objet, durée, nature, finalité, catégories de données et de
   personnes, obligations, sous-traitants ultérieurs listés, assistance aux
   demandes des personnes, notification de violation, sort des données en
   fin de contrat.
2. Rôle de chacun (après validation J1).
3. Garantie du client que l'offre promue relève bien de la fonction des
   personnes ciblées (il valide l'ICP et les personas).
4. Expéditeurs : accord écrit des personnes du client dont le nom signe les
   emails.
5. Oppositions : échange dans les deux sens (H4).
6. Propriété des domaines et de la base à la sortie (MAJ-OFFRE §2 point 5).
7. Exclusivité niche × zone (B4.3).

---

## H9 — Politiques Google et Microsoft

| Politique | Écart avec la pratique cold email | Traitement dans l'OS |
|---|---|---|
| Gmail : « n'envoyez pas à des gens qui ne se sont pas inscrits » | Le cold email B2B n'est pas « inscrit » | Risque de plateforme assumé et surveillé (07-PANNES G2) ; volumes bas par domaine ; plaintes < 0,1 % |
| Gmail : « n'achetez pas d'adresses » | Les bases B2B sont des achats de données | Vérification, ciblage étroit, plafond de fréquence |
| Conditions d'utilisation de Google Workspace et Microsoft 365 | L'usage de boîtes pour de la prospection en volume peut être jugé abusif | Volumes par boîte bas ; boîtes réelles avec expéditeurs réels ; pas de boîtes « fantômes » |

Le cold email B2B est légal en France dans le cadre de H1-H3. Il est
**toléré** par les plateformes tant que les signaux (plaintes, bounces,
engagement) restent sains. C'est un risque d'entreprise, pas seulement un
risque technique ; la mitigation de long terme est le canal 2 et les
recommandations (A15.4).

---

## H10 — Hors de France

Le filtre K8 (A1) inclut Belgique, Suisse romande et Luxembourg. Les règles
n'y sont pas celles de la France :

| Pays | Point d'attention (à valider) |
|---|---|
| Belgique | Le régime belge de la prospection par email (Code de droit économique, arrêté royal du 4 avril 2003) prévoit une exception pour les adresses **impersonnelles** de personnes morales ; les adresses nominatives pourraient demander un consentement |
| Suisse | La loi contre la concurrence déloyale (art. 3 al. 1 let. o LCD) vise la publicité de masse sans consentement ; son application au B2B nominatif est à vérifier ; LPD révisée en vigueur depuis septembre 2023 |
| Luxembourg | Transposition de la directive ePrivacy : régime à vérifier pour les adresses nominatives |

**Point à valider (J8)** : tant que ces régimes ne sont pas confirmés, le
filtre K8 se limite à la **France**, et les prospects des autres pays ne sont
contactés qu'à leur adresse générique ou après un premier contact entrant.

---

## H11 — Autres points

| Sujet | Règle |
|---|---|
| Enregistrement des appels (onboarding, vente) | Informer et recueillir l'accord au début de l'appel ; conservation limitée (H6) |
| SMS de rappel | Numéro demandé au booking pour ce seul usage ; pas de prospection par SMS (consentement requis en B2C comme en B2B pour les SMS, à confirmer J9) |
| Personnalisation par IA | Pas de données sensibles ; pas d'inférence sur la personne (santé, opinions) ; seulement des faits d'entreprise sourcés |
| Règlement européen sur l'IA | Les obligations de transparence de l'art. 50 s'appliquent depuis août 2026 ; **point à valider (J10)** : un email rédigé avec l'aide d'une IA puis relu et envoyé par une personne entre-t-il dans le champ ? A priori non, à confirmer |
| Registre des traitements | Un registre par moteur ; mis à jour à chaque nouvel outil |
| Sécurité | Accès nominatifs, 2FA partout, sauvegardes chiffrées, journal d'accès à Postgres |

---

## H12 — Points à faire valider par un avocat

| # | Question | Pourquoi elle bloque | Priorité |
|---|---|---|---|
| J1 | Rôle de Leadcore dans le moteur B (sous-traitant, responsable conjoint, responsable distinct) | Détermine le DPA, la réutilisation des données, la responsabilité | Avant le 1er client |
| J2 | Information art. 14 par lien dans le premier email | Forme du pied d'email | Avant le 1er envoi |
| J3 | Portée inter-clients de l'opposition et conservation du hash | Suppression globale | Avant le 1er client |
| J4 | Diligence sur l'origine des bases B2B (Apollo) pour des résidents UE | Risque type KASPR par ricochet | Avant le 1er envoi |
| J5 | Durées de conservation (prospects froids, réponses, hash) | LC-027 | Avant le 1er envoi |
| J6 | Sort des données à la fin d'un contrat client | DPA | Avant le 1er client |
| J7 | Transferts hors UE, certification DPF de chaque outil | DPA, registre | Avant le 1er client |
| J8 | Régimes belge, suisse, luxembourgeois | Filtre K8 | Avant d'élargir la zone |
| J9 | SMS de rappel de RDV (information, base légale) | LC-018 | Avant le 1er RDV |
| J10 | Règlement IA : transparence sur les emails assistés par IA | Mentions | Avant le 1er envoi |
| J11 | Clauses du contrat client (H8), notamment exclusivité et propriété des domaines | Contrat type (MAJ-OFFRE §6, case non cochée) | Avant le 1er client |
