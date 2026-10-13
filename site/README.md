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

## Révision 2 de la marque (octobre 2026)

Les sept pages sont refaites sur la charte de `brand/`. Elles chargent toutes
`assets/brand.css` (copie de `brand/tokens.css`, fontes Switzer et Zodiak
empreintées dans `assets/fonts/`), `assets/site.css` et `assets/site.js`.
Le logo et les pictogrammes vivent une seule fois dans `assets/sprite.svg`
(`<use href="assets/sprite.svg#lockup">`). `rendez-vous.html` charge en plus
`assets/rdv.js`, inchangé : sa présentation est dans `site.css`, section
« le calendrier maison ».

`styles.css`, `fonts.css`, `main.js` et les fontes Geist et Lora ne sont plus
chargés par aucune page. Les sections suivantes décrivent l'identité de
septembre et restent comme historique.

## Les quatre pages

Le site tenait sur une page unique de 11 600 px. Il est désormais en quatre
pages et la prise de rendez-vous, plus les deux pages légales.

| Page | Ce qu'elle porte | Composition | Hauteur |
|---|---|---|---|
| `index.html` | héros et boîte de réception, le prix, les quatre gains, le défilé, le fondateur, trois cartes vers le détail | les RDV qui tombent un par un + défilé illustré | 6 010 px |
| `methode.html` | schéma des deux canaux, entonnoir chiffré, six filtres, la fiche livrée, ce qui porte votre nom | schéma animé + énoncé tenu + colonne de filtrage | 8 240 px |
| `collaboration.html` | la frise des quatre semaines, le détail semaine par semaine, la balance des charges, la facture, la sortie | frise horizontale animée + balance | 7 765 px |
| `tarifs.html` | les trois montants, le chiffre à retenir, l'addition d'un trimestre, face à un recrutement, à qui ça convient | trois cartes + grand livre + comparaison | 7 190 px |
| `rendez-vous.html` | le choix du créneau, la préqualification, la confirmation | une seule colonne, l'outil occupe la page | — |

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

## Mouvement

**Deux gestes d'arrivée, et deux seulement.** Une montée neutre (`rowIn`) et une
écriture de gauche à droite pour le grand livre (`writeIn`). Il y en avait six,
qui faisaient tous « un bloc arrive » : six variantes d'un même geste ne
produisent pas six sens, elles produisent du bruit. Ce qui différencie deux
entrées, c'est leur **plage** de déclenchement, pas une image-clé de plus.

**Les boucles.** Une animation ne hiérarchise que si elle est seule à bouger.
Méthode en faisait tourner onze en même temps — trois comètes, sept battements
de touches, un souffle sur la case de sortie. Il en reste trois, les comètes,
qui expliquent le trajet. Mesuré au pire moment du défilement : accueil 1,
méthode 3, collaboration 1, tarifs 0.

**La bande défilante a été supprimée.** Motif générique et daté, illisible en
mouvement, qui répétait des chiffres présents deux écrans plus bas et tournait
en boucle en permanence.

## Le bouton de prise de rendez-vous

Tout le site existe pour amener là, et c'est **le seul endroit où le système a
le droit d'être rompu**. Partout ailleurs : rayons de 4, 10 ou 16, aplats, deux
couleurs. Ici : une capsule, une matière irisée, un liseré qui tourne. La seule
chose ronde du site est le bouton qui prend un rendez-vous.

Un seul objet, `.cta-rdv`, en deux tailles. **Seize boutons.**

**Relevé image par image sur les références du propriétaire.** Quatre principes,
tous tirés des deux maquettes de tête :

1. la matière **remplit** la forme et se déforme vite. Elle ne se pose pas au
   fond comme un liquide au repos — c'était l'erreur de la version précédente.
2. les teintes restent **franches** côte à côte : lime contre émeraude contre
   violet. Trop de flou et tout se mélange en turquoise.
3. un **liseré prismatique tourne** autour du contour. C'est lui qui attire
   l'œil de loin ; la matière, c'est ce qu'on voit une fois venu.
