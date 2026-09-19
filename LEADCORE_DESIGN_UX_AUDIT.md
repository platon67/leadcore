# Leadcore — Audit design, UX et détection d'AI slop

**Date :** 19 septembre 2026 · **Périmètre :** `site/` (6 pages) · **Commit audité :** `a688467`

**Méthode.** Rendu réel dans Chromium, pas lecture de code. Neuf largeurs de 320 à
1 920 px, mouvement par défaut *et* `prefers-reduced-motion`, parcours au clavier,
défilement complet de chaque page, échantillonnage de pixels, inventaire des jetons
calculés sur le DOM rendu. Tous les chiffres de ce document sont mesurés, pas estimés.

**Conflit d'intérêt déclaré.** J'ai construit ce site. Cet audit cherche donc
activement ce qui ne va pas, y compris dans des choix que j'ai défendus plus tôt
dans le projet. Trois de mes propres décisions sont annulées ci-dessous.

---

# EXECUTIVE SUMMARY

## Le verdict en une phrase

**Le contenu est excellent et rare ; l'enveloppe visuelle est un template d'IA
générique, et le tunnel de conversion est cassé.**

## Niveau esthétique : 5/10

Le site est propre, cohérent en couleur, correctement composé. Il n'est pas
distinctif. Le registre — quasi-noir, un seul accent émeraude, halos lumineux,
grain, libellés en mono, gros chiffres tabulaires, cartes arrondies bordées — est
**exactement l'esthétique par défaut que produit un prompt « premium B2B SaaS dark
landing page »** en 2026. Rien dans la direction artistique ne dit « agence de
prospection française qui refuse des missions ». Tout dit « outil de développeurs ».

## Qualité UX : 4/10

Deux défauts de débordement horizontal en production, dont un qui fait apparaître
une **barre de défilement latérale de 1 156 px** sur toute la page Collaboration en
desktop. Le tunnel de conversion a un trou de 7 000 px. La seule mécanique de
conversion du site est un `mailto:` vers une adresse qui n'existe pas encore, et la
page l'annonce elle-même au prospect.

## Différenciation : 3/10

Si on remplace le logo, **environ 70 % du système visuel fonctionne tel quel pour
n'importe quelle agence B2B**. Ce qui ne se transpose pas — les volumes réels, la
grille tarifaire en premier écran, le ratio 2 sur 30, les refus de mission — est du
*contenu*, pas du design. La DA ne porte aucune part de la différenciation.

## Crédibilité : 6/10 — et c'est la note la plus fragile

Le contenu est remarquablement honnête et chiffré : un chiffre tous les 21 à 36 mots,
quasi aucun jargon marketing, les objections traitées de face. **Mais il n'y a aucune
preuve sociale d'aucune sorte** — zéro client, zéro logo, zéro témoignage, zéro cas.
L'expression « cas client » n'apparaît qu'une fois sur tout le site, au sens négatif.
Un site très spécifique et totalement invérifiable produit un effet particulier :
plus il est précis, plus l'absence de preuve devient visible.

## Niveau d'AI slop : ÉLEVÉ sur le visuel, FAIBLE sur le texte

C'est l'asymétrie centrale de ce site. Le copywriting est ce qu'une IA ne produit
presque jamais : spécifique, numérique, sans superlatif, avec des refus. Le design
est ce qu'une IA produit par défaut. **Le texte a été travaillé, l'enveloppe a été
générée.**

## Les six problèmes qui dominent tous les autres

1. Débordement horizontal sur Collaboration, toutes largeurs ≥ 900 px.
2. La conversion mène à un `mailto:` vers une adresse inexistante, annoncée comme telle.
3. 2 790 ms d'écran noir avant le premier mot, à la première visite.
4. Aucune preuve sociale, sur un site qui vend de la confiance à plusieurs k€/mois.
5. 22 titres sur 22 utilisent la même formule typographique.
6. Le système de fond que j'ai construit (trois couches, quatre géométries) est
   **imperceptible** : les pages échantillonnent à l'identique.

---

# TOP 10 DES PROBLÈMES

### 1. CRITICAL — Débordement horizontal de 1 156 px sur Collaboration

**Localisation :** `.railh-head`, section 35 de `styles.css`, page Collaboration.
**Mesure :** `document.scrollWidth` = 2 596 px pour un `clientWidth` de 1 440.
Défaut présent à 900, 1 024, 1 280, 1 440 et 1 920 px. Absent ≤ 768 px.
**Cause :** la tête lumineuse de la frise est `position:absolute; left:0; right:0`
(donc large de 1 256 px) puis déplacée de `translateX(calc(100% - 9px))`. `.railh`
n'a aucun rognage, la zone défilable s'étend donc de 1 247 px.
**Impact :** barre de défilement horizontale sur la deuxième page que visite un
prospect. Pour un profil technique, c'est le signal « site bâclé » le plus rapide
qui existe. Sur trackpad, la page part de travers au moindre geste latéral.
**Solution :** `overflow-x: clip` sur `.railh` — et **pas** `overflow:hidden`, qui
rognerait aussi les anneaux `.ring` qui débordent volontairement vers le haut.

