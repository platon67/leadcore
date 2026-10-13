# Leadcore — charte de marque

Révision 2, octobre 2026. Remplace entièrement l'identité émeraude de septembre
(Geist, Lora, `#0C1413`, `#19C78B`). **Seul le logo est conservé**, redessiné
à l'identique en géométrie exacte.

Fichiers : [`tokens.css`](tokens.css) (les valeurs), [`brandkit.html`](brandkit.html)
(la planche vivante), [`logo-lockup.svg`](logo-lockup.svg) et
[`logo-mark.svg`](logo-mark.svg) (la marque, en `currentColor`), [`fonts/`](fonts/)
(Switzer et Zodiak, auto-hébergées).

## Révision 3 (13 octobre 2026) : ce qui change après l'audit du site

Le site construit sur la révision 2 a été jugé trop sobre et peu engageant.
L'audit a relevé six causes ; la charte s'assouplit sur les points suivants,
le reste (logo, couleurs, Switzer, Zodiak, rôle de l'or) ne bouge pas.

- **Graisse** : titres et chiffres en Switzer **500**, plus en 300. Le 300 gris
  sur fond nuit paraissait délavé.
- **Texte courant** à 17 px, petit texte à 13,5 px, `--cendre` éclairci à
  `#A0A5AB` (7,6:1 sur nuit).
- **Rayons** : 8 px (contrôles), 14 px (cartes), 22 px (panneaux, photos),
  pastilles rondes. L'angle droit partout rendait le site froid.
- **Surfaces** : les blocs vivent dans des cartes éclairées, plus sur des
  filets seuls. Un halo d'or diffus derrière l'interface du héros et l'appel
  final.
- **Mise en page** : sections centrées, titre en deux tons (blanc, puis gris),
  pastille au-dessus. Plus de colonne de gauche vide.
- **Visuels** : des interfaces réalistes et lisibles (liste de rendez-vous,
  base, réponses, agenda) remplacent les motifs abstraits. Une photo couleur.

## Révision 3b (13 octobre 2026) : héros, pictogrammes, surtitres

- **Héros de l'accueil** : texte calé à gauche (pastille, titre, chapeau, deux
  boutons dessous), schéma animé à droite. Le centrage intégral est abandonné.
- **Schéma animé du héros**, trois motifs : des faisceaux (prospects → noyau
  Leadcore, gris ; noyau → agenda, or), deux orbites lentes portant des
  pictogrammes autour du logo, et un reflet doré qui fait le tour de la carte
  agenda. Environ deux réponses sur cinq ressortent en or et remplissent un
  créneau. Fond : grille de points masquée en radial. Toujours étiqueté
  « Exemple ».
- **Interface d'exemple** sous le héros : cadence accélérée (un rendez-vous
  toutes les 1,1 s, entrée en 0,6 s).
- **Chiffres clés** : quatre cartes, chacune avec compteur et micro-animation
  qui illustre le chiffre (mois de 20 jours qui s'allume, reçu présent/absent,
  frise de quatre semaines, pile 1 200 + 3 × 500).
- **Pictogrammes** : jeu maison au trait (grille 24, trait 1,4, bouts ronds,
  `currentColor`), dans `site/assets/sprite.svg`, préfixe `i-`. Or sur nuit,
  or foncé sur calque. Un pictogramme accompagne un libellé, jamais seul,
  jamais décoratif.
- **Surtitres** : la pastille bordée avec point est retirée. Un surtitre =
  pictogramme or + libellé en 500, entre deux filets dorés de 32 px qui
  s'effacent (filet de droite seul quand le texte est calé à gauche).

---

## 1. L'idée : du plomb à l'or

En anglais, *lead* désigne aussi le plomb. Le métier de Leadcore est une
transmutation : environ 1 900 contacts par mois et par client
(`MAJ-OFFRE-2026-09.md`), 120 réponses, 12 rendez-vous qualifiés. De la matière
brute, en masse, devient quelques rendez-vous qui valent de l'argent.

La charte le montre littéralement. **Tout est plomb**, des gris légèrement
froids. **L'or** ne désigne que ce qui a été transformé : le rendez-vous
qualifié, et le bouton qui permet d'en prendre un.

## 2. Parenté avec Palantir, à moitié

| Repris de Palantir (relevé sur palantir.com, octobre 2026) | Propre à Leadcore |
|---|---|
| Base monochrome, sans teinte décorative | Une matière unique, l'or, au sens fixé |
| Une grotesque suisse (Alliance), affichage en graisse légère, approche serrée | Une italique à empattements (Zodiak) pour la parole des prospects |
| Angles droits sur les boutons et les champs | Angles droits partout ; seuls l'anneau du logo et le point d'or sont ronds |
| Filets de 1 px plutôt qu'ombres et cartes | Le registre : les rendez-vous tenus comme une main courante |
| Sections alternées nuit et clair | Gris de plomb, ni noir pur ni blanc froid |
| Texte d'affichage révélé à la lecture | Mouvement de transmutation : un point parmi cent devient or |
| Vues filaires techniques | Le logo montré dans sa construction |
| Titres déclaratifs, sans adjectif | Vouvoiement, première personne, chiffres du contrat |