4. un **pictogramme vif** à gauche du libellé, qui bat avec le reste.

Cinq masses, lime en tête, cycle de 4 s. Liseré de 2,4 px, halo serré. Le liseré passe par une propriété
enregistrée (`@property --ang`) : c'est le seul moyen d'animer l'angle d'un
dégradé conique. Ce n'est pas au compositeur, contrairement au reste, mais la
surface repeinte est celle d'un bouton. Sans `@property`, l'angle reste fixe et
le liseré devient un dégradé statique : le bouton reste correct.

**La lisibilité ne tient pas à un voile général.** Un voile assez fort pour
protéger le texte étouffe la matière. Ce qui marche, et que la référence fait
avec sa flèche blanche sur une bulle : un halo sombre **serré** sous la bande du
texte, plus une ombre portée sur le glyphe lui-même. Mesuré sur 40 instants du
cycle, ombre désactivée : **6,4:1** héros, **7,4:1** en-tête, **11,4:1**
contextuel.

Le bouton d'en-tête est le plus petit du lot, 107 × 44 : le liseré de 2,4 px y
mange l'intérieur et la matière remonte d'autant sous le texte. Ses masses
perdent donc un cran d'opacité ; les sorties contextuelles, deux à trois fois
plus larges, gardent la leur.

Le pictogramme est une **caméra** : il dit ce qui va se passer, un appel en
visio. Tracé au trait sur la grille de 24, comme les quatorze autres du site —
c'est le seul endroit où le bouton reste dans le langage de la maison.

Sous `prefers-reduced-motion`, tout s'arrête.

### Trois défauts trouvés par la mesure

- Le libellé du bouton d'en-tête était **noir sur une capsule noire**, à 1:1.
  `.nav a.btn-pri{color:var(--btn-fg)}` pèse 0,2,1 et l'emportait ; ce
  presque-noir avait du sens tant que le bouton était un aplat émeraude.
- Le bloom respire en `scale()` et déborde de 10 px de chaque côté. Sur
  téléphone un bouton occupe toute la colonne : la respiration passe sur la
  seule verticale. Défaut **transitoire**, invisible en mouvement réduit —
  trouvé parce que le harnais mesure à chaque palier du parcours.
- La marge `.nav .btn{margin-left:12px}` s'appliquait au bouton *à l'intérieur*
  de son enveloppe : le biseau débordait de 12 px en gris.

**Les onze sorties contextuelles sont calées à droite.** Une sortie ferme le
bloc qu'elle suit, donc elle se pose sur son bord de fin : sous un ledger dont
tous les montants sont à droite, sous un bento qui va d'un bord à l'autre, le
bouton calé à gauche pendait à l'opposé de là où le regard arrive. Mesuré sur
les quatre pages avant de généraliser : les onze paragraphes de sortie
partagent déjà le bord droit du bloc qui les précède, à une exception près —
celle de `#fit`, dont le bento sortait de la colonne sans que sa sortie le
suive, 240 px d'écart. Les deux sections de tarifs qui posent un bloc hors
colonne (`#lignes`, `#fit`) sortent donc leur `.cta-ctx` avec lui ; partout
ailleurs `text-align:right` suffit.

Effet de bord, mesuré : le halo du bouton déborde de 8 % de sa largeur. À
gauche il tombait dans la gouttière ; à droite il passe le bord du document —
25 px à 768, 7 px à 1 280. `.sec{overflow-x:clip}` écrête au niveau de la
section, qui fait la largeur de la fenêtre : au large rien n'est coupé, à
l'étroit le halo s'arrête au bord de l'écran. `clip` et non `hidden` — il
laisse l'axe vertical en `visible` et ne crée pas de conteneur de défilement,
donc les révélations et le sommaire collant de Méthode sont intacts (vérifié :
hauteur de document identique avec et sans, et le collant s'accroche à ses
122 px dans les deux cas).

