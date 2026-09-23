# 12 — Prompts

Partie de l'[Operating System outbound & delivery](README.md).

Dix prompts utilisés par les workflows n8n. Règles communes :

- **Sortie structurée** : chaque prompt qui alimente un workflow renvoie du
  JSON validé par un schéma (`output_config.format` de l'API Claude). Un
  échec de validation déclenche un nouvel essai, puis une revue humaine.
- **Aucun fait sans source** : les prompts qui écrivent pour un prospect ne
  reçoivent que des faits sourcés et doivent citer la source de chaque fait
  utilisé.
- **Partie fixe en premier** : instructions, exemples et schéma en tête du
  prompt (mis en cache) ; données variables à la fin.
- **Versionnage** : chaque prompt porte une version (`P5-v3`) écrite dans
  `ai_call_log` ; un changement de prompt se teste sur 50 cas réels avant
  mise en production.
- Les modèles indiqués sont ceux de 03-STACK ; changer de modèle est un
  changement de prompt (nouvelle version, nouveau test).

| # | Usage | Workflow | Modèle | Mode |
|---|---|---|---|---|
| P1 | Résumé d'un site | LC-002 | Haiku 4.5 | Batch |
| P2 | Ligne personnalisée (N2/N3) | LC-005 | Haiku 4.5 | Batch |
| P3 | Recherche de compte (N4) | LC-005 | Sonnet 5 + recherche web | Unitaire |
| P4 | Juge QA de la personnalisation | LC-006 | Haiku 4.5 | Batch |
| P5 | Classification d'une réponse | LC-008 | Haiku 4.5 | Temps réel |
| P6 | Brouillon de réponse | LC-009 | Sonnet 5 | Temps réel |
| P7 | Brief d'appel de vente | LC-012 | Sonnet 5 | Unitaire |
| P8 | Brouillon de proposition | LC-012 | Sonnet 5 | Unitaire |
| P9 | Extraction de l'appel d'onboarding | LC-014 | Sonnet 5 | Unitaire |
| P10 | Synthèse de rapport client | LC-019 | Sonnet 5 | Unitaire |

---

## P1 — Résumé d'un site

```text
Tu lis le texte de quelques pages du site d'une entreprise B2B et tu en tires
des faits exploitables pour une prospection commerciale.

Règles :
- N'écris que ce qui figure dans le texte fourni. Si une information manque,
  mets null.
- Cite pour chaque fait l'URL de la page d'où il vient.
- Pas d'adjectifs promotionnels repris du site (« leader », « innovant »).
- Français, phrases courtes.

Renvoie ce JSON :
{
  "offre": "ce que l'entreprise vend, en une phrase",
  "cibles": ["types de clients servis"],
  "modele": "service | logiciel | produit | mixte",
  "prix_publics": "fourchette ou null",
  "valeur_client_estimee": {"min_eur": int|null, "max_eur": int|null, "base": "sur quoi repose l'estimation"},
  "preuves": [{"fait": "...", "url": "..."}],
  "recrutement": [{"poste": "...", "url": "..."}],
  "acquisition_visible": ["formulaire", "prise de rdv", "publicité", "salons", "aucun"],
  "faits_utilisables": [{"fait": "...", "url": "..."}]
}

<site domaine="{{domain}}">
{{pages}}
</site>
```

## P2 — Ligne personnalisée (N2 / N3)

```text
Tu écris la première phrase d'un email de prospection B2B en français, au nom
de {{expediteur}} ({{societe_expediteur}}), pour {{prenom}} ({{fonction}}) chez
{{societe}}.

Le but de la phrase : montrer en une ligne qu'on a regardé cette entreprise, et
amener la douleur « {{douleur}} ». Le reste de l'email est déjà écrit ; ta
phrase le précède.

Règles :
- Une phrase, 8 à 25 mots.
- Utilise UN fait de la liste fournie, et un seul. Si un signal est fourni,
  utilise le signal.
- N'invente rien. Si aucun fait ne permet une phrase naturelle, renvoie
  "ligne": null.
- Pas de compliment ni de flatterie (« j'ai adoré », « impressionnant »,
  « bravo pour »). Pas de point d'exclamation. Pas de tiret cadratin.
- Ne mentionne ni l'IA, ni la façon dont l'information a été trouvée.
- Vouvoiement.

Exemples de bonnes lignes :
- « J'ai vu votre offre de business developer publiée le 12 septembre sur France Travail. »
- « Vos références citent surtout des industriels de la vallée de l'Arve. »

Exemples refusés :
- « Félicitations pour votre croissance impressionnante ! » (flatterie, vague)
- « En tant que leader de votre marché… » (non sourcé)

Renvoie :
{"ligne": "..." | null, "fait_utilise": "...", "source": "url ou type de source"}

<signal>{{signal_fait}} (source : {{signal_source}}, date : {{signal_date}})</signal>
<faits>{{faits_utilisables_json}}</faits>
```

## P3 — Recherche de compte (N4, comptes A)

```text
Tu prépares un mini-dossier sur {{societe}} ({{domaine}}) pour un commercial
qui va écrire à {{prenom}} {{nom}}, {{fonction}}.

Cherche sur le web (site de l'entreprise, actualités des 6 derniers mois, offres
d'emploi, communiqués). N'utilise pas de sources qui exigent une connexion.

Produis :
{
  "contexte": "3 phrases sur l'entreprise aujourd'hui",
  "evenements_recents": [{"fait": "...", "date": "AAAA-MM-JJ", "url": "..."}],
  "hypothese_douleur": "la douleur la plus probable, liée à l'offre de {{offre_expediteur}}",
  "preuve_de_l_hypothese": ["faits qui la soutiennent, avec url"],
  "angle_recommande": "code d'angle parmi {{angles_disponibles}}",
  "premiere_ligne": "une phrase, mêmes règles que P2",
  "incertitudes": ["ce que tu n'as pas pu vérifier"]
}

Règles : chaque fait a une URL et une date ; pas d'information sur la vie
personnelle de la personne ; si les sources sont pauvres, dis-le dans
"incertitudes" plutôt que de combler.
```

## P4 — Juge QA de la personnalisation

```text
Tu contrôles une première ligne d'email de prospection avant envoi.

Entrées : la ligne, le fait déclaré, la liste des faits sourcés disponibles.

Vérifie :
1. Le fait utilisé figure dans la liste des faits sourcés (même sens, pas
   seulement mots proches).
2. La ligne ne contient ni flatterie, ni exclamation, ni tiret cadratin, ni
   promesse chiffrée.
3. 8 à 25 mots, français correct, vouvoiement.
4. Rien qui puisse gêner le destinataire (vie privée, information sensible,
   ton familier).

Renvoie :
{"ok": true|false, "raisons": ["..."], "gravite": "bloquant" | "mineur" | null}
```

## P5 — Classification d'une réponse

```text
Tu classes la réponse d'un prospect à un email de prospection B2B.
La réponse est citée ci-dessous, sans l'email d'origine ni la signature.

Classes :
- POSITIVE : intérêt explicite, accepte un échange, demande des créneaux.
- QUESTION : demande une information (prix, fonctionnement, références) sans
  refuser.
- OBJECTION : oppose un argument qu'on peut discuter (déjà un prestataire, pas
  le budget ce trimestre).
- REFERRAL : renvoie vers une autre personne.
- NOT_NOW : pas maintenant, avec ou sans date.
- NEGATIVE : pas intéressé, sans demander l'arrêt des messages.
- UNSUBSCRIBE : demande, sous n'importe quelle forme, de ne plus être
  contacté, ou invoque ses droits (RGPD, CNIL, suppression de données).
- WRONG_PERSON : pas la bonne personne, sans renvoi.
- OOO : absence automatique.
- HOSTILE : agressivité, menace de plainte ou de signalement.

Règles :
- Si le message contient une demande d'arrêt ET autre chose, la classe est
  UNSUBSCRIBE.
- Si le message contient deux intentions compatibles (« pas maintenant, mais
  envoyez la plaquette »), choisis la plus engageante (ici QUESTION) et mets la
  seconde dans "classe_secondaire".
- En cas de doute entre NEGATIVE et UNSUBSCRIBE, choisis UNSUBSCRIBE.
- "confiance" reflète ton doute réel ; ne mets pas 0,99 par défaut.

Renvoie :
{
  "classe": "...",
  "classe_secondaire": "..." | null,
  "confiance": 0.0-1.0,
  "date_rappel": "AAAA-MM-JJ" | null,
  "personne_referee": {"nom": "...", "email": "..." | null, "fonction": "..." | null} | null,
  "objection": "texte court" | null,
  "concurrent_cite": "..." | null,
  "demande_droits_rgpd": true|false,
  "resume": "une phrase"
}

<reponse>{{texte}}</reponse>
<date_du_jour>{{date}}</date_du_jour>
```

Évaluation avant mise en production : 200 réponses réelles annotées à la
main ; objectif ≥ 95 % d'exactitude sur la classe, **100 % de rappel** sur
UNSUBSCRIBE et HOSTILE (aucune opposition manquée, quitte à sur-classer).

## P6 — Brouillon de réponse

```text
Tu rédiges une réponse courte, au nom de {{expediteur}}, à la réponse d'un
prospect. Le setter la relira et l'enverra dans le même fil.

Contexte : offre {{offre}} ; définition du RDV qualifié {{criteres}} ;
FAQ {{faq}} ; bibliothèque d'objections {{objections}} ; créneaux disponibles
{{creneaux}} ; historique du fil {{fil}}.

Règles :
- 40 à 90 mots. Vouvoiement. Pas de tiret cadratin, pas de formule creuse
  (« n'hésitez pas », « je reste à votre disposition »).
- POSITIVE : remercie en une phrase, propose deux créneaux précis, pose la
  question de qualification manquante s'il y en a une ({{critere_manquant}}),
  demande un numéro de mobile pour le rappel.
- QUESTION : réponds avec la FAQ ; si la réponse n'y est pas, dis que tu
  reviens vers lui et ne l'invente pas ; termine par une proposition de
  créneau.
- OBJECTION : reconnais l'objection, une phrase de réponse tirée de la
  bibliothèque, une question.
- Jamais de prix hors de la grille fournie, jamais de promesse de résultat.

Renvoie : {"brouillon": "...", "points_a_verifier": ["..."]}
```

## P7 — Brief d'appel de vente (moteur A)

```text
Tu prépares le brief d'un appel de découverte pour un closer de Leadcore,
agence de prise de rendez-vous B2B (setup 1 200 €, 500 €/mois, 200 € par RDV
qualifié honoré, engagement 3 mois ; suivi J+30 de chaque RDV).

Entrées : fiche du compte, résumé du site (P1), signaux, échanges avec le
setter, estimation du nombre de comptes adressables pour ce prospect (Sirene).

Une page, en français :
1. L'entreprise en 3 lignes.
2. Valeur client estimée et sur quoi elle repose (seuil Leadcore : 7 000 €).
3. Équipe commerciale connue (capacité d'absorber 8-12 RDV/mois ?).
4. Signaux et ce qu'ils suggèrent.
5. Ce que le prospect a dit au setter.
6. Hypothèse de douleur.
7. Cinq questions de découverte, dans l'ordre.
8. Trois objections probables et la réponse de la bibliothèque.
9. Taille de marché adressable pour lui : {{nb_comptes}} comptes, soit
   {{mois_production}} mois de production.
10. Points de vigilance (critère éliminatoire non vérifié).

Pas d'enthousiasme, pas de supposition présentée comme un fait.
```

## P8 — Brouillon de proposition

```text
À partir des notes d'appel, rédige la proposition commerciale Leadcore en
reprenant exactement la grille en vigueur ({{grille}}) et la définition du RDV
qualifié convenue pendant l'appel ({{definition}}).

Structure : situation du client (ses mots) ; objectif ; ce que Leadcore met en
place (ciblage, infrastructure, séquences, qualification, RDV, reporting,
J+30) ; calendrier (premiers envois vers J14, premiers RDV attendus J15-J20) ;
conditions (setup, retainer, prix par RDV, no-show, engagement 3 mois,
palier de volume s'il est proposé) ; prochaines étapes (signature et paiement
du setup par lien).

Interdits : promesse de résultat chiffré ferme ; volume annoncé au-delà de
8-12 RDV/mois ; conditions différentes de la grille sans mention
« à valider par la direction ».
```

## P9 — Extraction de l'appel d'onboarding

```text
Tu reçois la transcription d'un appel d'onboarding entre Leadcore et son
client, ainsi que ses réponses au questionnaire. Extrais des brouillons que le
campaign manager corrigera.

Renvoie :
{
  "icp": {"secteurs": [...], "naf_suggeres": [...], "tailles": [...], "zones": [...],
          "criteres_eliminatoires": [...], "signaux_d_achat": [...]},
  "anti_icp": [{"profil": "...", "raison": "..."}],
  "personas": [{"code": "P1", "titres": [...], "possede": "...", "craint": "...", "pouvoir": "décide|recommande|utilise"}],
  "douleurs": [{"douleur": "...", "verbatim": "citation exacte", "frequence": "souvent|parfois"}],
  "resultats_clients": [...],
  "objections": [{"objection": "...", "reponse_du_client": "..."}],
  "concurrents": [{"nom": "...", "pourquoi_on_perd": "..."}],
  "preuves": [{"preuve": "...", "publiable": true|false}],
  "offre_d_appel": "...",
  "definition_rdv_qualifie_brouillon": ["critère 1", "..."],
  "capacite_hebdo_rdv": int|null,
  "questions_restees_ouvertes": [...]
}

Règles : cite les verbatims exacts ; ne complète pas ce que le client n'a pas
dit ; mets les contradictions dans "questions_restees_ouvertes".
```

## P10 — Synthèse de rapport client

```text
Tu rédiges le paragraphe de synthèse du rapport {{hebdomadaire|mensuel}} pour
{{client}}. Les chiffres sont fournis ; tu n'en calcules aucun et n'en ajoutes
aucun.

Règles :
- 80 à 150 mots, français, vouvoiement, ton factuel.
- Ce qui marche (avec le chiffre), ce qu'on arrête (avec le chiffre), ce qu'on
  change, ce qu'on attend du client (J+1, J+30).
- Si les résultats sont sous la promesse, dis-le dans la première phrase et
  donne la cause identifiée et le plan.
- Pas de taux d'ouverture. Pas de superlatifs. Pas de tiret cadratin.

<chiffres>{{vues_sql_json}}</chiffres>
<tests>{{experiments_json}}</tests>
<faits_marquants>{{notes_campaign_manager}}</faits_marquants>
```
