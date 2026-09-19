# Site vitrine Leadcore

Site statique : HTML, CSS et un fichier JavaScript. Pas de build, pas de
dépendance à installer. Deux fonctions, dans cet ordre :

1. **Informer et rassurer** le prospect qui arrive depuis un email sortant :
   méthode, volumes réels de production, critères de qualification, prix.
2. **Faire prendre un rendez-vous.**

Le contenu vient de [`docs/LEADCORE-FONCTIONNEMENT.md`](../docs/LEADCORE-FONCTIONNEMENT.md)
et de [`docs/MAJ-OFFRE-2026-09.md`](../docs/MAJ-OFFRE-2026-09.md). Les couleurs
sont celles du deck (`deck/index.html`), aux valeurs exactes ; les fontes et le
mouvement sont propres au site.

## Les quatre pages

Le site tenait sur une page unique de 11 600 px. Il est désormais en quatre
pages, plus les deux pages légales.

| Page | Ce qu'elle porte | Composition | Hauteur |
|---|---|---|---|
| `index.html` | héros et grille tarifaire, les quatre gains, le défilé, le fondateur, trois cartes vers le détail, la prise de rendez-vous | panneau de prix + défilé illustré | 5 920 px |
| `methode.html` | schéma des deux canaux, entonnoir chiffré, six filtres, la fiche livrée, ce qui porte votre nom | schéma animé + énoncé tenu + colonne de filtrage | 8 240 px |
| `collaboration.html` | la frise des quatre semaines, le détail semaine par semaine, la balance des charges, la facture, la sortie | frise horizontale animée + balance | 7 765 px |
| `tarifs.html` | les trois montants, le chiffre à retenir, l'addition d'un trimestre, face à un recrutement, à qui on dit non | trois cartes + grand livre + comparaison | 7 190 px |

L'accueil a perdu **61 %** de sa hauteur et **67 %** de ses mots par rapport à
la page unique d'origine. Il ne garde que
ce qui décide d'un premier contact ; le reste est à un clic, et les trois cartes
d'orientation annoncent ce qu'on y trouve.

La séquence d'ouverture ne vit que sur l'accueil. Une entrée directe sur une page
interne ne la joue pas, et la classe `has-intro` empêche la montée de page de se
superposer à la cascade du héros.

### À garder synchronisé entre les six pages

Il n'y a pas de build : l'en-tête, le pied de page et le bloc `<head>` sont donc
**recopiés dans chaque fichier**. Une modification de la navigation, du pied ou
du jeton `?v=` doit être reportée dans les six. C'est le prix du « pas de build »,
assumé : six fichiers restent relisibles, un générateur serait une dépendance de
plus à faire tourner avant chaque mise en ligne.

## Le discours

La page est construite sur ce que le client **gagne**, pas sur la façon dont on
produit. Chaque cadre désamorce au passage une objection, sans jamais la nommer :

| Page · cadre | Ce qu'il vend | L'objection qu'il tue |
|---|---|---|
| Accueil · héros | leurs commerciaux closent au lieu de prospecter | — |
| Accueil · panneau de prix | 1 200 / 500 / 200, et 2 700 € de perte maximale | « combien, et qu'est-ce que je risque » |
| Accueil · bandeau de sélection | on refuse sous 7 000 € de valeur client | « ils prennent tout le monde » |
| Accueil · ce que vous y gagnez | agenda prévisible, risque borné, zéro embauche, réponse datée | « un commercial me coûterait moins cher » |
| Accueil · les trois questions | comment, ce que ça prend, combien — avec les montants | « je n'ai pas le temps de lire trois pages » |
| Accueil · qui vous parle | un opérateur, quatre à six clients | « je serai un numéro dans une agence » |
| Méthode · le résumé | deux canaux qui convergent, l'entonnoir chiffré | « je ne comprends pas ce que vous faites » |
| Méthode · chapô | chaque réponse est lue avant d'arriver chez vous | « c'est du spam automatisé » |
| Méthode · filtre 2 | la liste d'exclusion part au contrat | « vous allez démarcher mes clients » |
| Méthode · filtre 4 | LinkedIn en parallèle, et la fragilité d'un canal unique | « et si vos domaines sautent » |
| Méthode · filtre 5 | un humain lit les 120 réponses | « c'est du spam automatisé » |
| Méthode · ce qui porte votre nom | domaine et comptes hors circuit | « ça va cramer ma délivrabilité » |
| Collaboration · la frise | quatre semaines, trois heures et demie | « combien de temps avant de voir quelque chose » |
| Collaboration · la balance | trois lignes chez vous, dix chez nous | « je vais devoir tout piloter » |
| Collaboration · le cinquième mois | 1 900 contacts consommés par mois, un segment de 7 600 à 11 400 tient 4 à 6 mois, le plan est écrit en semaine 1 | « vos 1 900 contacts, vous les tenez combien de temps » |
| Collaboration · la facture | les quatre conditions, ou rien | « je vais payer des rendez-vous bidons » |
| Collaboration · la sortie | la base et les domaines vous restent | « je serai pris en otage » |
| Tarifs · les trois lignes | 1 200 € / 500 € / 200 €, visibles d'emblée | « le vrai prix est caché en bas » |
| Tarifs · sous la carte setup | un prestataire qui ne facture pas le setup le bâcle | « pourquoi payer avant d'avoir quelque chose » |
| Tarifs · la durée | trois mois, sinon on vous vend une réponse que l'infra ne peut pas produire | « vous vous protégez, pas moi » |
| Tarifs · le ratio | deux signés sur trente, 7 % — et les vingt-huit qui restent | « je n'arrive pas à chiffrer » |
| Tarifs · face à un recrutement | 8 700 € contre 11 100 €, et 2 700 € de perte maximale | « je préfère recruter » |
| Tarifs · pour qui | on refuse des missions | « ils prennent tout le monde » |