Le harnais de contraste a dû être corrigé deux fois : `getComputedStyle` ne sait
pas aplatir un fond en dégradé, et je lui passais des coordonnées de fenêtre là
où il attendait des coordonnées de page. Il re-mesure désormais au pixel, par
poignée d'élément, sur la bande du texte.

## Densité et cadres

**La carte est réservée aux objets.** Une fiche, un agenda, un arrêt de
frise, une case de schéma : ce sont des choses. Le texte courant et les listes
reviennent au fil du fond, avec un filet à gauche quand une séparation est
nécessaire — un filet dit « c'est lié à ce qui précède » là où un cadre dit
« c'est une chose à part ». Si tout est figure, il n'y a plus de fond.
Boîtes bordées par page : accueil 13, méthode 17, collaboration 12, tarifs 6 —
contre 17, 30, 17 et 10 avant.

**La densité varie avec la nature du contenu.** Une plaque porte de la donnée et
se lit d'un coup d'œil : elle est serrée. Une section de prose se lit ligne à
ligne : elle respire. C'est le seul endroit où le pas change, et il change pour
une raison.

## Une seule couleur, et jamais sur un contenant

L'émeraude ne borde plus rien : elle vit sur les nombres, les pictogrammes et
les boutons. Trois dispositifs ont été retirés pour ça, parce qu'ils disaient
« important » en le coloriant :

| Retiré | Ce qui porte l'accent maintenant |
|---|---|
| le trait de tête émeraude des quatre cellules de l'accueil | le nombre, et le filet gauche que chaque cellule avait déjà |
| le filet émeraude et le lavis vert de `.pad.hot` | une plaque très légèrement en creux, arête claire en haut |
| le filet émeraude de la troisième ligne de prix | le montant, seul en émeraude dans une rangée de trois |

Un filet accentué de 2 px en haut d'une carte est la signature la plus
reconnaissable d'une interface produite sans intention ; ici il faisait en plus
le travail du filet gauche une seconde fois, en couleur.

**L'ambre a disparu.** Les trois bandeaux — le seuil, le temps demandé, la
nuance sur le recrutement — étaient des cadres ambrés à pictogramme : la
grammaire d'un message d'erreur de navigateur, sur les passages les plus
engageants du site. Ils sont devenus des apartés : un filet, un intitulé qui
nomme le propos, et le texte une taille au-dessus du corps. Le jeton
`--amber` ne sert plus qu'aux blocs à faire des pages légales.

## Le panneau du héros : la boîte de réception

La place la plus visible du site a porté une trajectoire chiffrée étiquetée
« Exemple » — donc inventée —, puis la grille tarifaire, puis un agenda qui se
remplissait, puis une machine rendue en 3D. Elle porte maintenant la chose la
plus simple, et la seule que le lecteur achète : **des rendez-vous qui tombent
un par un dans une boîte, avec la fiche du prospect écrite dedans.**

| | |
|---|---|
| `Mardi 10:00` · Email | Dirigeant · Bureau d'études thermiques, 25 salariés — « On répond aux appels d'offres, on ne va jamais chercher. » |
| `Mercredi 14:30` · LinkedIn | Directrice commerciale · Éditeur SaaS B2B, 40 à 80 salariés — « Deux commerciaux recrutés, pas assez de rendez-vous à leur donner. » |
| `Jeudi 09:00` · Email | Directeur général · ESN, 120 salariés — « Notre croissance vient du bouche-à-oreille, elle plafonne. » |
| `Vendredi 11:30` · LinkedIn | Directeur associé · Cabinet de conseil RH, 12 salariés — « On perd des affaires faute d'être consultés en amont. » |

**Le panneau n'illustre pas le produit, il le montre.** La différence est
entière : une machine, un entonnoir ou un schéma demandent au lecteur de faire
la traduction lui-même. Quatre lignes de boîte de réception, avec un créneau,
un titre, une taille d'entreprise et une phrase du prospect, ne demandent
rien — c'est exactement ce qu'il recevra.

D'où deux règles sur le contenu :

