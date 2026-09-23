# 11 — Audit critique et V2

Partie de l'[Operating System outbound & delivery](README.md).

Les quinze questions de l'audit, posées au système tel qu'il est écrit dans
les fichiers 00 à 10. Les réponses nomment les faiblesses sans les adoucir.
La V2 (section K2) corrige celles qui peuvent l'être avant la mise en
production.

---

## K1 — Les quinze questions

### 1. Qu'ai-je oublié ?

| Oubli | Conséquence | Correction V2 |
|---|---|---|
| **Le plafond de facturation** : la sur-livraison en volume fait monter la facture du client sans qu'il l'ait demandé | Churn par surprise de facture ; conflit avec l'objectif 2-3× | Offre par paliers de volume (K2.1) |
| **La capacité commerciale du client** comme contrainte de dimensionnement dès la vente | On dimensionne pour 20 RDV un client qui en absorbe 6 | Question de capacité posée par le closer, pas seulement au questionnaire |
| **Le téléphone** comme canal de qualification et de réduction du no-show | Positives qui refroidissent ; no-show | Appel du setter sur positives non bookées à 48 h (B7.2), confirmation téléphonique des comptes A |
| **Le parrainage client** comme canal d'acquisition | CAC plus haut que nécessaire au-delà de 25 clients | Programme de recommandation dès le 3e mois d'un client satisfait (B11) |
| **La formation** des setters et opérateurs | Qualité hétérogène à 20 opérateurs | Bibliothèque de réponses réelles annotées (tirée de `reply`), revue de 10 classements par semaine et par opérateur |
| **Les langues** | Belgique, Suisse : régimes juridiques différents | Limité à la France (H10) |
| **La saisonnalité** (août, fin décembre) | Mois creux, promesse manquée, facture basse | Volume de juillet et novembre relevé de 20 %, août réduit ; promesse exprimée en moyenne trimestrielle |

### 2. Quelle hypothèse est fragile ?

Dans l'ordre de dangerosité :

1. **1,5 % de positif par contact.** Tout le modèle en dépend (F4 : ±50 % de
   RDV pour ±0,5 point). Aucune donnée Leadcore ne le confirme encore.
2. **75 % de présence.** Atteignable avec la cadence de rappels, pas sans
   (00-RECHERCHE §3.6).
3. **La durée de vie client de 6 mois.** Elle fixe la LTV et l'amortissement
   du setup.
4. **4 minutes par réponse.** Aucune mesure ; si c'est 8, le coût
   opérateur double et un opérateur suit 3 clients au lieu de 4.
5. **La tolérance des plateformes au cold email.** Ce n'est pas une
   hypothèse chiffrée, c'est une dépendance (H9).

Chacune a un test en J2-J3 de la roadmap. Le simulateur existe pour les
remplacer.

### 3. Quel outil ai-je choisi par habitude plutôt que par preuve ?

| Outil | Preuve disponible | Verdict |
|---|---|---|
| Smartlead (moteur B) | Modèle de prix vérifié à la source ; délivrabilité **non mesurée** par Leadcore | Choix sur le **prix**, pas sur la délivrabilité. Le premier test de placement comparatif (Smartlead vs Instantly, mêmes boîtes, même contenu) doit confirmer. |
| Apollo | Couverture FR **non mesurée** | Test de couverture en semaine 1 (J1) avant tout achat annuel |
| Clay | Aucun besoin démontré avant 10 clients | Retiré du palier ULTRA LEAN ; à réévaluer au palier STANDARD sur usage réel |
| Attio | Choix raisonnable, pas comparé en usage | Faible enjeu : c'est une interface, la vérité est dans Postgres |
| n8n | Choix cohérent (coût, contrôle), mais **exige une compétence** d'exploitation | Si personne ne sait l'exploiter, n8n Cloud Pro jusqu'à 10 clients |
| Google Workspace direct | Raisonnement (isolement), pas de mesure comparée avec un revendeur | Tester un revendeur sur un parc de test au palier STANDARD |

### 4. Où sont les coûts cachés ?

