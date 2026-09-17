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

| Page | Ce qu'elle porte | Hauteur |
|---|---|---|
| `index.html` | héros, panneau de résultats, les quatre gains, trois cartes vers le détail, le fondateur, la prise de rendez-vous | 4 500 px |
| `methode.html` | la cible et les exclusions, l'approche et la qualification, le délai réel, la protection du domaine | 6 800 px |
| `collaboration.html` | les trente premiers jours, le rythme, ce qui déclenche la facture, la sortie | 6 000 px |
| `tarifs.html` | les trois lignes, le calcul sur un trimestre, à qui on dit non | 5 000 px |

L'accueil a perdu **61 %** de sa hauteur et **67 %** de ses mots. Il ne garde que
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
| Accueil · panneau de résultats | une trajectoire chiffrée sur 90 jours | « ça marche, sur le papier » |
| Accueil · ce que vous y gagnez | agenda prévisible, risque borné, zéro embauche, réponse datée | « un commercial me coûterait moins cher » |
| Méthode · la cible | la liste d'exclusion part au contrat | « vous allez démarcher mes clients » |
| Méthode · l'approche | un humain lit les 120 réponses | « c'est du spam automatisé » |
| Méthode · le délai | les vrais chiffres de production | « on va me promettre la lune » |
| Méthode · votre réputation | domaine principal hors circuit | « ça va cramer ma délivrabilité » |
| Collaboration · trente jours | le temps que ça leur coûte, semaine par semaine | « combien de temps avant de voir quelque chose » |
| Collaboration · le rythme | trente minutes par semaine, et J+30 | « je vais devoir tout piloter » |
| Collaboration · la facture | les quatre conditions, ou rien | « je vais payer des rendez-vous bidons » |
| Collaboration · la sortie | la base et les domaines vous restent | « je serai pris en otage » |
| Tarifs · les trois lignes | un seul client signé couvre le trimestre | « quel retour, vraiment » |
| Tarifs · le calcul | 8 700 € sur un trimestre, seuil à deux signatures | « je n'arrive pas à chiffrer » |
| Tarifs · pour qui | on refuse des missions | « ils prennent tout le monde » |
| Accueil · qui vous parle | un opérateur, quatre à six clients | « je serai un numéro dans une agence » |

Aucune section ne s'intitule « objections » et aucune ne pose de question
rhétorique : l'objection est traitée dans le corps du texte, avant que le
lecteur ne la formule.

Les chiffres contractuels ne bougent jamais sans passer par
[`docs/MAJ-OFFRE-2026-09.md`](../docs/MAJ-OFFRE-2026-09.md). La promesse reste
à 8-12 rendez-vous par mois ; les 15 à 20 de l'objectif interne ne figurent
nulle part sur le site.

## Système visuel

Registre : un terminal de salle de marché. Le site montre la production réelle
d'une campagne comme un carnet d'ordres montre un marché — chiffres alignés,
libellés en mono, un seul accent lumineux sur du presque noir.

**Habillages de cadre.** Les composants ne nomment jamais une couleur de marque :
ils passent par une couche de jetons sémantiques (`--bg`, `--fg`, `--fg-soft`,
`--accent`, `--rule`, `--btn-bg`…) définie en section 0 de `styles.css`. Un cadre
change d'habillage en redéfinissant ces jetons, et **rien d'autre ne bouge** :
aucun composant n'est dupliqué, aucune règle n'est écrite deux fois.

| Habillage | Fond | Texte | Accent | Cadres |
|---|---|---|---|---|
| nuit (défaut) | `#050908` | bone | `#19C78B` | héros, 01, 04, 07, pied |
| `t-jour` | `#F2F8F5` | encre | `#0F7A56` | 02, 08 |
| `t-craie` | `#E9F5F0` | encre | `#0C6B4A` | 05, prise de rendez-vous |
| `t-graphite` | `#111A17` | bone | `#19C78B` | 03, 06, fondateur |