### 2. CRITICAL — Le harnais de vérification était aveugle au mouvement par défaut

**Localisation :** `deborde.js`, `contraste.js` (scratchpad).
**Mesure :** les deux scripts créent leur contexte avec `reducedMotion: 'reduce'`.
L'élément fautif ci-dessus porte `display:none` sous cette media query.
**Impact :** six pages × huit largeurs passaient au vert pendant que le défaut était
en production. Ce n'est pas un problème de site, c'est un problème de méthode, et il
invalide rétroactivement toutes mes affirmations « aucun débordement » des jours
précédents.
**Solution :** tout contrôle de mise en page tourne en mouvement par défaut **et**
en mouvement réduit, et parcourt la page au lieu de la mesurer à l'arrêt.

### 3. CRITICAL — La conversion mène à une adresse qui n'existe pas

**Localisation :** `assets/config.js` (`provider: null`), section `#rendez-vous`.
**Mesure :** l'unique mécanisme de conversion du site est
`mailto:contact@leadcore.fr`. Le bloc calendrier affiche en clair :
« Le calendrier en ligne n'est pas encore branché. »
**Impact :** dans la section qui demande l'engagement, le site annonce lui-même que
son outil de réservation n'est pas prêt. Un `mailto:` échoue silencieusement chez
tout visiteur desktop sans client mail configuré — une part importante du public
visé. Le tunnel n'a pas de fuite : il n'a pas de sortie.
**Solution :** brancher un calendrier, ou remplacer le `mailto:` par un formulaire
en deux champs traité côté serveur. Retirer la phrase qui annonce l'absence d'outil.

### 4. CRITICAL — 2 790 ms avant le premier mot lisible