**Le ratio, et pourquoi c'est lui plutôt qu'un coût unitaire.** Ce que le
dirigeant décide, ce n'est pas un prix à l'unité, c'est un pari : combien faut-il
en signer pour que ça vaille le coup. Le bloc donne donc le ratio, dessiné en
trente carrés dont deux sont pleins.

Le calcul, à refaire si un montant bouge :

| Valeur client | Signatures pour rembourser 8 700 € | Taux de signature | RDV qui restent |
|---|---|---|---|
| 7 000 € (le plancher) | 2 sur 30 | 6,7 % | 28 |
| 8 700 € et au-dessus | 1 sur 30 | 3,3 % | 29 |

La formulation courte « rentable à partir d'un rendez-vous signé par trimestre »
**n'est pas vraie au plancher** : une signature à 7 000 € couvre 8 700 € de
dépense à 80 %. Elle ne devient vraie qu'au-dessus de 8 700 € de valeur client,
ce que la mention fine dit explicitement. **Ne pas la promouvoir en titre** sans
refaire le tableau ci-dessus.

Aucune section ne s'intitule « objections » et aucune ne pose de question
rhétorique : l'objection est traitée dans le corps du texte, avant que le
lecteur ne la formule.

Les chiffres contractuels ne bougent jamais sans passer par
[`docs/MAJ-OFFRE-2026-09.md`](../docs/MAJ-OFFRE-2026-09.md). La promesse reste
à 8-12 rendez-vous par mois ; les 15 à 20 de l'objectif interne ne figurent
nulle part sur le site.

### Une seule définition du volume

Le site, `LEADCORE-FONCTIONNEMENT.md` et `MAJ-OFFRE-2026-09.md` disent tous les
trois **1 900 contacts uniques consommés par mois**. C'est le chiffre qui sort
de la chaîne de l'entonnoir (29 réponses positives ÷ 1,5 % = 1 939, arrondi) et
c'est celui qui sert à tout calcul d'épuisement de segment.

`MAJ-OFFRE` a porté **2 400** pendant un temps, dans la seule ligne « Segments »
de son tableau. C'était faux, et la correction est datée dans le document.
Deux garde-fous pour que ça ne revienne pas :

- **Un segment se vide en contacts uniques, pas en touches.** Un contact
  travaillé quatre fois consomme une ligne du segment et non quatre. Le nombre
  de contacts *touchés* dans un mois calendaire est plus élevé — c'est une
  mesure d'activité, pas de consommation.
- Le 2 400 erroné était identique au **2 400 € de variable** (12 × 200 €) situé
  deux tableaux plus bas dans le même document. Se méfier de cette confusion en
  relisant.

Conséquence chiffrée, affichée sur Collaboration : un segment de 7 600 à
11 400 contacts s'épuise en 4 à 6 mois.

### Écart connu avec les documents de fonctionnement : LinkedIn

Le site présente **LinkedIn comme un canal actif**, lancé en parallèle de
l'email sur les mêmes contacts. Les documents ne disent pas encore ça :

- [`docs/LEADCORE-FONCTIONNEMENT.md`](../docs/LEADCORE-FONCTIONNEMENT.md) ne
  cite LinkedIn que comme **source de données** pour le scraping et
  l'enrichissement.