L'alternance des fonds donne : sombre, sombre, clair, graphite, sombre, clair,
graphite, sombre, clair, graphite, clair, sombre. Le graphite existe pour
séparer deux cadres sombres sans repasser au blanc.

Un cinquième habillage, un émeraude plein en fond, a existé sur les cadres 03 et
prise de rendez-vous. Il a été retiré : l'aplat saturé sur toute la hauteur
d'un cadre écrasait la composition au lieu de la porter. L'émeraude reste un
accent, jamais un fond.

L'en-tête, la bande défilante, le héros et le pied vivent hors des sections :
ils héritent du thème nuit et ne bougent jamais. L'en-tête reste sombre et
translucide au-dessus des cadres clairs, ce qui garde un point d'ancrage de
marque pendant tout le défilement.

**Contraste.** Un audit parcourt chaque nœud de texte de la page, aplatit les
fonds semi-opaques sur leurs parents et compare au seuil WCAG AA correspondant à
la taille et à la graisse. Résultat : aucun texte sous le seuil, le plus serré
étant à 4,62:1. L'émeraude de la charte tombe à 2,04:1 sur fond clair, il ne
sert donc **jamais** au texte sur les thèmes clairs, seulement aux aplats.

**Typographie.** Geist en variable porte toute la structure : un seul fichier
pour les graisses 400 à 800, la hiérarchie se fait à la graisse et à l'approche
plutôt qu'en empilant des familles. Geist Mono pour les libellés techniques et
les chiffres. Instrument Serif en italique **uniquement** sur les mots mis en
exergue dans les titres (`<span class="ex">`) : c'est le seul contraste de
famille du site, et il perd son effet dès qu'on s'en sert ailleurs. Une page en
français ne télécharge que les trois fichiers `latin`, soit 73 Ko, contre 94 Ko
avant la refonte.

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

La jauge de progression, le remplissage du rail de la méthode et la dérive des
halos passent par `animation-timeline` quand le navigateur sait faire : la
progression est alors calculée par le compositeur, sans une ligne de
JavaScript. Firefox retombe sur un `IntersectionObserver` et une transition.

`prefers-reduced-motion: reduce` coupe tout : rien ne bouge, rien ne reste
caché, les chiffres s'affichent à leur valeur finale.

Mesuré sous Chromium avec le processeur bridé à un quart de sa vitesse :
LCP 1,2 s, CLS 0, 57 images par seconde en défilement continu.

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

## Voir le site en local

```bash
python3 -m http.server 8000 --directory site
# puis http://localhost:8000
```

## Avant la mise en ligne

- [ ] **Remplacer les chiffres du panneau de résultats de l'accueil.** Ils sont
      **inventés**. Ils sont cohérents entre eux et avec le modèle (34 rendez-vous
      sur 90 jours ≈ 11 par mois, 9 500 € de dépense sur le trimestre, 39 000 €
      signés soit 4,1 fois la dépense, premier rendez-vous à 22 jours donc en
      semaine 4), mais **aucun client ne se cache derrière**. Le bloc est étiqueté
      « Exemple » pour ne pas se lire comme un cas client, et le HTML porte un
      encadré d'avertissement autour. Remplaçables par les chiffres d'un vrai
      client, avec son accord écrit, ou à retirer.

- [ ] Renseigner `provider` et `url` dans `assets/config.js`
- [ ] Vérifier l’adresse email de contact
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

## État actuel

Le site est déployé. Il n’est **pas** accessible au public, et c’est voulu.

| | |
|---|---|
| Projet Vercel | `leadcore`, équipe `platon67's projects` |
| Branche de production | `claude/gifted-hawking-wkdls6` |
| Adresse | `leadcore-rho.vercel.app` |
| Vercel Authentication | **activée** (`all_except_custom_domains`) |

Deux choses à faire avant d’ouvrir le site à vos prospects, dans cet ordre :

1. **Créer l’adresse de contact.** `contact@leadcore.fr` n’existe pas encore.
   C’est la seule action possible pour un visiteur : sans elle, la page se
   termine sur un lien mort. L’adresse se change à un seul endroit,
   `assets/config.js`.
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