- **Le texte est réel et tenu.** Les quatre lignes reprennent des cibles
  décrites dans [`docs/LEADCORE-FONCTIONNEMENT.md`](../docs/LEADCORE-FONCTIONNEMENT.md),
  les deux canaux sont ceux du dossier, et le pied rappelle les trois critères
  contractuels. Si un critère bouge dans le dossier, ces quatre lignes bougent
  avec lui. Aucun chiffre n'est inventé pour faire joli.
- **Le panneau n'est pas `aria-hidden`.** Tout ce qu'il montre est du texte, et
  ce texte est le meilleur résumé du produit qui existe sur la page : le cacher
  à un lecteur d'écran serait absurde.

Le prix n'a pas disparu de l'accueil : il est dans la carte « 03 · Combien », et
toute la page Tarifs lui est consacrée.

### La boucle

Un cycle de **12 s**, en CSS, sans une ligne de JavaScript.

| Moment | Ce qui se passe |
|---|---|
| 0,30 · 0,90 · 1,50 · 2,10 s | les quatre fiches tombent, une toutes les 0,6 s |
| à chaque arrivée | le liseré gauche s'écrit de haut en bas, un voile émeraude passe et s'éteint |
| 4 s après | le liseré refroidit : cette fiche n'est plus la dernière arrivée |
| 2,4 → 9,6 s | la boîte est pleine, et se lit — 7,2 s |
| 9,60 · 9,80 · 10,00 · 10,20 s | elle se vide, de haut en bas, quatre fois plus vite qu'elle ne s'est remplie |
| 10,5 → 12,0 s | **vide** |

**La boîte se vide entièrement avant de se remplir**, et c'est le point qui a
demandé de tout réécrire. Tant que les quatre fiches partageaient les mêmes
images-clés et se décalaient par `animation-delay`, leur sortie se décalait du
même pas que leur entrée : la première revenait avant que la quatrième soit
partie, et la boîte n'était jamais vide. Les entrées sont espacées de 0,6 s, les
sorties de 0,2 s — deux cadences différentes, donc quatre jeux d'images-clés
écrits en dur. Un pourcentage de `@keyframes` n'accepte pas de variable : c'est
le seul endroit de la feuille où l'on se répète, et les valeurs sont calculées
en tête de section, qui fait foi.

Le liseré et le voile, eux, n'ont qu'un seul jeu chacun et se décalent par
`animation-delay` : ils ne font rien à la sortie, et l'opacité de la fiche qui
les porte les emmène avec elle.

**Les hauteurs sont réservées dès le départ.** Une fiche qui apparaîtrait en
poussant les autres vers le bas ferait une mise en page par image, et ferait
sauter le pied du panneau quatre fois par cycle. Elles se révèlent en place :
tout est en `transform` et `opacity`.

**Le voile d'arrivée est un aplat à opacité nulle**, monté puis éteint. La
couleur est fixe, c'est l'opacité qui bouge, donc le compositeur suffit — animer
le fond lui-même repeindrait la fiche à chaque image.

### Ce que porte une fiche, et ce qu'elle ne porte pas

Quatre lignes : le créneau et le canal avec son rang de touche ; le titre du
contact, son entreprise, sa taille et sa ville ; sa phrase, citée ; les trois
critères contractuels, cochés.

Ce qui n'y est **pas** : aucun nom propre, aucun chiffre d'affaires, aucun
score de qualification. Ce qui n'est pas vérifiable n'est pas écrit — c'est
exactement ce qui avait coulé le tout premier panneau du héros, une trajectoire
chiffrée étiquetée « Exemple ». Une fiche qui montre le *format* du livrable
informe ; une fiche qui invente des performances ment.

La durée est écrite **une fois**, au pied. Elle est la même pour les quatre, et
quatre fois « 30 min, en visio » prenait 90 px de haut pour ne rien dire de
plus. La citation est au corps du texte et non au pas au-dessus : Lora tient
très bien à 16 px, et le pas supérieur coûtait une deuxième ligne sur chacune
des quatre fiches.