Listés en [03-STACK C4](03-STACK.md). Les trois plus gros :

1. **Le temps humain non modélisé** : administration des tenants, réunions
   client, corrections manuelles de données. Le simulateur le range dans 13
   heures fixes ; c'est peut-être 20.
2. **Les domaines conservés** après la fin d'un client (renouvellement) et
   les boîtes brûlées à remplacer.
3. **Le temps du fondateur** : closing + direction, jamais compté dans le CAC
   tant qu'il ne se paie pas.

### 5. Où est le principal bottleneck ?

**Le traitement humain des réponses et la qualification**, à chaque palier
jusqu'à 25 clients. Au-delà de 50 clients, **le marché de Leadcore** (niche
qui s'épuise pour le moteur A). À aucun moment l'envoi ou l'infrastructure
ne sont le goulot : ils s'achètent.

### 6. Que peut-on automatiser davantage ?

| Tâche | Aujourd'hui | Automatisable | Garde-fou |
|---|---|---|---|
| Réponses `NOT_NOW`, `NEGATIVE`, `OOO`, `WRONG_PERSON`, `BOUNCE` | Classement IA, action auto | Déjà auto | Échantillon hebdo |
| Réponses `REFERRAL` | Brouillon + validation | Envoi auto si confiance ≥ 0,95 et personne référée trouvée | Échantillon |
| Réponses `QUESTION` fréquentes (prix, fonctionnement) | Brouillon + validation | Envoi auto sur 5 questions-types validées | Jamais sur prix hors grille |
| Réponses `POSITIVE` | Validation humaine | **Non** : c'est là que se gagne le RDV | — |
| Rapports hebdo | Brouillon + validation | Envoi auto des chiffres, paragraphe validé | Déjà prévu |
| Création des boîtes et DNS | Semi-auto | Auto (Admin SDK, Graph, Cloudflare) | Test d'auth |
| Analyse mensuelle | IA + humain | IA seule pour le brouillon, humain pour les décisions | — |
| Construction de segments | Semi-auto | Auto à partir de la carte ICP | Validation de la carte du marché |

### 7. Qu'est-ce qui risque de casser à 25 clients ?

- Le SLA d'une heure sur les positives (3 000 réponses/mois, ~450 positives).
- La cohérence entre opérateurs (chacun ses habitudes de qualification).
- La gestion manuelle de ~425 boîtes.
- Le plafond de fréquence inter-clients si plusieurs clients ciblent des
  zones proches.
- Le fondateur, qui ne peut plus relire les RDV ni closer.

### 8. Qu'est-ce qui risque de casser à 100 clients ?

- **Le risque de plateforme concentré** : un durcissement de Gmail ou
  Microsoft touche tous les clients le même jour. La diversification (deux
  fournisseurs de boîtes, deux séquenceurs, canal 2) devient vitale.
- La réputation de Leadcore comme expéditeur reconnaissable par les
  passerelles de sécurité (mêmes schémas d'infrastructure sur 600 domaines).
- Le recrutement : 17 à 24 opérateurs, 3-4 closers.
- Le volume de données (`event`, `message`) et le coût des requêtes de
  reporting.
- L'épuisement des niches pour le moteur A.

### 9. Comment pourrait-on sur-livrer davantage ?

- Vendre des **paliers de volume** (K2.1) : la sur-livraison devient un
  choix du client, pas une surprise.
- Livrer au client ce que le moteur sait déjà : intelligence marché,
  objections, concurrents, lookalike des signés (B7.2, priorités 15 à 20).
- **Préparer chaque RDV pour le commercial du client** (fiche A14.2 adaptée)
  : le taux de signature J+30 monte sans un RDV de plus.
- Coaching commercial trimestriel à partir des motifs de perte J+30.

### 10. Comment réduire le coût par client ?

Ordre d'impact (F4) : minutes par réponse (IA autonome sur les classes
simples) > heures fixes (reporting automatique) > coût horaire (opérateurs en
région, alternants encadrés) > données (filtrer avant d'enrichir) > outils.
Les outils ne sont que 5 % du coût direct : les renégocier est la dernière
chose à faire.

### 11. Comment augmenter le nombre de RDV par client ?

Ordre d'impact : taux de positif (segment, signal, offre d'appel) >
présence (rappels + SMS) > booking (réponse < 1 h, deux créneaux proposés,
appel à 48 h) > volume. Le volume vient en dernier : il coûte des boîtes, des
données et des heures, et il abîme la délivrabilité s'il est mal ciblé.

