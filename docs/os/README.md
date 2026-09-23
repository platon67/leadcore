# Leadcore — Outbound & Delivery OS

Manuel opérationnel interne. Version 1, 23 septembre 2026.

Il transforme le [document de référence](../LEADCORE-FONCTIONNEMENT.md) et la
[mise à jour de l'offre](../MAJ-OFFRE-2026-09.md) en une machine
implémentable : sources de données, infrastructure, workflows, schéma de
base, économie, pannes, conformité, SOP et roadmap. Il ne modifie ni la
grille tarifaire, ni la promesse de 8 à 12 RDV, ni la définition
contractuelle du RDV qualifié ; quand il recommande de les faire évoluer, il
le dit et renvoie la décision à la direction.

**Philosophie Blitzkrieg, telle que ce manuel l'applique** : vitesse,
concentration et duplication de ce qui marche, **sous trois limites fixes**,
à savoir la délivrabilité, la conformité et la définition du RDV qualifié. La
recherche montre que la vitesse n'a pas partout le même prix : l'envoi
s'accélère en achetant des boîtes, le warm-up ne s'accélère pas (14 jours),
et un test ne conclut pas plus vite que la taille de son échantillon (B9).

---

## Fichiers

| # | Fichier | Contenu | Parties du cahier des charges |
|---|---|---|---|
| 00 | [RECHERCHE](00-RECHERCHE.md) | Plan de recherche (24 catégories), hiérarchie des sources, constats sourcés, incertitudes | Phases 0 à 2 |
| 01 | [MOTEUR-A](01-MOTEUR-A.md) | Acquisition des clients de Leadcore : ICP, sourcing, pipeline, signaux, matrice, 16 angles, infrastructure, warm-up, campagnes, IA, réponses, handoff, capacité, Sales OS, 0 → 100 | A1 à A15 |
| 02 | [MOTEUR-B](02-MOTEUR-B.md) | Delivery client : onboarding, ICP discovery, requêtes, données, campagnes, infrastructure, sur-livraison, boucle d'apprentissage, tests, reporting, client success, scale | B1 à B12 |
| 03 | [STACK](03-STACK.md) | Stack finale par fonction, trois configurations, seuils de changement, coûts cachés | C |
| 04 | [N8N](04-N8N.md) | 30 workflows nommés LC-001 à LC-030, conventions, dépendances, volumes | D |
| 05 | [DONNEES](05-DONNEES.md) + [`schema.sql`](schema.sql) | Objets, champs, relations, identifiants, sources, fréquences ; schéma Postgres exécutable ; définitions des métriques | E |
| 06 | [ECONOMIE](06-ECONOMIE.md) | Coûts par client, lead, email, RDV, client acquis ; 4 scénarios ; sensibilité | F |
| 07 | [PANNES](07-PANNES.md) | Comment la machine casse : 43 pannes, détection → alerte → action → rétablissement | G |
| 08 | [CONFORMITE](08-CONFORMITE.md) | RGPD, L34-5, opposition, conservation, sous-traitants, transferts, 11 points à faire valider par un avocat | H |
| 09 | [SOP](09-SOP.md) | Que faire maintenant : Leadcore, puis nouveau client | I |
| 10 | [ROADMAP](10-ROADMAP.md) | J1-7, J8-30, J31-60, J61-90, puis 10, 25, 50, 100 clients | J |
| 11 | [AUDIT-V2](11-AUDIT-V2.md) | Les 15 questions d'audit, et la V2 qui corrige ce qu'elles révèlent | Règle de qualité finale |
| 12 | [PROMPTS](12-PROMPTS.md) | Les 10 prompts des workflows | Format final |

Le simulateur [`tools/simulateur_os.py`](../../tools/simulateur_os.py)
produit tous les chiffres des fichiers 01, 02, 06 et 10. Python 3, sans
dépendance :

```
python3 tools/simulateur_os.py                         # tous les tableaux
python3 tools/simulateur_os.py --objectif 20           # volumes pour 20 RDV honorés
python3 tools/simulateur_os.py --set positive_rate=0.01 --section client
```

Version à lire d'un bloc : [`Leadcore-OS.pdf`](Leadcore-OS.pdf), générée à
partir de ces fichiers par `python3 tools/manuel_pdf.py` (dépendances :
`pip install markdown pymupdf`, Playwright en npm global). Le Markdown reste
la source ; après une modification, régénérer le PDF.

## Ordre de lecture

- **Direction** : README → 11-AUDIT-V2 → 06-ECONOMIE → 08-CONFORMITE §H12 → 10-ROADMAP.
- **Opérateur** : 09-SOP → 04-N8N → 01 §A7-A8 → 07-PANNES.
- **Campaign manager** : 02-MOTEUR-B → 01 §A5-A6 → 12-PROMPTS.
- **Closer / setter** : 01 §A11-A14 → 09-SOP §I1.2.

---

## Les décisions qui comptent

| Sujet | Recommandation | Pourquoi | Quand changer | Où |
|---|---|---|---|---|
| Infrastructure | Boîtes Google (70 %) + Microsoft (30 %) en direct, 3 par domaine, 30 envois/jour, 25 % de réserve | Isolement de réputation ; production qui survit à des suspensions | Au-delà de 500 boîtes, automatiser ou tester un revendeur | A7, B6 |
| Warm-up | 14 jours minimum, puis ramp-up conditionné à des mesures | Les réseaux de warm-up construisent un historique, pas une réputation | Jamais plus court | A8 |
| Séquenceurs | Smartlead pour le moteur B, Instantly pour le moteur A | Coût au volume d'emails, pas au client ; réputation séparée | Si le placement mesuré se dégrade 2 mois | C3 |
| Données | Sirene (comptes, gratuit) + Apollo (contacts) + waterfall FullEnrich/Dropcontact + MillionVerifier | Couverture FR ; on ne paie que les emails trouvés | Si la couverture Apollo de la niche < 40 % | A2, B3 |
| Signaux | API France Travail (recrutements), BODACC/Pappers, Sales Navigator | Gratuits ou peu chers, datés, rapprochés du SIREN | TheirStack quand les sites carrières manquent | A4 |
| IA | Haiku 4.5 en batch pour classer et personnaliser ; Sonnet 5 pour les brouillons et la recherche | Coût négligeable (< 2 % du coût direct) | Si un juge qualité échoue > 2 % | A10, 12 |
| Vérité des données | Postgres (Supabase, UE) ; n8n auto-hébergé | Outils remplaçables sans perte d'historique | Au-delà de ~500 000 exécutions/mois | 04, 05 |
| Goulot | Le traitement humain des réponses (70 % du coût direct) | Mesuré par le simulateur | — | B12, K2.2 |
| Sur-livraison | En valeur (qualité, intelligence, préparation des RDV) dans un palier de volume choisi par le client | La facturation au RDV rend la sur-livraison en volume risquée | Décision de pricing | B7, K2.1 |
| Tests | Grosses variables d'abord (segment, signal, offre) ; tests mutualisés par niche | Un client seul ne détecte qu'un effet ×2 en un mois | — | B9 |
| Niche | Unique, choisie à J60 sur mesures | Tests lisibles, apprentissages transférables, cas clients comparables | — | A1.3, K2.4 |
| Zone | France seulement tant que H10 n'est pas validé | Régimes belge, suisse, luxembourgeois différents | Après avis juridique | H10 |

## Les chiffres de référence (scénario BASE)

| Par client et par mois | Valeur |
|---|---:|
| Contacts uniques / emails | 1 900 / 7 600 |
| Boîtes actives / provisionnées / domaines | 13 / 17 / 6 |
| Réponses à traiter | ~120 |
| RDV honorés | ~12 |
| Heures opérateur | ~31 |
| Coûts directs | ~1 250 € |
| Recette (phase de preuve, setup lissé) | ~3 050 € |
| Marge brute | ~1 800 € (59 %) |
| Coût par RDV honoré | ~106 € |
| CAC (moteur A) | ~1 150 €, couvert par le setup |

## Ce qui reste à décider

| Décision | Qui | Échéance | Référence |
|---|---|---|---|
| Niche unique | Direction | J60 | A1.3, K2.4 |
| Paliers de volume / plafond de facturation | Direction | Avant le 3e client | K2.1, F5 |
| Réponses de l'avocat (J1-J11) | Direction + avocat | Avant le 1er envoi / 1er client | H12 |
| Commission des closers (assiette, durée) | Direction | Avant le 1er closer | A15.3, MAJ-OFFRE §5 |
| Canal 2 (LinkedIn, téléphone) | Direction | Palier STANDARD | K2.3, MAJ-OFFRE §5 |
| Propriété des domaines à la sortie | Direction | Contrat type | B6.2, H8 |