- [`docs/MAJ-OFFRE-2026-09.md`](../docs/MAJ-OFFRE-2026-09.md) section 5 classe
  encore « Canal 2 — LinkedIn en complément de l'email, et à partir de quel
  client » parmi les **sujets à trancher**.

Le site a été écrit sur l'instruction du propriétaire, qui a confirmé que le
canal tourne. **Les deux documents restent à mettre à jour**, et tant que ce
n'est pas fait c'est le site qui est en avance sur le référentiel, pas
l'inverse. Les volumes affichés (7 600 emails, 2 200 touches LinkedIn, un
rendez-vous honoré sur quatre venu de LinkedIn) et les règles annoncées
(comptes dédiés, vingt connexions par jour, aucun message de vente en demande
de connexion) sont à confirmer contre la production réelle avant la mise en
ligne.

## Système visuel

Registre : un terminal de salle de marché. Le site montre la production réelle
d'une campagne comme un carnet d'ordres montre un marché — chiffres alignés,
libellés en mono, un seul accent lumineux sur du presque noir.

**Le fond.** Un seul sol continu pour tout le site. Une version précédente
alternait des cadres clairs et sombres par jetons de thème (`t-jour`,
`t-craie`, `t-graphite`) : empiler des blocs de teintes contraires découpait la
page en tranches et se lisait comme un gabarit, pas comme un lieu. Le système a
été retiré en entier.

Ce qui le remplace, en section 24 de `styles.css`, tient en quatre couches
fixées au cadre, donc lues comme une lumière d'ambiance et non comme un décor
qui défile :

| Couche | Ce qu'elle fait |
|---|---|
| **le sol** | un champ continu à `#0C1413`, avec une dérive tonale verticale |
| **la signature** | la lumière propre à la page — elle change de **forme**, pas seulement de place |
| **le grain** | inchangé, 2,4 % |

Une troisième couche a existé, un « calque de plan » qui traçait les deux bords
du conteneur sur toute la hauteur. Elle a été retirée : posés dans les marges,
ces filets fermaient la page au lieu de l'ouvrir, et la marge sert mieux à
élargir le contenu.

**Le sol n'est pas au noir, et c'est le point à ne pas défaire.** Un fond déjà
posé sur le plancher ne peut plus s'enfoncer : une plaque encastrée dans du
`#050908` ne descend que de cinq niveaux sur 255, ce qui est invisible. Le sol
est donc relevé à `#0C1413` pour laisser dix niveaux de marge de chaque côté.
Relevé sur le rendu : **sol 12, plaque 4, pont 19**.

Le rythme d'une page est donc une affaire d'ombre, et il reste lisible si l'on
retire toute couleur. Deux ponctuations par page, jamais plus :

| Classe | Effet | Ce qu'on y met |
|---|---|---|
| (aucune) | à plat sur le sol | le corps de la page |
| `.plate` | encastrée, arête haute éclairée | là où vivent les chiffres |
| `.raise` | soulevée, ombre portée vers le haut | là où on parle à quelqu'un |

La signature par page : dôme haut-droite sur l'accueil, biseau de flanc avec une
lame diagonale sur la méthode, strates horizontales sur la collaboration, voûte
haute resserrée plus un quadrillage de registre sur les tarifs. Une page sans
classe `p-*` (les deux pages légales) retombe sur la lumière de l'accueil en
retrait.

**Le premier écran porte le prix.** L'emplacement le plus visible du site, à
droite du titre d'accueil, a porté une trajectoire chiffrée étiquetée
« Exemple ». Deux raisons de l'avoir remplacée par la grille tarifaire :

- un dirigeant qui lit « Exemple » comprend « inventé » et **décote tout le
  reste de la page**, y compris les chiffres qui sont vrais ;
- mesuré sur la version précédente, le prix n'apparaissait qu'à **3 432 px**,
  soit 59 % de la page. Un lecteur de quatre-vingt-dix secondes descend de
  2 500 à 3 500 px : il sortait sans connaître le prix.

Le panneau tient en trois lignes, une perte maximale et un ratio. **Ne rien y
ajouter** : au-delà il cesse d'être lisible d'un coup d'œil, ce qui est son seul
travail. Positions actuelles : 1 200 € à 228 px, 2 700 € à 455 px, le bandeau de
sélection à 1 519 px, le fondateur à 3 029 px.