Panneau : **729 px** à 1 440, ce qui laisse le bouton de prise de rendez-vous à
650 px du haut — au-dessus de la ligne de flottaison d'un portable.

### Ce qui a été essayé avant, et pourquoi c'est parti

| Essai | Pourquoi il est tombé |
|---|---|
| l'agenda qui se remplit, en CSS | il montrait **un** rendez-vous ; le produit s'achète au volume, et une semaine pleine le dit mieux |
| la machine en 3D — trémie, foyer, socle, poussière | belle, sobre, et **muette**. Elle demandait au lecteur de traduire une métaphore industrielle en promesse commerciale. Un canevas, un rendu logiciel et neuf cents lignes pour dire moins que quatre lignes de texte |

Le rendu 3D tenait ses 60 i/s à CPU ÷ 4 et n'avait aucune dépendance. Ce n'est
pas la technique qui a échoué, c'est le parti : **sur un panneau d'accroche, la
chose montrée bat la chose évoquée.**

### En mouvement réduit, et sans JavaScript

Les deux cas donnent la même image, et c'est la bonne : **la boîte pleine**.
Les règles d'apparition sont préfixées par `.js`, donc sans JavaScript les
quatre lignes sont là d'emblée ; en mouvement réduit l'animation est coupée et
le liseré de la première ligne reste allumé. Figée à vide, la boîte ne dirait
rien du tout.

### Le fond du héros

Trois halos radiaux flottaient derrière le titre, plus un trait qui balayait la
page au chargement. Ils ne disaient rien : trois taches vertes floues sur du
noir sont la signature d'un fond posé parce qu'un héros « doit » en avoir un.

Le fond dit maintenant la même chose que le reste du site — une salle de
mesure. Trois couches, toutes statiques, toutes peintes une fois : une réglure
horizontale au pas de 74 px, masquée en radial autour du panneau et éteinte
sous le titre ; une braise émeraude derrière le panneau, à 6 % au plus fort ;
une extinction vers le bas qui rend le sol au noir avant la section des prix.
Le héros ne repeint plus après la première image.

## Quatre schémas à la place de la prose

Quatre passages demandaient au lecteur de reconstruire une structure dans sa
tête pour s'en servir. Ils sont dessinés.

| Schéma | Où | Ce qu'il remplace | Ce que le dessin dit que la phrase ne disait pas |
|---|---|---|---|
| `.vs` empilé | Tarifs · face à un recrutement | trois totaux et leurs légendes | que 6 000 des 8 700 € ne courent que si on livre, alors que les 11 100 € d'un salaire sont dus en entier |
| `.phases` | Tarifs · la durée | l'énumération des trois durées, écrite deux fois | que les trois phases sont inégales, et pourquoi trois mois ne se raccourcissent pas |
| `.relais` | Collaboration · le cinquième mois | deux paragraphes sur l'épuisement des segments | que la préparation du segment suivant **recouvre** la fin du précédent — sans recouvrement, il y a un trou |
| `.arbre` | Collaboration · la facture | une puce et un paragraphe | qu'il y a trois branches et quatre issues, et laquelle est la vôtre |

**L'empilement a supprimé une ligne de données.** La troisième barre de la
comparaison, « votre plancher à 2 700 € », était la somme des deux lignes
fixes : une fois le fixe et le variable séparés dans la barre de Leadcore,
c'est le segment plein qu'on lit directement.

**Le cinquième schéma prévu n'a pas été construit**, parce qu'il existait
déjà. Les deux canaux parallèles sont dessinés depuis le début par le `.flow`
en tête de Méthode, et son repli — deux entrées, une sortie — y est structurel.
Ce qui manquait n'était pas un dessin mais une coupe : la même idée était
énoncée trois fois sur la page. Il n'en reste qu'une, dans la légende, sous le
schéma qui la montre.

**Le gain en signes est modeste : −623 sur les quatre pages, soit −2,2 %**,
là où l'audit en annonçait 2 300. L'écart est entier dans les schémas
eux-mêmes : un dessin porte ses intitulés, ses échelles et sa légende, et ça
reprend la moitié de ce que la prose rendait. Ce n'est pas le nombre de signes
qui change, c'est qu'on lit une branche au lieu d'en reconstruire trois.