**Localisation :** séquence d'ouverture, section 23 de `styles.css`.
**Mesure :** à CPU ÷4, première visite, l'opacité du titre reste à 0 pendant 2,6 s ;
le voile est retiré à 2 790 ms.
**Impact :** le visiteur type arrive d'un email froid, sur mobile, sans intention
forte. Les 2,8 premières secondes sont le seul moment où son attention est acquise,
et elles sont dépensées à regarder un logo s'assembler. C'est le plus beau morceau
de motion design du site, et c'est le plus coûteux commercialement.
**Solution :** ramener à ≤ 900 ms, ou ne la jouer que sur `/` en accès direct (pas
depuis un lien d'email avec paramètre de campagne), ou la supprimer. La conserver en
MP4 pour les usages sociaux, où elle a du sens.

### 5. CRITICAL — Aucune preuve sociale, nulle part

**Localisation :** tout le site.
**Mesure :** 0 logo client, 0 témoignage, 0 cas chiffré, 0 nom de client.
« cas client » apparaît une fois, dans « on perd le cas client ».
**Impact :** le site demande une décision à 8 700 € sur un trimestre en s'appuyant
uniquement sur sa propre parole. Le paradoxe est cruel : plus le contenu est précis
et vérifiable dans sa forme, plus l'absence totale de vérification externe saute aux
yeux d'un lecteur méfiant.
**Solution :** ce n'est pas un problème de design, c'est un problème d'actif. En
attendant deux cas clients, la seule preuve mobilisable est **le fondateur** : photo,
parcours, ce qu'il a fait avant, pourquoi il fait ça. Aujourd'hui il est réduit à
deux initiales dans un rond.

### 6. HIGH — 22 titres sur 22 avec la même formule

**Localisation :** tous les `h1`/`h2` des quatre pages.
**Mesure :** 100 % des titres suivent « énoncé sans-serif. *proposition en italique
serif.* » — « Quatre choses que vous n'avez pas *en recrutant un commercial.* »,
« On enlève. *On n'ajoute jamais.* », « Tout est là. *Il n'y a rien en bas de page.* »…
**Impact :** ce qui était pensé comme un accent devient un tic. Le `README` du site
énonce la règle « c'est la seule seconde voix, elle perd son effet dès qu'on s'en
sert ailleurs » — et elle est appliquée partout. Une régularité à 100 % est
exactement ce qui fait qu'un texte « sonne généré » : un humain casse sa propre
formule par lassitude.
**Solution :** descendre à 6-8 occurrences sur 22, réservées aux titres qui portent
un retournement réel. Les autres titres deviennent des affirmations sèches d'une
seule voix.

### 7. HIGH — Le système de fond est invisible

**Localisation :** section 24 de `styles.css`, `.sig` et ses quatre géométries.
**Mesure :** échantillonnage de la marge gauche à trois hauteurs sur trois pages :
accueil (14,23,21) / (6,11,10) / (12,20,19) ; méthode (14,40,32) / (5,10,9) /
(12,20,19) ; tarifs (14,23,21) / (5,10,9) / (12,20,19). Identiques à deux points sur
trois.
**Impact :** j'ai écrit dans le `README` que « la signature change de forme d'une page
à l'autre : dôme, biseau, strates, voûte ». C'est vrai dans le code et **faux à
l'écran**. Trois couches fixes, quatre jeux de coordonnées, une documentation — pour
un résultat que personne ne peut percevoir. C'est du code mort qui a l'air vivant.
**Solution :** soit assumer et amplifier (une page = une dominante réellement
lisible), soit supprimer les couches et récupérer la simplicité. La demi-mesure
actuelle est le pire des trois.

### 8. HIGH — Trou de conversion de 7 000 px sur les pages intérieures

**Localisation :** Méthode, Collaboration, Tarifs.
**Mesure :** deux CTA par page. Un à 0 % (en-tête), un à 86 %. Entre les deux :
7 000 px de contenu sans aucune porte de sortie.
**Impact :** le prospect convaincu par la fiche de rendez-vous (méthode, ~55 %) ou
par le ratio 2 sur 30 (tarifs, ~15 %) doit continuer à défiler sur cinq écrans avant
de pouvoir agir. La conviction a une demi-vie courte.
**Solution :** un CTA contextuel après chaque bloc de preuve majeur, formulé selon ce
qui vient d'être démontré — pas un bouton générique répété.

### 9. HIGH — 80 % de colonne vide sur la section signature de Méthode

**Localisation :** `.stick-2` sur `methode.html`.
**Mesure :** colonne tenue 497×440 px, colonne défilante 687×2 200 px.
**1 760 px de vide**, soit 80 % de la hauteur de la section.
**Impact :** c'est la première section de contenu de la page. Un dirigeant qui défile
voit un titre court à gauche puis un mur de vide pendant cinq écrans. Ce n'est pas du
blanc éditorial, c'est un trou.
**Solution :** la colonne tenue doit porter quelque chose qui vit — le compteur de
filtre en cours, un rappel du chiffre qui se réduit à chaque étape — ou la
composition passe en pleine largeur.

### 10. HIGH — 11 boucles d'animation simultanées sur Méthode

**Localisation :** `.flow` (comète ×3, battement ×7, souffle ×1).
**Mesure :** 33 keyframes déclarés, 48 déclarations d'animation, 71 transitions sur
un site vitrine de quatre pages. Au repos sur méthode : 11 animations en boucle.
**Impact :** le coût en images par seconde est négligeable (mesuré : 0,2 i/s
d'écart). Le coût est attentionnel. Sept points qui pulsent pendant qu'on lit un
paragraphe, c'est du bruit, et c'est le marqueur d'AI slop le plus reconnaissable :
« quelque chose bouge partout, tout le temps ».
**Solution :** garder la comète (elle explique le trajet), supprimer le battement des
sept points et le souffle de la case de sortie.

---

# AI SLOP REPORT

## La thèse

Ce site a **un contenu écrit par quelqu'un qui connaît le métier** et **une
enveloppe produite par défaut**. Les deux ne sont pas au même niveau, et c'est
l'enveloppe qui se voit en premier.

## A. AI slop visuel — présent et marqué

| Motif | Présent ? | Jugement |
|---|---|---|
| Quasi-noir + un seul accent saturé | oui, partout | **C'est LE registre par défaut** des pages générées « premium B2B ». Pas condamnable en soi, mais il n'a été ni justifié ni infléchi. |
| Halos lumineux fixes en fond | oui, 3 couches | **Supprimer ou amplifier.** Imperceptibles, donc décoratifs sans l'être. |
| Grain synthétique à 2,4 % | oui | **Conserver.** Discret, il casse l'aplat numérique. Un des rares effets qui travaille. |
| Tout est une carte arrondie bordée | oui, massivement | **Problème.** 14 rayons différents, cartes empilées sur les quatre pages. Le regard n'a plus de hiérarchie : tout a la même enveloppe. |
| Apparition en fade-up de chaque bloc | oui | `rowIn`, `nodeIn`, `slowRise`, `writeIn`, `fromLeft`, `fromRight`. **Six variantes du même geste.** Classique. |
| Micro-animation sur tout | oui | 11 boucles simultanées sur méthode. **Réduire.** |
| Bande défilante (marquee) | oui | Motif ultra-daté et ultra-généré. **À supprimer** : elle répète des chiffres déjà présents deux écrans plus bas. |
| Rangée de 3 cartes identiques | oui | Les `pagecard`. Hiérarchie plate volontaire ici — acceptable, mais c'est le motif le plus reconnaissable du genre. |
| Bandeau de 4 statistiques | oui | Les `.band-c`. Même remarque. |
| Photos de banque d'images | oui, 4 | Traitées en bichromie, ce qui les sauve à moitié. Mais elles **n'apportent aucune information** : 150 Ko pour de l'ambiance. |
| Séquence logo à l'ouverture | oui | Le motif « regardez ce que je sais faire » par excellence. 2,8 s payées par le prospect. |
| Faux dashboard / graphes inventés | **non, supprimé** | C'était le pire du site, il a été retiré. Bon point. |
| Glassmorphism, blobs, mesh gradients | non | Absents. Bon point. |
| Violet/indigo | non | Absent. Bon point. |
| Badges flottants, « trusted by » | non | Absents. |

## B. AI slop UX

- **Six variantes d'apparition pour un seul geste.** `rowIn`, `slowRise`, `nodeIn`,
  `fromLeft`, `fromRight`, `writeIn` font tous « arriver un bloc ». Une DA tenue en
  aurait deux.
- **Un résumé « En quinze secondes » sur chaque page intérieure.** Le motif est bon
  une fois, systématique il devient un gabarit.
- **Chaque page se termine par le même CTA, le même pager, le même pied.** Prévisible
  au point qu'on cesse de regarder.
- **Aucun état vide, aucun état d'erreur, aucun chargement** — il n'y a rien
  d'interactif, donc rien à gérer. Cohérent, mais cela signale aussi que le site ne
  demande jamais rien au visiteur avant la toute fin.

## C. AI slop dans le copywriting — **quasi absent, et c'est remarquable**

Mesuré sur 4 922 mots :

| Marqueur | Occurrences |
|---|---|
| « solution », « accompagnement », « expertise », « optimisation » | **5 au total** |
| « scale », « boost », « disruptif », « innovant », « révolutionnaire », « sur-mesure », « clé en main », « écosystème », « synergie » | **0** |
| Densité de chiffres | **1 tous les 21 à 36 mots** |
| Longueur médiane de phrase | **12 à 15 mots** |
| Superlatifs non démontrés | aucun repéré |

C'est l'inverse du profil d'un texte généré. Les phrases refusent, bornent,
chiffrent : « On refuse les missions sous 7 000 € », « votre perte maximale »,
« rien de significatif le premier mois ». **C'est le meilleur actif du site.**

**Le seul vrai défaut de copy : le jargon métier non expliqué.**

| Terme | Occurrences | Expliqué ? |
|---|---|---|
| SPF / DKIM / DMARC | 5 chacun | jamais |
| warm-up | 5 | jamais |
| ICP | 3 | jamais |
| outbound | 4 | jamais |
| bookés | 4 | jamais |
| délivrabilité | 1 | jamais |

La cible déclarée est un dirigeant de PME B2B **qui n'a jamais acheté d'outbound**.
La section censée le rassurer sur sa réputation d'expéditeur le fait en SPF/DKIM/DMARC.

## D. AI slop d'animation

Le mouvement est techniquement irréprochable — transform/opacity/clip-path, cadencé
par le compositeur, coupé sous `prefers-reduced-motion`, 57 i/s mesurés. **La
critique n'est pas technique, elle est éditoriale : il y en a trop et il ne
hiérarchise rien.** Quand la comète, les sept points, le souffle, la dérive du fond
et la jauge d'en-tête bougent en même temps, aucun ne signifie plus rien.

## E. AI slop d'architecture de l'information

- Les quatre pages ont **la même charpente** : chapeau → résumé encastré → 3-4
  sections → CTA → pager. Répétée quatre fois, elle devient un gabarit visible.
- **Aucune page n'a de forme propre.** Une page tarifaire, une page méthode et une
  page process n'ont pas les mêmes besoins de lecture ; elles ont ici le même moule.

---

# UX REPORT

## Navigation

**Bon.** Quatre entrées, un CTA, `aria-current` sur la page active, fil d'Ariane sur
les pages intérieures, index des trois pages dans chaque chapeau. Le parcours au
clavier est exemplaire : lien d'évitement au premier Tab, contour émeraude 2 px
visible partout, ordre logique, tout défile dans le champ.

**Défaut :** le CTA d'en-tête des pages intérieures pointe vers
`index.html#rendez-vous` — il fait quitter la page en cours de lecture et recharge
l'accueil.

## Compréhension

Premier écran de l'accueil, mesuré : titre à 132 px, prix à 228 px, perte maximale à
455 px, mécanisme (email + LinkedIn, humain, paiement au résultat) à 488 px.
**En une seconde** : « les commerciaux ne prospectent plus ».
**En cinq secondes** : le prix complet et le risque borné.
**En trente secondes** : le mécanisme et les quatre gains.
C'est très bien fait et c'est le fruit du travail des derniers jours.

**Défaut :** rien ne dit ce qu'est Leadcore en une catégorie. Le mot « agence »
n'apparaît pas au-dessus de la ligne de flottaison. Un visiteur qui arrive sans
contexte doit inférer.

## Friction

- Le `mailto:` comme unique conversion (voir problème 3).
- Le trou de 7 000 px sans CTA (problème 8).
- 2 790 ms d'ouverture (problème 4).

## Mobile

Hauteurs mesurées à 390 px : accueil 7 727 px, méthode 10 490 px, collaboration
11 226 px, tarifs 8 864 px. Soit **9 à 13 écrans par page**.

- Le bouton de menu fait **42 × 38 px** — sous le minimum WCAG 2.5.8 de 44 × 44.
  C'est le contrôle le plus important de la version mobile.
- Les huit liens de pied de page font **24 px de haut**, empilés. Générateur de
  fautes de frappe au pouce.
- Le fil d'Ariane fait 20 px de haut, le logo 25 px.
- Méthode déborde de **4 px** à 320 et 390 px (`span.s3`, la lame diagonale du fond).

## Accessibilité

| Point | État |
|---|---|
| Contraste AA | conforme sur 6 pages, y compris les légendes sur photo (mesuré 9,0 à 9,5:1 sur les pixels réels) |
| Hiérarchie de titres | propre, aucun saut, un `h1` par page |
| Focus visible | 2 px émeraude, offset 3 px, partout |
| Lien d'évitement | présent et fonctionnel |
| `lang` | `fr` |
| Images | 6, toutes avec `alt` (décoratives en `alt=""`) |
| Liens sans texte accessible | 0 |
| `prefers-reduced-motion` | respecté, rien ne bouge, rien ne reste masqué |
| **Cibles tactiles** | **8 à 9 éléments sous 44 px par page** |

---

# VISUAL DESIGN REPORT

## Typographie — le point faible du système

Inventaire des valeurs **réellement calculées** sur les quatre pages :

| Propriété | Valeurs distinctes | Jugement |
|---|---|---|
| `font-size` | **40** | Aucune échelle. Dix tailles entre 11 et 16 px. |
| `font-weight` | **9** (400, 450, 500, 550, 600, 650, 700, 750, 800) | 450/550/650/750 n'ajoutent rien de perceptible. |
| `letter-spacing` | **53** | Continuum, pas système. |
| `line-height` | **58** | Idem. |

**Cause :** l'usage systématique de `clamp()` sur chaque composant produit une valeur
continue différente par élément. C'est fluide, et c'est l'inverse d'un système.
**Un lecteur ne voit pas 40 tailles, il voit une page qui n'a pas de gamme.**

**Solution :** une échelle fermée de 8 pas (12, 14, 16, 19, 23, 29, 38, 56) et trois
graisses (400, 600, 800), déclarées en jetons, `clamp()` uniquement sur les deux pas
d'affichage.

## Couleur — tenue

**9 couleurs de texte seulement**, hiérarchisées (bone → mist → mist-dim → émeraude →
émeraude-hi). C'est discipliné. La distinction `--accent-dim` (traits) /
`--accent-lo` (texte) est une vraie finesse.

**Défaut :** le site est monochrome à 100 %. Une seule teinte pour quatre pages, tous
les états, tous les niveaux. Aucune couleur ne signifie rien de particulier — ni
l'alerte, ni le neutre, ni le positif. L'émeraude est à la fois la marque, l'accent,
le lien, le succès, l'actif et le décor.

## Espacement — non systématisé

**41 valeurs de padding, 30 valeurs de gap.** Même diagnostic que la typographie.

## Rayons — 14 valeurs pour 2 jetons déclarés

`16, 13, 12, 11, 10, 9, 8, 5, 3, 2, 1.5, 0, 50%, 999px`. Les jetons ne déclarent que
`--radius:16px` et `--radius-sm:10px`. **Douze rayons sont donc des exceptions
accidentelles.** C'est la définition d'une DA qui accumule des variations sans raison.

## Ombres — tenues

6 ombres distinctes, toutes justifiées (relief encastré, relief soulevé, halo
d'accent, ombre du panneau). Bon.

## Composition et rythme

Vu les quatre pages côte à côte à échelle réduite, **le rythme est plat**. Chaque
section a la même largeur, le même bord gauche, le même traitement. Il n'y a
jamais :
- de pleine largeur,
- de rupture d'échelle,
- de composition asymétrique,
- de moment de silence voulu,
- de changement de densité.

Une page de 8 000 px sans variation de rythme se lit comme un document, pas comme une
démonstration.

## Iconographie

14 pictogrammes dessinés sur une grille cohérente (24, filet 1,5, extrémités rondes).
**C'est le seul élément réellement propriétaire du système visuel.** Ils ne viennent
pas de Lucide ni d'Heroicons. Bon point, et une piste : c'est là que la DA pourrait
prendre.

## Imagerie

Quatre photographies Unsplash traitées en bichromie par la même rampe. Le traitement
est sérieux et documenté. **Mais elles n'informent pas.** Une maille de façade pour
« la base construite ligne par ligne » est une métaphore, pas une preuve. 150 Ko pour
de l'ambiance sur un site qui manque de preuves.

---

# B2B LEAD GEN FIT

## Ce que le site réussit

- **Le mécanisme est limpide.** 1 900 contacts → 9 800 messages → 120 réponses lues →
  12 rendez-vous honorés. Aucun concurrent n'affiche ça.
- **Le prix est en premier écran**, entier, avec la perte maximale.
- **Les objections sont traitées avant d'être posées** : domaine exposé, spam,
  engagement, agenda saturé, épuisement des segments.
- **Le site refuse des clients** et le dit. C'est le signal de crédibilité le plus
  fort qu'une agence puisse émettre.
- **Le vocabulaire est celui du métier** : show rate implicite, qualification, J+30,
  coût par rendez-vous honoré. Ce n'est pas une agence marketing qui a remplacé des
  mots par « leads ».

## Ce qui manque à un prospect qui décide

| Attente | État |
|---|---|
| Combien ça coûte | **couvert, excellent** |
| Comment ça marche | **couvert, excellent** |
| Ce que ça m'engage | **couvert** |
| Qui l'a déjà fait | **absent** |
| Qui êtes-vous | **quasi absent** — deux initiales dans un rond |
| Que se passe-t-il si vous échouez | **absent** — aucune garantie plancher |
| Combien vous êtes | **absent** |
| Comment je vous paie | **absent** |
| Et le RGPD | **absent** |

Les quatre dernières lignes sont des décisions d'offre, pas de design, et sont déjà
consignées ailleurs. Les deux du milieu sont du ressort du site.

## Positionnement

**Leadcore ressemble à une agence de génération de rendez-vous compétente et
honnête.** Elle ne ressemble pas encore à une agence *établie*. Le site a le ton d'un
opérateur qui sait faire ; il n'a pas les attributs de quelqu'un qui l'a déjà fait.

---

# COPYWRITING REPORT

Le texte est le meilleur élément du site. Les corrections ci-dessous sont peu
nombreuses **parce qu'il y a peu à corriger**.

### 1. Le jargon d'infrastructure, section « Ce qui porte votre nom »

**AVANT** — « Des domaines achetés pour vous, configurés en SPF, DKIM et DMARC avant
le premier envoi. »

**APRÈS** — « Des domaines achetés pour vous, et authentifiés avant le premier envoi
— les trois réglages techniques (SPF, DKIM, DMARC) qui font qu'un email arrive en
boîte de réception plutôt qu'en spam. »

*Pourquoi :* la section existe pour rassurer un dirigeant. Elle le fait aujourd'hui
dans une langue qu'il ne parle pas. Trois acronymes non glosés, cinq fois chacun.

### 2. « warm-up », cinq occurrences non expliquées

**AVANT** — « Le warm-up prend trois semaines. »

**APRÈS** — « Il faut trois semaines pour qu'une boîte d'envoi neuve soit acceptée
par les messageries — on monte le volume par paliers, sinon tout part en spam. »

*Pourquoi :* c'est l'argument central de l'engagement de trois mois. Le laisser en
jargon, c'est perdre la justification.

### 3. Le titre de l'accueil ne dit pas le métier

**AVANT** — « Vos commerciaux ne prospectent plus. Ils closent. »

*Le titre est bon et je ne propose pas de le changer.* Mais **« closent » est de
l'argot commercial**, et rien au-dessus de la ligne de flottaison ne dit « agence de
prospection ». Ajouter un sur-titre de catégorie, retiré plus tôt dans le projet à la
demande — c'était une erreur.

**AJOUT** — au-dessus du titre : « Agence de prospection B2B · Email et LinkedIn ».

### 4. La formule des titres, 22 fois sur 22

Voir problème 6. Ce n'est pas une phrase à corriger, c'est une règle à desserrer.

### 5. La section rendez-vous annonce sa propre panne

**AVANT** — « Le calendrier en ligne n'est pas encore branché. Écrivez-nous une ligne
avec votre secteur et votre ticket moyen. »

**APRÈS** (tant que le calendrier n'existe pas) — « Écrivez-nous une ligne : votre
secteur et votre ticket moyen. Vous recevez trois créneaux dans la journée. »

*Pourquoi :* la première version informe le prospect d'un manquement interne. La
seconde dit la même chose en promettant un délai. Aucune information utile n'est
perdue.

---

# SECTION-BY-SECTION AUDIT

## ACCUEIL

### Héros + panneau de prix
**Fonction :** promesse, mécanisme, prix, risque. **Utilité :** maximale.
**Hiérarchie :** excellente — titre 74 px, prix 40 px, chapô 21 px.
**Design :** le meilleur écran du site. **UX :** deux CTA clairs, un primaire.
**Conversion :** forte. **Crédibilité :** forte depuis le retrait des chiffres
inventés. **AI slop :** faible.
**→ CONSERVER.** Ajouter un sur-titre de catégorie.

### Bande défilante (marquee)
**Fonction :** afficher les volumes de production. **Utilité :** nulle — les mêmes
chiffres sont sur méthode, mieux présentés. **Design :** motif daté.
**UX :** illisible en mouvement. **Conversion :** aucune. **AI slop :** élevé.
**→ SUPPRIMER.** Gain : un motif générique en moins, une boucle permanente en moins.

### Quatre gains + deux bandeaux
**Fonction :** bénéfices et sélection à l'entrée. **Utilité :** haute.
**Hiérarchie :** plate — quatre cartes de poids identique.
**Design :** correct. **AI slop :** moyen (le bandeau de 4 stats est un motif).
**→ RETRAVAILLER.** Faire émerger « on refuse sous 7 000 € » au-dessus des quatre
gains : c'est l'argument le plus rare, il est en dessous des plus banals.

### Le défilé (4 affirmations + photo)
**Fonction :** montrer ce qu'on opère. **Utilité :** moyenne — redit le mécanisme du
héros. **Design :** soigné, l'activation fonctionne. **UX :** inaccessible au
clavier (les affirmations ne sont pas focusables). **Crédibilité :** les photos
n'apportent rien. **AI slop :** élevé — c'est le motif « feature showcase » standard.
**→ SIMPLIFIER.** Garder les quatre affirmations, supprimer les photos, ou remplacer
les photos par les quatre pictogrammes agrandis.

### Le fondateur
**Fonction :** incarner. **Utilité :** critique, vu l'absence de preuve.
**Design :** deux initiales dans un rond. **Crédibilité :** faible en l'état.
**→ RESTRUCTURER.** C'est la section la plus sous-exploitée du site. Photo, nom,
parcours, une phrase à la première personne.

### Les trois cartes
**Fonction :** répondre aux trois questions et router. **Utilité :** haute.
**Design :** trois cartes identiques, hiérarchie plate assumée. **AI slop :** le motif
« 3 cartes » est le plus reconnaissable du genre, mais ici il est justifié — trois
questions équivalentes. **→ CONSERVER.**

### Prise de rendez-vous
**Fonction :** convertir. **Utilité :** maximale. **Crédibilité :** **détruite** par
la phrase sur le calendrier non branché. **Conversion :** un `mailto:`.
**→ RESTRUCTURER EN PRIORITÉ.**

## MÉTHODE

### Résumé (schéma des deux canaux + entonnoir)
**Fonction :** expliquer en quinze secondes. **Utilité :** haute. **Design :** le
schéma est le meilleur objet graphique du site. **UX :** lisible.
**AI slop :** faible pour le schéma, élevé pour les 11 boucles d'animation.
**→ CONSERVER, calmer le mouvement.**

### Colonne de filtrage (`.stick-2`)
**Fonction :** détailler les six filtres. **Utilité :** haute.
**Design :** **1 760 px de vide à gauche.** **→ RESTRUCTURER.**

### La fiche livrée
**Fonction :** montrer le livrable. **Utilité :** très haute — c'est la seule chose
concrète que le client reçoit. **Crédibilité :** bonne (étiquetée « Exemple », à
juste titre ici). **→ CONSERVER et REMONTER.** Elle est à 55 % d'une page de
8 300 px ; elle mériterait d'être sur l'accueil.

### Ce qui porte votre nom
**Fonction :** tuer l'objection délivrabilité. **Utilité :** haute.
**Copy :** jargon non expliqué. **→ RETRAVAILLER le texte.**

## COLLABORATION

### Frise horizontale
**Fonction :** le premier mois en un regard. **Utilité :** haute. **Design :** réussi.
**Défaut :** **cause le débordement de 1 156 px.** **→ CONSERVER, corriger.**

### Détail des quatre semaines
**Fonction :** approfondir. **Utilité :** moyenne — redit la frise avec plus de mots.
**→ SIMPLIFIER.** Passer de quatre rangées longues à quatre rangées courtes.

### La balance des charges
**Fonction :** montrer l'asymétrie 3 lignes / 10 lignes. **Utilité :** très haute.
**Design :** l'asymétrie *est* l'argument, elle est bien rendue.
**→ CONSERVER.** Une des deux meilleures sections du site.

### Quatre conditions + cinq cas + cinquième mois + sortie
**Utilité :** haute. **Design :** quatre blocs de cartes d'affilée, monotone.
**→ SIMPLIFIER le rythme.**

## TARIFS

### Trois montants + ratio 2 sur 30
**Fonction :** prix et seuil de rentabilité. **Utilité :** maximale.
**Design :** le ratio dessiné en 30 carrés est **la meilleure idée du site** — il fait
comprendre en une seconde ce qu'un paragraphe ne ferait pas comprendre.
**→ CONSERVER.**

### L'addition, la comparaison, pour qui, la durée
**Utilité :** haute. **Design :** le grand livre et les barres comparées fonctionnent.
**→ CONSERVER.**

---

# ANALYSE DE LA PERCEPTION

### Profil A — dirigeant de PME B2B, n'a jamais acheté d'outbound
**Attire :** le prix en premier écran, « vous ne payez que les rendez-vous qui ont
lieu ». **Rassure :** la perte maximale bornée, le refus des missions.
**Perd :** SPF/DKIM/DMARC, ICP, warm-up. **Méfiance :** aucun nom de client.
**Quitte si :** l'ouverture de 2,8 s le fait partir avant d'avoir vu le prix.

### Profil B — Head of Sales
**Attire :** les volumes réels, la fiche de rendez-vous.
**Rassure :** les quatre conditions de qualification, le J+30.
**Méfiance :** « qui décide qu'un rendez-vous est qualifié ? » — sans réponse.
**Quitte si :** rien ; c'est le profil le mieux servi.

### Profil C — directeur commercial
**Attire :** « 8 à 12 par mois », le ratio 2 sur 30.
**Confusion :** le trou de CTA — convaincu à 55 %, il doit défiler jusqu'à 86 %.
**Méfiance :** aucune garantie si le mois produit trois rendez-vous.

### Profil D — déjà bombardé d'outbound par des agences
**C'est le profil le plus sévère, et celui pour lequel le site est le mieux armé.**
Il reconnaît les vrais chiffres (1 900 contacts, 120 réponses, 35 envois/jour/boîte)
et le fait qu'on refuse des missions. **Mais :** le débordement horizontal et le
« calendrier pas encore branché » lui disent « amateur », et il connaît trop bien le
registre visuel quasi-noir/émeraude pour ne pas le trouver générique.

---

# TEMPLATE DETECTION

**Si on remplace le logo Leadcore par celui d'une autre agence B2B :**

| Élément | Reste identique ? |
|---|---|
| Palette, fond, halos, grain | **oui, à 100 %** |
| Grammaire des cartes et des rayons | **oui** |
| Système de mouvement (33 keyframes) | **oui** |
| Structure des quatre pages | **oui** |
| Bande défilante, défilé, 3 cartes, 4 stats | **oui** |
| Photos en bichromie | **oui** |
| Pictogrammes | non — ils sont dessinés pour ce projet |
| Schéma des deux canaux | non — il décrit ce process |
| Ratio 2 sur 30 | non |
| Grille tarifaire en premier écran | non |
| Le copy entier | non |

**≈ 70 % du système visuel est transposable tel quel.** Tout ce qui différencie
Leadcore est du contenu. **La direction artistique ne porte aucune part de la
différenciation** — c'est le constat central de cet audit.

---

# TEST FINAL

| Question | Réponse |
|---|---|
| Prix de design dans sa catégorie ? | **Non.** Bien exécuté, pas mémorable. |
| Chaque interaction aussi simple que possible ? | **Non** — 2,8 s d'ouverture, mailto, trou de CTA. |
| Le prospect comprend-il vite pourquoi agir ? | **Oui**, depuis le panneau de prix. |
| Ressemble à une entreprise capable de générer du pipeline ? | **Oui sur le fond, non sur la preuve.** |
| Reconnaîtrais-je Leadcore sans le logo ? | **Non.** |
| Combien viendrait d'un prompt générique ? | **Le fond, les halos, le grain, les cartes, les six apparitions, la marquee, le défilé, les 3 cartes, les 4 stats, les photos — environ 70 % du visuel.** |
| Quelque chose sent le marketing artificiel ? | **Plus depuis le retrait du panneau inventé.** C'était le point noir, il a été traité. |