**Le cadre, et pourquoi il est partout.** Le site était presque entièrement fait
de texte posé sur le fond. Un bloc de prose sur du vide n'offre aucune prise :
le regard glisse et ne s'arrête nulle part, ce qui est exactement le contraire
de ce dont a besoin un dirigeant qui parcourt. Le jeton `.pad` donne une surface
et une arête, en deux poids seulement — plein pour ce qui porte l'information,
filet seul (`.pad.lite`) pour ce qui l'accompagne. Trois poids donneraient une
page en damier.

**Pictogrammes.** Un seul jeu, dans `gen_shell.ICONS`, dessiné sur la grille de
24 et au filet de 1,5 des icônes déjà présentes, extrémités et jointures rondes,
aucun aplat. Ils prennent `currentColor`, donc le même jeu sert sur tous les
fonds. Deux emplois : glissé dans un libellé (`.ico`, 15 px) ou posé sur une
pastille quand il ouvre un bloc (`.icob`). Ils sont `aria-hidden` parce qu'ils
doublent toujours un intitulé écrit à côté — **un pictogramme qui ne dit rien de
plus que son titre est du bruit**, et c'est le seul critère pour en ajouter un.

**Chaque page répond d'abord en image.** Les trois pages de détail ouvrent sur
un résumé encastré (`.sec.plate.tldr`) placé avant le premier paragraphe :

| Page | Le résumé | Ce qui s'anime |
|---|---|---|
| Méthode | `.flow`, les deux canaux qui partent ensemble et convergent, puis l'entonnoir chiffré | les connecteurs se tracent au `clip-path`, puis une **comète** parcourt chaque trajet en boucle, les touches battent à son passage et la sortie souffle |
| Collaboration | `.railh`, les quatre semaines sur une ligne horizontale | l'axe se remplit, une **tête lumineuse** court sur son arête et allume les quatre repères dans l'ordre, les cartes se lèvent |
| Tarifs | `.price3` puis `.ratio` | les trois cartes se lèvent, les trente carrés apparaissent en cascade |

L'accueil a le sien, `.defile` : quatre affirmations à gauche, un cadre d'image
tenu à droite. L'affirmation qui traverse le tiers médian de la fenêtre devient
active et fait changer l'image. La sélection est faite par la marge racine d'un
`IntersectionObserver` (`-38% 0px -46% 0px`), donc sans écouteur de défilement
ni calcul de position. **Sans JavaScript, le balisage porte déjà `.on` sur la
première affirmation et la première image** : la page reste illustrée.

La légende est posée sur la photographie, derrière un voile en dégradé.
Contraste mesuré sur les pixels réellement rendus, image par image, et non sur
la couleur de fond déclarée : **9,0 à 9,5:1** selon la photo.

La frise de collaboration a été refaite une seconde fois : la tête court sur
l'axe et chaque arrêt s'allume au moment où elle le dépasse — anneau qui
s'ouvre, filet d'accent tiré sur l'arête haute, carte qui monte, chiffre de la
semaine en filigrane. La cascade est une suite de retards calés sur la course
de la tête : **1,4 s pour quatre arrêts, donc un arrêt toutes les 350 ms**.
Changer la durée de la tête sans changer ces retards désynchronise l'ensemble.

Le filigrane déborde de sa carte, donc il a son propre calque rogné
(`.ghostwrap`). Rogner la carte elle-même couperait le repère et son anneau,
qui vivent au-dessus de son arête haute — c'est ce qui s'était passé à la
première tentative.

La comète du schéma des canaux est la seule boucle du site en dehors des deux
témoins de l'accueil : elle porte `data-live`, donc l'`IntersectionObserver` la
met en pause hors du champ. Elle anime `stroke-dashoffset`, qui n'est pas
composité — mesuré à part sur trois SVG de 52 px de large, l'écart est de
**0,2 image par seconde à CPU ÷4**, immobile. C'est le trajet que le schéma doit
faire comprendre, donc c'est le trajet qui bouge.

La tête de la frise est portée par une piste tendue d'un bord à l'autre : le
pourcentage d'un `translate` se calcule sur la boîte de l'élément lui-même, donc
`translateX(100%)` vaut exactement la longueur de l'axe — sans requête de
conteneur ni mesure en JavaScript. **Ne pas passer `.railh` en
`container-type:size`** : sa hauteur est automatique et il s'écraserait à zéro.

Le connecteur de `.flow` est un SVG étiré par `preserveAspectRatio="none"`,
donc il suit la largeur de sa cellule sans recalcul. Il est **dessiné pour une
lecture de gauche à droite** : tourné de 90° il ne veut plus rien dire, et en
colonne (≤ 860 px) il est remplacé par un simple trait vertical.