## Le discours

La page est construite sur ce que le client **gagne**, pas sur la façon dont on
produit. Chaque cadre désamorce au passage une objection, sans jamais la nommer :

| Page · cadre | Ce qu'il vend | L'objection qu'il tue |
|---|---|---|
| Accueil · héros | leurs commerciaux closent au lieu de prospecter | — |
| Accueil · la boîte de réception | quatre RDV d'une semaine, avec le titre, la taille et la phrase du prospect | « qu'est-ce que je reçois, concrètement » |
| Accueil · le seuil | le modèle tient à partir de 7 000 € de valeur client | « ils prennent tout le monde » |
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
| Tarifs · face à un recrutement | 8 700 € contre 11 100 €, dont 6 000 qui ne courent que si on livre | « je préfère recruter » |
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

Ce qui le remplace, en section 24 de `styles.css`, tient en **deux** couches
fixées au cadre, donc lues comme une lumière d'ambiance et non comme un décor
qui défile — le sol et le grain.

Il y en avait quatre. **La signature lumineuse** — une géométrie de lumière
différente par page, dôme, biseau, strates, voûte — a été retirée le
19 septembre 2026 après mesure : les quatre pages s'échantillonnaient à
l'identique. Après suppression, elles donnent 14, 16 et 13 sur 255 aux mêmes
trois hauteurs, exactement ce qu'elles donnaient avec. Trente lignes de feuille
et un paragraphe de documentation pour un résultat nul.

Ce qui distingue une page d'une autre est désormais **sa composition**, en
section 37 : un geste par page, et un seul. Accueil large et asymétrique ;
Méthode avec un résumé pleine largeur puis une colonne de travail resserrée à
1 100 px et calée à gauche ; Collaboration en trame horizontale, chapeau à
gauche et contenu à droite ; Tarifs en colonne étroite de 880 px, sections
séparées au filet — un devis, pas une page de site, mais les blocs tabulaires
en sortent (les trois lignes, le ratio, la comparaison), parce qu'un tableau de
prix n'a pas à se lire à la mesure d'un paragraphe. Au-delà de 1 100 px le
ratio se recompose en trois bandes pleine largeur et ses trente carrés passent
sur une seule rangée. Chaque page porte aussi en
filigrane, derrière son bandeau de tête, un grand pictogramme qui lui est
propre.

Les couches restantes :

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
et une arête, en trois usages et trois seulement : filet gauche pour ce qui
accompagne la prose (`.pad.lite`), filet gauche aussi pour les cellules d'une
rangée — quatre cellules séparées par des filets, c'est un tableau — et plaque
en creux (`.pad.hot`) pour le bloc isolé qui porte une donnée. Aucun des trois
n'emploie la couleur. Un quatrième poids donnerait une page en damier.

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

L'en-tête, le héros et le pied vivent hors des sections.

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
les chiffres. **Lora** en italique **uniquement** sur les mots mis en exergue
dans les titres (`<span class="ex">`) et sur les phrases citées d'un prospect :
c'est le seul contraste de famille du site, et il perd son effet dès qu'on s'en
sert ailleurs. Une page en français ne télécharge que les trois fichiers
`latin`, soit 75 Ko.

**Lora a remplacé Instrument Serif**, qui tenait la même place. Instrument
Serif est une fonte d'affichage : forte modulation, contrepoinçons étroits,
approches serrées. À 52 px sur un titre elle est superbe ; à 19 px sur une
phrase entière — ce que la boîte de réception du héros lui demandait — elle se
lit mal et fatigue. Lora est une fonte de labeur dont l'italique descend de la
calligraphie au pinceau : le caractère écrit à la main reste, la lisibilité
vient avec.

Deux réglages ont suivi la substitution, et aucun des deux n'était facultatif :

