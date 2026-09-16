# Site vitrine Leadcore

Site statique : HTML, CSS et un fichier JavaScript. Pas de build, pas de
dépendance à installer. Deux fonctions, dans cet ordre :

1. **Informer et rassurer** le prospect qui arrive depuis un email sortant :
   méthode, volumes réels de production, critères de qualification, prix.
2. **Faire prendre un rendez-vous.**

Le contenu vient de [`docs/LEADCORE-FONCTIONNEMENT.md`](../docs/LEADCORE-FONCTIONNEMENT.md)
et de [`docs/MAJ-OFFRE-2026-09.md`](../docs/MAJ-OFFRE-2026-09.md). Le système
visuel est celui du deck (`deck/index.html`) : mêmes couleurs, mêmes fontes.

## Fichiers

```
site/
├── index.html              page unique
├── mentions-legales.html   gabarit à compléter
├── confidentialite.html    gabarit à compléter
└── assets/
    ├── styles.css          feuille de style unique
    ├── config.js           ← le seul fichier à modifier au quotidien
    ├── main.js             menu, apparitions, montage du calendrier
    └── leadcore-logo*.png
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