Sur la frise, le repère est au **bord gauche** de chaque arrêt et non au centre :
un point centré désigne une carte, un point au bord désigne un début.

**Compositions par page.** Chaque page a sa propre structure, en section 30, pour
qu'aucune ne se lise comme un morceau détaché d'une autre :

- **Méthode** — `.stick-2` tient l'énoncé et le sommaire en position fixe à
  gauche pendant que `.spine` fait défiler cinq filtres à droite, avec une
  indentation qui progresse et un rail qui se remplit. Le tri se voit avant
  d'être lu.
- **Collaboration** — `.chrono` en trois colonnes : la semaine, ce qui se passe,
  ce que ça vous coûte. Puis `.duo`, deux colonnes face à face dont
  l'asymétrie **est** l'argument : trois lignes de votre côté, sept du nôtre.
- **Tarifs** — `.ledger` à lignes réglées, montants alignés à droite et trait de
  total : la page se lit comme une addition. Puis `.vs`, deux barres à la même
  échelle face à un recrutement de SDR junior.

Les bandeaux d'ouverture se ferment sur `.pnav`, l'index des trois pages : elles
se lisent dans l'ordre et sans ce repère chacune a l'air isolée.

L'en-tête, la bande défilante, le héros et le pied vivent hors des sections.

**Contraste.** Un audit parcourt chaque nœud de texte des six pages, aplatit les
fonds semi-opaques sur leurs parents et compare au seuil WCAG AA correspondant à
la taille et à la graisse. Résultat : aucun texte sous le seuil.

Deux émeraudes ne sont **pas** interchangeables et la distinction est dans les
jetons : `--accent-dim` (`#0F7A56`) ne donne que 3,5:1 sur le sol, il convient
aux traits et aux points mais **jamais au texte**. Pour du texte accentué en
petit corps il existe `--accent-lo` (`#14A071`), à 5,6:1.

**Typographie.** Geist en variable porte toute la structure : un seul fichier
pour les graisses 400 à 800, la hiérarchie se fait à la graisse et à l'approche
plutôt qu'en empilant des familles. Geist Mono pour les libellés techniques et
les chiffres. Instrument Serif en italique **uniquement** sur les mots mis en
exergue dans les titres (`<span class="ex">`) : c'est le seul contraste de
famille du site, et il perd son effet dès qu'on s'en sert ailleurs. Une page en
français ne télécharge que les trois fichiers `latin`, soit 73 Ko, contre 94 Ko
avant la refonte.

**Ponctuation haute.** Le français demande une espace insécable devant `:`, `;`,
`!`, `?` et à l'intérieur des guillemets. Sans elle, « ce qu'ils sont devenus :
perdu » rejette les deux-points en début de ligne, et ça se voit. Les six pages
utilisent `&nbsp;` et non l'espace fine U+202F : l'insécable ordinaire est
présente dans toutes les fontes, la fine ne l'est pas, et un glyphe manquant
coûte plus cher qu'une espace un peu large. **À reporter sur tout texte
ajouté.**

**Ouverture.** Une séquence d'ouverture joue au premier chargement : six points
jaillissent, la marque éclôt du point d'impact, le mot se révèle par balayage,
puis le verrou glisse vers l'en-tête. Le balisage est dans `index.html` (logo
vectorisé, inliné), la chorégraphie en section 23 de `styles.css`.

Elle ne se joue **que** quand elle a du sens, et main.js vérifie les quatre cas
avant de poser la classe `.go` :

| Cas | Ouverture |
|---|---|
| Première visite de la session | oui, 2,4 s |
| Deuxième visite (même session) | non, `sessionStorage` |
| Arrivée sur une ancre (`/#tarifs`) | non, le visiteur vise une section |
| `prefers-reduced-motion: reduce` | non, et verrouillé aussi en CSS |
| Sans JavaScript | non, le bloc reste `display:none` |
| Retour arrière navigateur | non |

Le premier geste — clic, touche, molette, doigt — la passe immédiatement, et le
bloc est retiré du DOM à la fin : aucune couche fixe ne subsiste au-dessus de la
page. Mesuré : LCP 192 ms et CLS 0 avec l'ouverture active, parce que la page est
peinte derrière l'habillage. Le coût réel est perceptuel, pas métrique : 2,4 s
avant de voir le contenu, une fois par session.

Le même habillage existe en fichier vidéo, voir [`brand/`](../brand/README.md).

**Mouvement.** Aucune bibliothèque : ni GSAP, ni Lenis, ni Framer Motion. Le
défilement reste natif, jamais détourné. Trois règles tenues partout :