- `.ex` portait `font-size:1.08em`, parce qu'Instrument Serif avait une petite
  hauteur d'x et pesait moins que le Geist d'à côté. La hauteur d'x de Lora est
  normale : le rehaussement est retiré.
- **L'italique de Lora est 30 % plus large.** Sur le titre de l'accueil, dont
  les lignes sont en `nowrap` derrière un masque, « Exclusifs. Payés à l'unité. »
  passait de 671 à 874 px pour une colonne de 706 : elle se faisait couper.
  `.hero h1 .ex` descend donc à `.84em`, ce qui la ramène à 683 px — neuf de
  plus que la première ligne. Les deux lignes tombent maintenant au même endroit
  à droite, ce qui vaut mieux que ce qu'on avait. Vérifié de 340 à 1 920 px.

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

**Il n'y en a plus.** Les quatre photographies de l'accueil ont été retirées le
19 septembre 2026. Elles n'apportaient aucune information : une photo ne sait
pas montrer « agenda prévisible », et le traitement en bichromie les intégrait
visuellement sans leur donner de fonction. Le cadre qu'elles occupaient porte
maintenant **la fiche de rendez-vous**, qui est l'objet que le client reçoit
vraiment — la seule chose sur ce site qui ressemble à une preuve.

**La recette de traitement est conservée** dans
[`assets/img/README.md`](assets/img/README.md). Elle servira aux vraies images :
une photographie du fondateur, des captures anonymisées quand un client
existera. Toute image ajoutée doit y passer, sinon elle se verra comme une
pièce rapportée.

**Le portrait du fondateur.** Le cadre est prêt dans `index.html`, section
`#equipe` : déposer `assets/portrait.jpg` (carré, 1 200 px minimum) et
décommenter la balise `<img>`. Le carré fait 160 px, les initiales `PB`
l'occupent en attendant, et rien d'autre ne bouge dans la page.

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
    ├── fonts/              Geist, Geist Mono (Vercel), Lora (Cyreal) — OFL 1.1
    ├── img/                les quatre photographies traitées + leur README
    ├── og-leadcore.png     image de partage, 1200 × 630
    ├── icon-180.png        icône d'écran d'accueil
    └── leadcore-logo*.png  version web ; l’original pleine définition vit dans deck/assets/