Pourquoi la moitié Palantir : 46,1 % des commentaires de crédibilité recueillis
par Stanford portent sur la présentation visuelle, avant le contenu. Leadcore
n'a encore ni logo client ni étude de cas chiffrée ; la forme doit porter le
sérieux que les preuves porteront plus tard. Pourquoi pas davantage : Palantir
parle à des États, Leadcore à un dirigeant de PME qui achète à un fondateur.

## 3. Logo

**Inchangé dans son dessin, redessiné dans son fichier.** Le PNG d'origine
était un scan étiré horizontalement de 7,3 % à l'export (anneau mesuré à
124,6 × 115,5 px, lettres 4 à 7 % plus larges que la fonte). La reconstruction
part des mesures, par moindres carrés sur les bords :

- **Anneau** : un vrai cercle, R 115,5 et r 79,6 (épaisseur 35,9).
- **Chevron** : bras à 51,2° de l'horizontale, épaisseur 33,05. **Son sommet
  est exactement au centre de l'anneau.**
- **Coupe** : les extrémités de l'anneau sont tranchées parallèlement aux bras
  du chevron, avec un jour constant de 14,4.
- **Mot** : Montserrat Bold (700), identifiée par recouvrement de pixels ;
  chaque lettre est replacée à son attaque mesurée, l'approche d'origine étant
  réglée à la main. Capitales centrées sur le centre de l'anneau.

Recouvrement avec l'original désétiré : 96 % sur la marque (le reste est le
flou du scan à 218 px). La marque pèse 304 octets.

Règles :
- **Couleurs** : calque sur nuit, encre sur calque. Jamais en or : l'or
  désigne un rendez-vous, pas la marque.
- **Protection** : l'épaisseur de l'anneau, sur les quatre côtés.
- **Tailles minimales** : marque seule 20 px ; verrou 96 px de large.
- **Interdits** : déformer, contourer, ombrer, dégrader, poser sur une photo.

## 4. Couleur

Proportions d'usage : nuit 52 %, calque 26 %, ardoise 10 %, surface 8 %,
**or 4 % au plus**. Contrastes WCAG 2.2 mesurés sur le fond d'usage.

| Nom | Hex | Rôle | Contraste |
|---|---|---|---|
| **Or** | `#C7A462` | bouton de RDV, RDV qualifié, focus | nuit dessus 8,3:1 |
| Or clair | `#D9BC82` | survol ; or écrit en petit sur nuit | 10,7:1 |
| Or sombre | `#7A5A22` | or écrit sur calque | 5,4:1 |
| Or lavis | `#EFE6D3` | ligne retenue sur clair | fond |
| Nuit | `#0B0C0D` | sol sombre | — |
| Surface | `#141618` | plan sur la nuit | — |
| Trait | `#25282B` | filet sur sombre | — |
| Cendre | `#8E9398` | texte secondaire sur nuit | 6,3:1 |
| Calque | `#ECECEA` | sol clair, texte sur nuit | 16,6:1 |
| Trait clair | `#CDCFCF` | filet sur clair | — |
| Ardoise | `#575C61` | texte secondaire sur calque | 5,7:1 |
| Encre | `#121416` | texte principal sur calque | 15,6:1 |

**L'or apparaît à trois endroits, nulle part ailleurs** : le bouton qui prend
un rendez-vous, un rendez-vous qualifié dans une donnée, l'anneau de focus.
C'est l'effet d'isolement (von Restorff) : un élément se remarque parce qu'il
est seul de son espèce, et les études sur les boutons mesurent un effet de
contraste, pas de teinte. Le texte nuit sur or mesure 8,3:1.

**Pourquoi un or mat.** Il porte l'idée (la transmutation) au lieu d'être
choisi pour lui-même ; il sort des deux lieux communs actuels des marques
techniques sur fond noir, le vert acide et l'orange vermillon ; et il dit le
haut de gamme sans brillance. Il est volontairement éteint : jaune désaturé,
tiré vers le bronze, jamais doré, jamais en dégradé.

**Rampe de transmutation**, pour tout graphique : `#33373B` → `#575C61` →
`#8C8573` → `#C7A462`. Le volume est plomb ; ce qui reste à la fin est or.

**États d'un rendez-vous** (registre, suivi J+30) : honoré = or (sombre sur
clair), reprogrammé = ardoise, perdu = `#9C4A3E`.

## 5. Typographie

| Rôle | Fonte | Usage |
|---|---|---|
| Tout | **Switzer** 300 / 400 / 500 | affichage, texte, petit texte, chiffres |
| La parole du prospect | **Zodiak** italique 400 | uniquement les verbatims, entre « » |

Switzer remplace Alliance, la fonte commerciale de Palantir. Comparée à
General Sans, Supreme, Mona Sans, Host Grotesk et Hanken Grotesk, c'est la
néo-grotesque suisse la plus nette en petit corps. Ses chiffres sont tabulaires
par défaut (576 unités chacun) : les colonnes de prix s'alignent sans réglage.
Licence ITF Free Font License (Fontshare), usage commercial et intégration web
autorisés. Fichiers dans `fonts/`, auto-hébergés.