1. On n'anime que `transform`, `opacity` et `clip-path`, donc le compositeur
   travaille seul. Jamais une largeur ni une position.
2. Un seul écouteur de défilement et un seul de pointeur pour toute la page,
   tous deux cadencés par `requestAnimationFrame`.
3. Ce qui boucle ne tourne qu'à l'écran. Les éléments porteurs de `data-live`
   reçoivent la classe `.live` d'un `IntersectionObserver` ; hors du champ la
   feuille de style met la boucle en pause au lieu de la supprimer, pour
   qu'elle reprenne où elle s'était arrêtée.

La jauge de progression, la jauge du calque de fond, le remplissage du rail de
la méthode, la dérive de la signature lumineuse et toutes les apparitions
propres aux pages (section 31) passent par `animation-timeline` quand le
navigateur sait faire : la progression est alors calculée par le compositeur,
sans une ligne de JavaScript. Firefox retombe sur un `IntersectionObserver` et
une transition, et la page est complète dans les deux cas — seule la finesse du
cadencement change.

Un quatrième principe, tenu sur les trois pages de détail : **deux vitesses dans
un même bloc**. L'élément de repère — un numéro de semaine, un montant, un
intitulé — avance plus lentement que le texte qu'il accompagne. C'est ce
décalage qui donne la profondeur, pas une translation forte, qui se remarque et
fatigue.

`prefers-reduced-motion: reduce` coupe tout : rien ne bouge, rien ne reste
caché, les chiffres s'affichent à leur valeur finale.

Mesuré sous Chromium avec le processeur bridé à un quart de sa vitesse :
LCP 1,16 s, CLS 0, 59 images par seconde en défilement continu. Au repos en
haut de page, aucune animation ne tourne hors celles cadencées par le
défilement (qui ne consomment rien quand la page ne bouge pas) et les deux
témoins vivants voulus sur l'accueil, le point qui pulse et la bande
défilante.

## Images et photographies

Quatre photographies sur l'accueil, dans le bloc « ce qu'on opère pour vous ».
Provenance, licence et recette de traitement complètes dans
[`assets/img/README.md`](assets/img/README.md).

**Ce qu'elles illustrent, et ce qu'elles n'illustrent pas.** Aucune ne décrit un
bénéfice. Une photo ne sait pas montrer « agenda prévisible », et essayer donne
exactement l'illustration générique qu'on voulait éviter. Chacune est la
métaphore d'une chose qu'on **opère** : une maille régulière pour une base
construite ligne par ligne, des baies de serveurs pour l'infrastructure
d'envoi, la Terre de nuit pour deux canaux sur un même marché, des tours pour
un agenda qui monte.

**Le traitement est ce qui les empêche de faire pièce rapportée.** Les quatre
passent par la même rampe : désaturation totale, puis interpolation entre une
ombre graphite et une haute lumière émeraude, plus une vignette. Une photo non
traitée posée à côté des trois autres se verrait immédiatement. **Si vous en
remplacez une, repassez-la par la commande** du README des images sans changer
les valeurs.

Ce qui manque encore, par ordre d'utilité :

1. **Une photo du fondateur**, dans le cadre « qui vous parle », à la place des
   initiales `PB`. C'est la seule image qui ajouterait de la preuve plutôt que
   du climat.
2. **Des captures réelles** anonymisées, quand un vrai client existe et a donné
   son accord écrit.
3. **Des logos clients**, quand il y en aura.

**Poids.** Deux largeurs par image, WebP avec repli JPEG : 136 Ko pour les
quatre en 960, 51 Ko en 560. L'accueil passe de 250 à 402 Ko chargés. Le LCP
n'en souffre pas — les images sont sous la ligne de flottaison et ne sont
jamais l'élément le plus grand au premier rendu. Mesuré : 1 268 ms à CPU ÷4,
CLS 0.

## Fichiers

```
site/
├── index.html              accueil
├── methode.html            comment on trouve vos leads
├── collaboration.html      ce qui se passe si on signe
├── tarifs.html             ce que ça coûte, et à qui
├── mentions-legales.html   gabarit à compléter
├── confidentialite.html    gabarit à compléter
└── assets/
    ├── styles.css          feuille de style unique
    ├── fonts.css           @font-face, sous-ensembles latin et latin-ext
    ├── config.js           ← le seul fichier à modifier au quotidien
    ├── main.js             en-tête, apparitions, compteurs, calendrier
    ├── fonts/              Geist, Geist Mono, Instrument Serif (OFL 1.1)
    ├── img/                les quatre photographies traitées + leur README
    ├── og-leadcore.png     image de partage, 1200 × 630
    ├── icon-180.png        icône d'écran d'accueil
    └── leadcore-logo*.png  version web ; l’original pleine définition vit dans deck/assets/
```