### 12. Comment augmenter le taux de closing de Leadcore ?

- **La carte du marché du prospect dès l'appel de vente** : montrer combien
  de comptes on peut contacter pour lui (A14.2).
- Cas clients chiffrés **de la même niche** (d'où la niche unique).
- Le J+30 comme argument : aucun concurrent ne s'engage sur le devenir des
  RDV.
- Proposition sous 24 h, signature et paiement en un lien.
- Qualifier plus dur avant le RDV (valeur client, équipe commerciale) :
  moins de RDV, meilleur taux.

### 13. Comment réduire le temps d'onboarding ?

Le warm-up (14 jours) fixe le plancher du délai calendaire ; le temps
**humain** peut passer de 20-30 h à ~12 h :

- questionnaire complet avant l'appel, avec export clients ;
- extraction automatique de l'appel (carte ICP, personas, objections) ;
- playbook de niche : angles et séquences de départ déjà écrits ;
- provisioning entièrement automatisé (LC-029).

### 14. Comment réduire le temps de gestion mensuel par client ?

Rapports générés (LC-019), tests évalués automatiquement (LC-020), santé
calculée (LC-022), segments préparés (LC-015). Il reste au campaign manager :
la revue du vendredi, le point mensuel avec le client, les décisions. Cible :
7 heures fixes par client et par mois (scénario SCALE).

### 15. Quelles parties nécessitent absolument un humain ?

| Tâche | Pourquoi |
|---|---|
| Réponse à une réponse positive | C'est là que se gagne ou se perd le RDV ; le ton compte |
| Qualification des cas limites | Jugement sur la définition contractuelle |
| Closing (moteur A) | Relation, négociation |
| Validation de l'ICP et des séquences avec le client | Responsabilité et accord du client |
| Relecture d'un échantillon de chaque lot | Dernier filet avant l'envoi |
| Décisions de test (arrêter, dupliquer) | Arbitrage entre statistique et contexte |
| Incidents S1 | Responsabilité légale et commerciale |
| Réponse à une demande de personne (accès, effacement, plainte) | Responsabilité légale |
| Relation client (points mensuels, mauvaises nouvelles) | Confiance |

---

## K2 — V2 de l'architecture

L'audit révèle cinq faiblesses qui valent une correction avant la mise en
production.

### K2.1 Offre par paliers de volume

**Faiblesse** : l'objectif de sur-livraison 2-3× et la facturation au RDV
honoré se contredisent (B7.1, F5).

**V2** : à la signature, le client choisit un palier mensuel de RDV
facturables. Le parc est dimensionné sur ce palier ; au-delà, les RDV sont
livrés **avec son accord écrit** et facturés au même prix, ou convertis en
qualité (comptes A seulement).

| Palier | RDV facturables / mois | Boîtes | Domaines | Pour qui |
|---|---:|---:|---:|---|
| Essentiel | jusqu'à 12 | 17 | 6 | Équipe commerciale de 1-2 personnes |
| Croissance | jusqu'à 20 | 27 | 9 | 2-4 commerciaux |
| Accélération | jusqu'à 30 | 39 | 13 | Équipe structurée |

Le prix unitaire et le retainer restent ceux de la grille (preuve ou
établie). **Décision de pricing à prendre par la direction** : ce document
propose la structure, il ne change pas la grille arrêtée dans MAJ-OFFRE.

### K2.2 Réponses : trois voies au lieu d'une

**Faiblesse** : l'humain valide toutes les réponses non triviales ; c'est
70 % du coût direct.

**V2** :

```
Réponse ─► LC-008 ─┬─► voie AUTO    (NOT_NOW, NEGATIVE, OOO, WRONG_PERSON, BOUNCE,
                   │                 REFERRAL ≥ 0,95, 5 QUESTION-types)       ~60 %
                   ├─► voie RAPIDE  (brouillon IA validé en un clic)          ~25 %
                   └─► voie HUMAINE (POSITIVE, OBJECTION complexe, HOSTILE,
                                     confiance < 0,8)                          ~15 %
UNSUBSCRIBE ─► suppression immédiate, hors voies
```

Effet estimé : ~1,5 minute par réponse en moyenne (scénario SCALE du
simulateur), 6 clients par opérateur au lieu de 4.

### K2.3 Diversification de plateforme

**Faiblesse** : un durcissement Gmail ou un bannissement de séquenceur touche
tout le parc (question 8).

**V2** : trois étages de diversification, activés par palier.

| Étage | Palier | Mesure |
|---|---|---|
| Fournisseurs de boîtes | STANDARD | 70 % Google / 30 % Microsoft, tenants multiples |
| Séquenceurs | STANDARD | Moteur A sur Instantly, B sur Smartlead ; procédure de bascule testée une fois par semestre |
| Canaux | SCALE | LinkedIn (profils réels) et téléphone sur les comptes A ; recommandations clients ; partenariats |

### K2.4 La niche comme multiplicateur

**Faiblesse** : sans niche, les tests ne sont pas statistiquement lisibles
chez un seul client (B9.1), les apprentissages ne se transfèrent pas, le
moteur A n'a pas de cas clients comparables.

**V2** : la niche devient une **contrainte d'architecture**, pas seulement
un choix commercial. `learning`, `strategy_rule`, les playbooks et les tests
mutualisés sont indexés par niche. Un client hors niche paie un setup plus
élevé (pas de playbook), ou n'est pas pris. Décision à prendre à J60
(roadmap J3).

### K2.5 Le J+30 comme donnée d'entraînement

**Faiblesse** : le score et les tests optimisent le RDV, pas le CA signé.

**V2** : dès 100 RDV avec statut J+30 sur une niche, le score client et les
décisions de test (B9) utilisent **le RDV signé** comme critère principal et
le RDV honoré comme critère secondaire. Un segment qui produit des RDV
qui ne signent pas perd sa priorité, même s'il répond bien. C'est la
définition opérationnelle de la « qualité avant la quantité » du document de
référence.

### K2.6 Architecture V2

```
                                  LEADCORE OS — V2

                     ┌──────────── NICHE (playbook, apprentissages, tests mutualisés) ─────────────┐
                     │                                                                              │
 MOTEUR A            ▼                                                    MOTEUR B                  ▼
 Sirene/Apollo ─► pipeline ─► score ─► angle ─► Instantly      Sirene/Apollo ─► pipeline ─► score client (J+30) ─►
   + signaux                                        │            + signaux                                    │
                                                    ▼                                                         ▼
                                              réponses ──┐                                      Smartlead (palier de volume)
                                                         │                                                    │
                                   ┌─────────────────────┴──── LC-008 : AUTO · RAPIDE · HUMAIN ◄──────────────┘
                                   │                                  │
                                   ▼                                  ▼
                        closers (capacité A13)              setters ─► RDV client (plafond K2.1)
                                   │                                  │
                        signature + paiement                 J+1 · J+30 ─► score, tests, intelligence
                                   │                                  │
                                   └──────────► onboarding B1 ◄───────┘  (cas clients → moteur A)

  Diversification : Google 70 % / Microsoft 30 % · deux séquenceurs · LinkedIn + téléphone (comptes A)
  Vérité : Postgres · Orchestration : n8n · Conformité : suppression globale, LIA, DPA
```

### K2.7 Ce que la V2 ne résout pas

- **La tolérance des plateformes au cold email** reste une dépendance
  externe. La V2 la dilue ; elle ne la supprime pas.
- **Les hypothèses d'entonnoir** restent des hypothèses jusqu'aux mesures de
  J30.
- **Le rôle juridique de Leadcore dans le moteur B** (J1) peut modifier la
  réutilisation des données et donc le coût data par client.