**Plus de chasse fixe.** Les libellés en capitales monospace espacées étaient
le principal marqueur « fait par une IA » de la révision précédente. Le petit
texte est désormais en Switzer 500, 12,5 px, approche +0,01 em, **en casse de
phrase, jamais en capitales**.

Échelle (jetons `--t-*`) : affichage 56→176 px en 300 (−0,045 em) ; titre
44→112 ; intertitre 28→44 ; chapeau 19 ; courant 16 / 1,55 ; légende 14 ;
petit 12,5. Trois graisses : 300 pour l'affichage, 400 pour le texte, 500 pour
le petit texte et l'accent. Jamais de gras.

**Règles françaises** : `« »` avec espaces fines, espace insécable entre
nombre et unité (`1 200 €`). Switzer n'a ni l'espace fine insécable (U+202F)
ni la flèche : l'espace retombe sans dommage sur la fonte de secours, la
flèche est dessinée en SVG (filet 1,4 px, extrémités carrées).

## 6. Grille, espace, forme

- Grille de 12 colonnes, largeur maximale 1 520 px, marge 20 → 56 px.
- Chapitres : titre et numéro collés en colonne de gauche (3 colonnes), contenu
  sur les 9 autres.
- Espace en base 4 : 4, 8, 12, 16, 24, 32, 48, 72, 120, 176. Entre deux
  chapitres : 120 à 176 px.
- Rayon 0 partout. Séparation par filet de 1 px. Ni ombre, ni flou, ni carte.

## 7. Composants

- **Bouton de rendez-vous** : aplat or, texte nuit 500, 52 px de haut, la
  flèche dans sa propre case carrée séparée par un filet. Au survol, la flèche
  sort à droite et une autre entre par la gauche ; à la pression, le bouton
  s'enfonce à 98,5 %. Un seul par écran.
- **Bouton secondaire** : même dessin, filet de la couleur du texte.
- **Lien** : souligné de 1 px qui se retire vers la droite au survol, flèche
  qui avance de 4 px.
- **Champ** : souligné seul, saisie en Switzer 300 grand corps, libellé en
  petit texte au-dessus ; au focus, le filet passe en or sombre.
- **Registre** : heure · qui · verbatim en Zodiak · statut à pastille.

## 8. Mouvement

Lent à l'entrée, net à l'arrêt : `cubic-bezier(.32, .72, 0, 1)` pour ce qui se
pose, `cubic-bezier(.2, 0, 0, 1)` pour ce qui entre. Durées 140 / 320 / 640 /
1 100 ms. Seuls `transform` et `opacity` sont animés.

- **Transmutation** (signature) : une poussière de plomb frémit ; un point
  devient or, une onde part de lui, son anneau s'ouvre une fois, ouvert en bas
  comme celui du logo.
- **Lecture** (repris de Palantir) : un paragraphe s'allume mot à mot avec le
  défilement, par `animation-timeline: view()`, sans JavaScript de défilement.
- **Tracé** : les dessins au trait et la construction du logo se dessinent une
  fois à l'entrée.
- **Décompte** : un chiffre monte puis se fige, sans que sa largeur bouge.
- **Entrée** : fondu montant de 28 px, piloté par la position ; jamais garé
  invisible quand le navigateur ne sait pas le faire.

Sous `prefers-reduced-motion: reduce`, tout s'affiche dans son état final.

## 9. Images

Pas de photo d'illustration, pas d'image générée, pas de dégradé décoratif.
Le trait (objets du métier, construction du logo) et une seule photographie :
le fondateur, noir et blanc, grain conservé.

## 10. Voix

| On écrit | On n'écrit pas |
|---|---|
| Douze rendez-vous par mois. Vous payez ceux qui ont lieu. | Boostez votre croissance avec une solution performante. |
| Un prospect absent est reprogrammé une fois. | Satisfaction garantie, zéro risque ! |
| Je lis chaque réponse avant de vous la transmettre. | Notre IA révolutionnaire qualifie vos leads. |

Vouvoiement, première personne du fondateur, chiffres du contrat et jamais
d'autres. Pas de point d'exclamation, pas d'emoji.

## 11. Sources

- palantir.com, relevé dans le navigateur le 13 octobre 2026 : Alliance No.1 /
  No.2, `#1E1F2B`, `#1E2124`, `#F3F3F3`.
- [fudge.design — jetons de palantir.com](https://fudge.design/tokens/palantir.com)
- [oh-my-design — Blueprint](https://oh-my-design.kr/design-systems/palantir)
- [Von Restorff effect](https://en.wikipedia.org/wiki/Von_Restorff_effect),
  [CTA Button Psychology](https://leanexperiments.substack.com/p/cta-button-psychology-size-color)
- [Web Credibility Research](https://bizgrowthaxel.com/blog/web-credibility-research-trust-signals-service-business/)
- [Fontshare — Switzer, Zodiak](https://www.fontshare.com/) (ITF Free Font License)