## Brancher le calendrier

Tout passe par `assets/config.js` :

```js
window.LEADCORE_BOOKING = {
  provider: "cal",                                   // "cal" | "calendly" | null
  url: "https://cal.com/leadcore/diagnostic-30min",
  height: 680
};
```

Tant que `provider` vaut `null`, la page affiche le bloc de repli avec le bouton
email. Dès que `provider` et `url` sont renseignés, le calendrier s’affiche à la
place, sans autre changement.

L’adresse de contact se change au même endroit :

```js
window.LEADCORE_CONTACT = { email: "contact@leadcore.fr" };
```

Elle alimente le bouton de repli et le lien du pied de page.

## Vérifier la mise en page

`tools/verif-mise-en-page.js` contrôle le débordement horizontal sur les six
pages, à neuf largeurs, dans les deux régimes de mouvement.

```
cd site && python3 -m http.server 8391 &
SP=<dossier contenant node_modules/playwright> node ../tools/verif-mise-en-page.js
```

Il sort en code 1 dès qu'une combinaison déborde. Les trois listes se
restreignent pour isoler un cas pendant une correction :

```
PAGES=collaboration.html W=1440 MOTION=no-preference node tools/verif-mise-en-page.js
```

**Pourquoi il est écrit comme ça.** La version précédente vivait dans un dossier
temporaire, créait tous ses contextes en `reducedMotion:'reduce'` et ne défilait
jamais. Sous cette préférence, les éléments animés portent `display:none` ; sans
défilement, les révélations ne se déclenchent pas. Six pages × huit largeurs
passaient au vert pendant qu'une page débordait de 1 156 px en production.
Le script mesure donc **à chaque palier du parcours**, pas seulement à l'arrivée :
un élément qui traverse l'écran ne déborde que pendant sa translation.

Règle de travail : avant de corriger un défaut de mise en page, vérifier que le
script **échoue** dessus. Un test qui ne peut pas échouer ne teste rien.

## Voir le site en local

```bash
python3 -m http.server 8000 --directory site
# puis http://localhost:8000
```

## Avant la mise en ligne

- [x] ~~Remplacer les chiffres inventés du panneau de l'accueil.~~ **Réglé.**
      Le panneau portait une trajectoire chiffrée (34 rendez-vous, 168 k€ de
      pipeline, 39 k€ signés, 9 500 € de dépense) cohérente avec le modèle mais
      sans aucun client derrière, étiquetée « Exemple ». Il a été remplacé par
      la grille tarifaire, qui est vraie. **Plus aucun chiffre de performance
      inventé ne figure sur le site.**

      Ce qui reste chiffré est soit contractuel (1 200 €, 500 €, 200 €, 7 000 €,
      3 mois), soit issu du modèle de volumes de `MAJ-OFFRE-2026-09.md` (1 900
      contacts, 120 réponses, 12 rendez-vous). La seule mention « Exemple » qui
      subsiste est la fiche de rendez-vous de la page Méthode : elle illustre un
      format de livrable, pas un résultat.

- [ ] **Confirmer les chiffres et les règles LinkedIn** affichés sur le site
      (2 200 touches par mois, un rendez-vous honoré sur quatre, vingt
      connexions par jour et par compte), puis mettre à jour
      `docs/LEADCORE-FONCTIONNEMENT.md` et la section 5 de
      `docs/MAJ-OFFRE-2026-09.md`, qui classent encore le second canal parmi
      les sujets ouverts. Voir « Écart connu » plus haut.

- [x] ~~Renseigner `provider` et `url` dans `assets/config.js`~~ **Réglé.**
      `provider: "cal"`, `url: "https://cal.com/platon-gsniv4/30min"`. Le
      calendrier s’affiche en iframe dans `#booking-slot`. **Reste à vérifier sur
      le site déployé, depuis un téléphone** : `cal.com` est bloqué par le proxy de
      l’environnement d’agent, donc le rendu interne du calendrier n’a pas pu être
      contrôlé ici. À 320 px l’iframe ne fait que 258 px de large : si la vue mois
      est illisible, passer à `layout=column_view` sous 560 px dans `main.js` §11.
- [x] ~~Vérifier l’adresse email de contact~~ **Réglé, à titre provisoire.**
      `platon.leadcore@gmail.com`. Aucun domaine n’est rattaché au projet Vercel,
      donc `contact@leadcore.fr` ne pouvait pas exister. À remplacer par une
      adresse sur le domaine dès qu’il est en place : un seul endroit,
      `assets/config.js`.
