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

## Système visuel

Registre : un terminal de salle de marché. Le site montre la production réelle
d'une campagne comme un carnet d'ordres montre un marché — chiffres alignés,
libellés en mono, un seul accent lumineux sur du presque noir.

**Typographie.** Geist en variable porte toute la structure : un seul fichier
pour les graisses 400 à 800, la hiérarchie se fait à la graisse et à l'approche
plutôt qu'en empilant des familles. Geist Mono pour les libellés techniques et
les chiffres. Instrument Serif en italique **uniquement** sur les mots mis en
exergue dans les titres (`<span class="ex">`) : c'est le seul contraste de
famille du site, et il perd son effet dès qu'on s'en sert ailleurs. Une page en
français ne télécharge que les trois fichiers `latin`, soit 73 Ko, contre 94 Ko
avant la refonte.

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
├── index.html              page unique
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

Une fois le dépôt connecté, chaque push sur la branche de production déclenche
un déploiement, et chaque push sur une autre branche une préproduction.

### Autres hébergeurs

Netlify, Cloudflare Pages, GitHub Pages ou un dossier servi par Nginx
conviennent aussi. Le répertoire à publier est `site/`. Les en-têtes de
`vercel.json` sont propres à Vercel et devront être retranscrits.