```

## La prise de rendez-vous

Elle est écrite ici, dans `assets/rdv.js`, et ne dépend d'aucun serveur.
L'iframe de Cal posait sa propre interface au milieu de la page — d'autres
polices, d'autres rayons, un autre noir, et un cadre qu'on ne peut pas
toucher. Il ne reste d'elle que les données.

**Aucune clé, aucune fonction, aucun secret.** Les deux points d'entrée de
l'API publique de Cal répondent en `access-control-allow-origin: *`, et aucun
des deux ne demande d'authentification pour un type de rendez-vous public.
Vérifié par préflight : `access-control-allow-methods` contient `POST`,
`access-control-allow-headers` contient `cal-api-version` et `Content-Type`.

| Appel | En-tête de version | Ce qu'il rend |
|---|---|---|
| `GET api.cal.com/v2/slots` | `2024-09-04` | `{ data: { "2026-09-22": [ { start }, … ] } }` |
| `POST api.cal.com/v2/bookings` | `2024-08-13` | la réservation créée |

Le corps du POST : `start`, `eventTypeId`, `attendee { name, email, timeZone,
language }`, et `bookingFieldsResponses { notes }` quand il y a quelque chose
à mettre dedans. Le type de rendez-vous n'a pas de champ « société » : elle est
préfixée aux notes.

**Le fuseau est celui du visiteur**, pas le nôtre. C'est ce que Cal attend pour
découper les créneaux, et c'est ce qu'il faut afficher : un horaire sans fuseau
est une cause d'absence au rendez-vous. Il est écrit dans l'en-tête du panneau.

**Elle a sa page**, `rendez-vous.html`, et les seize boutons du site y mènent.
Elle vivait en bas de chaque page, en quatre exemplaires : le même outil monté
quatre fois, et un visiteur qui cliquait « Prendre RDV » se retrouvait à
défiler jusqu'au bas de la page où il était déjà. Les quatre sections ont été
retirées.

**Un questionnaire s'intercale entre le créneau et la confirmation.** Cinq
questions, une par écran, qui avancent d'elles-mêmes au clic — aucun champ à
remplir avant le dernier écran, où il n'en reste que trois. Empilées dans un
formulaire, ces cinq questions se liraient comme une corvée ; en cinq gestes
elles se traversent en dix secondes, et la barre de progression dit dès le
premier écran que c'est court. Les réponses restent relisables en jetons au
dernier écran, et un clic dessus ramène à la question.

Il passe **avant** le POST, pas après, pour une raison technique : les
réponses partent dans les notes de la réservation, et l'API v2 de Cal ne sait
pas ajouter de notes à une réservation déjà créée — elle sait replanifier,
annuler, confirmer, refuser, changer le lieu, pas éditer les réponses.
Récoltées après, elles n'auraient nulle part où aller.

La question de la valeur client est le critère de sélection du site. Une
réponse sous le seuil **n'arrête rien et ne déclenche aucun avertissement** :
la page Tarifs promet qu'on en parle pendant l'appel, c'est donc pendant
l'appel qu'on en parle. Elle part dans les notes, et l'appel est préparé.

**Dix états, tous à l'écran** : chargement, échec réseau, aucun créneau sur
l'horizon, choix du jour, choix de l'heure, formulaire, champ manquant, envoi
en cours, créneau pris entre-temps, confirmation. Le créneau pris entre-temps
est le cas qui arrive vraiment — quelqu'un réserve pendant qu'on remplit le
formulaire — et il recharge les disponibilités au lieu de laisser réessayer
dans le vide.

**Trois replis, dans cet ordre.** Sans `eventTypeId` dans `config.js`, rien ne
se monte et le bloc écrit dans le HTML reste affiché. Sans `fetch` ni
`Element.closest`, pareil. Si l'API ne répond pas, le panneau affiche le lien
vers la page Cal et l'adresse email.

Ce qu'il faut changer si le compte Cal change : `eventTypeId` dans
`assets/config.js`. On le retrouve avec

    curl "https://api.cal.com/v2/event-types?username=<compte>" \
         -H "cal-api-version: 2024-06-14"

Un piège rencontré en le construisant : la bande de jours est une rangée flex
d'une vingtaine de boutons, et sans `minmax(0,1fr)` sur la grille parente elle
lui impose sa largeur intrinsèque. Mesuré : la grille des heures passait à
quatorze colonnes et sortait du cadre. C'est le `min-width:auto` des éléments
de grille, le même piège que sur les éléments flex.

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

`tools/verif-contraste.js` fait la même chose pour le contraste WCAG AA, dans
les deux régimes et après parcours, pour la même raison : un texte jamais
révélé n'est jamais mesuré.

`tools/captures.js` et `tools/compare.js` mesurent ce qu'un changement de
feuille **déplace** — hauteur de page, par page et par largeur — au lieu de
l'estimer :

```
SP=<…> node tools/captures.js /tmp/avant
… modifications …
SP=<…> node tools/captures.js /tmp/apres
node tools/compare.js /tmp/avant /tmp/apres
```

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

- [ ] **Déposer la photo du fondateur.** `assets/portrait.jpg`, carrée,
      1 200 px minimum, puis décommenter la balise `<img>` dans `#equipe`. Le
      cadre est déjà en place et dimensionné : rien d'autre ne bouge. Sans
      logo client et sans cas chiffré, l'incarnation est le seul transfert de
      confiance disponible — c'est l'élément à plus fort rendement de la liste.
- [ ] **Compléter le bloc fondateur** avec ce qu'il faisait avant Leadcore et
      pourquoi il fait ça, en une ligne chacun, à la première personne. Ces
      deux phrases n'existent nulle part dans le dépôt et ne peuvent pas être
      inventées.

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