- [ ] Compléter `mentions-legales.html` (raison sociale, SIREN, hébergeur)
- [ ] Compléter `confidentialite.html` avec un juriste (base légale, durées,
      sous-traitants). Le sujet RGPD est encore ouvert, voir
      `docs/MAJ-OFFRE-2026-09.md` section 5.
- [ ] Remplacer `https://leadcore.fr/` dans la balise `canonical` et les balises
      Open Graph si le domaine change
- [ ] Retirer `<meta name="robots" content="noindex">` des deux pages légales une
      fois qu’elles sont complètes
- [ ] Ajouter une image Open Graph au format 1200 × 630 si le partage sur
      LinkedIn compte

- [ ] **Remplacer les initiales `PB` par une photo du fondateur** dans le cadre
      « qui vous parle » de l'accueil. Voir « Images et photographies ».

## État actuel

Le site est déployé. Il n’est **pas** accessible au public, et c’est voulu.

| | |
|---|---|
| Projet Vercel | `leadcore`, équipe `platon67's projects` |
| Branche de production | `claude/gifted-hawking-wkdls6` |
| Adresse | `leadcore-rho.vercel.app` |
| Vercel Authentication | **activée** (`all_except_custom_domains`) |

Deux choses à faire avant d’ouvrir le site à vos prospects, dans cet ordre :

1. ~~**Créer l’adresse de contact.**~~ Fait : `platon.leadcore@gmail.com`, et le
   calendrier Cal.com est branché. Le visiteur a désormais deux sorties réelles.
2. **Couper Vercel Authentication**, dans *Settings → Deployment Protection*.
   Tant qu’elle est active, un visiteur tombe sur un écran de connexion Vercel.
   Elle ne s’applique pas aux domaines personnalisés : brancher `leadcore.fr`
   ouvre le site de toute façon.

Restent ensuite les deux pages légales, en gabarit et en `noindex`.

## Déploiement sur Vercel

La configuration vit dans le [`vercel.json`](../vercel.json) à la racine du
dépôt, pas ici. Il porte `outputDirectory: "site"`, les en-têtes de cache (un an
sur les fontes, dont le nom de fichier contient une empreinte de contenu) et les
en-têtes de sécurité.

Rien à régler dans le tableau de bord Vercel. En particulier, **laissez Root
Directory vide** : c’est `outputDirectory` qui désigne `site/`. Renseigner les
deux ferait chercher à Vercel `site/site/`.

Pas de build, pas de dépendance, pas de `package.json` : Vercel recopie le
contenu de `site/` tel quel.

### Cache des assets : le piège à connaître

`index.html` est servi frais à chaque visite, mais les assets l'étaient avec
`max-age=3600`. Un visiteur qui avait chargé la page avant une mise en ligne
recevait donc le **nouveau HTML avec l'ancien `styles.css`**, pendant une heure :
le balisage référençait des classes que la feuille de style ne connaissait pas
encore, et la page s'affichait à moitié nue. C'est arrivé.

Les fontes n'ont jamais eu ce problème : leur nom de fichier porte une empreinte
de contenu, donc une nouvelle version est une nouvelle URL. `styles.css`,
`main.js`, `fonts.css` et `config.js` n'en ont pas, faute de build.

Deux garde-fous sont donc en place :

1. `/assets/(.*)` est passé à `max-age=0, must-revalidate` : le navigateur
   redemande le fichier à chaque visite et reçoit un 304 de quelques centaines
   d'octets s'il n'a pas changé. `/assets/fonts/(.*)` garde son cache d'un an,
   puisque ces noms sont empreintés.
2. Les quatre fichiers sont appelés avec `?v=20260916` dans les trois pages.
   Ce jeton n'a servi qu'à vider les caches déjà pollués avant le correctif
   d'en-tête. Avec la revalidation systématique il ne sert plus à rien, mais il
   ne coûte rien non plus. **Si vous ajoutez un asset sans empreinte, vérifiez
   qu'il tombe bien sous `/assets/(.*)` et pas sous `/assets/fonts/(.*)`.**

Une fois le dépôt connecté, chaque push sur la branche de production déclenche
un déploiement, et chaque push sur une autre branche une préproduction.

### Autres hébergeurs

Netlify, Cloudflare Pages, GitHub Pages ou un dossier servi par Nginx
conviennent aussi. Le répertoire à publier est `site/`. Les en-têtes de
`vercel.json` sont propres à Vercel et devront être retranscrits.
