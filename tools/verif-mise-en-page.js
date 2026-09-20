/* Leadcore — contrôle de mise en page.
   Débordement horizontal, sur les six pages, à neuf largeurs, dans les deux
   régimes de mouvement.

   Pourquoi ce script existe sous cette forme. La version précédente créait tous
   ses contextes en `reducedMotion:'reduce'` et ne défilait jamais. Deux défauts
   qui se combinaient : sous `prefers-reduced-motion`, les éléments animés sont
   masqués, et sans défilement les révélations au défilement ne se déclenchent
   pas. Six pages × huit largeurs passaient au vert pendant qu'une page débordait
   de 1 156 px en production. Un test qui ne peut pas échouer ne teste rien.

   Donc, ici, on mesure :
     - dans les deux régimes de mouvement, `no-preference` en premier ;
     - après avoir parcouru la page de haut en bas ;
     - à chaque palier du parcours, pas seulement à l'arrivée, parce qu'un
       élément qui traverse l'écran ne déborde que pendant sa translation.

   Usage :
     cd site && python3 -m http.server 8391 &
     SP=<dossier contenant node_modules/playwright> node tools/verif-mise-en-page.js
*/
const { chromium } = require((process.env.SP || '.') + '/node_modules/playwright');

const BASE   = process.env.BASE || 'http://127.0.0.1:8391/';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
/* Les trois listes se restreignent par variable d'environnement, pour isoler un
   cas pendant une correction : PAGES=collaboration.html W=1440 MOTION=no-preference */
const liste = (v, def) => (process.env[v] ? process.env[v].split(',') : def);
const PAGES  = liste('PAGES', ['index.html','methode.html','collaboration.html','tarifs.html',
                               'rendez-vous.html',
                               'mentions-legales.html','confidentialite.html']);
const W      = liste('W', ['320','390','560','768','900','1024','1280','1440','1920']).map(Number);
const MOTION = liste('MOTION', ['no-preference', 'reduce']);

/* Relevé d'un instant : la largeur de défilement du document, et les éléments
   qui sortent du cadre sans être rognés par un ancêtre. Un élément rogné ne
   déborde pas — c'est le masque qui fait son travail. */
const RELEVE = () => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  const clipped = el => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      if (/hidden|clip|auto|scroll/.test(getComputedStyle(n).overflowX)) return true;
    }
    return false;
  };
  document.querySelectorAll('main *, header *, footer *').forEach(el => {
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) return;
    if (getComputedStyle(el).position === 'fixed') return;
    if (clipped(el)) return;
    if (b.right > vw + 1.5 || b.left < -1.5) {
      out.push(el.tagName.toLowerCase() + '.' +
               (el.className || '').toString().trim().split(/\s+/)[0] +
               ' [' + Math.round(b.left) + '→' + Math.round(b.right) + ']');
    }
  });
  return { sw: document.documentElement.scrollWidth, vw, out };
};

/* Parcourt la page par paliers de 70 % de hauteur d'écran et relève à chaque
   palier. Retourne le pire relevé rencontré. */
async function parcourir(p) {
  const pire = { sw: 0, vw: 0, out: [] };
  const garder = r => {
    if (r.sw > pire.sw) { pire.sw = r.sw; pire.vw = r.vw; }
    r.out.forEach(o => { if (pire.out.indexOf(o) === -1) pire.out.push(o); });
  };

  const h = await p.evaluate(() => window.innerHeight);
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  const pas = Math.max(1, Math.round(h * 0.7));

  for (let y = 0; y < total + h; y += pas) {
    await p.evaluate(v => window.scrollTo(0, v), y);
    await p.waitForTimeout(140);
    garder(await p.evaluate(RELEVE));
  }
  /* Laisser les transitions finir, puis relever l'état posé. */
  await p.waitForTimeout(900);
  garder(await p.evaluate(RELEVE));
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(400);
  garder(await p.evaluate(RELEVE));
  return pire;
}

(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  let bad = 0;
  const errs = [];

  for (const motion of MOTION) {
    console.log('\n═══ mouvement : ' + motion + ' ═══');
    for (const pg of PAGES) {
      const ligne = [];
      for (const w of W) {
        /* Un contexte neuf par largeur : l'ouverture ne joue qu'une fois par
           session, et les classes de révélation ne se retirent jamais. Sans
           cela, seule la première largeur serait mesurée à froid. */
        const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: motion });
        const p = await ctx.newPage();
        p.on('pageerror', e => errs.push(`[${pg} ${w} ${motion}] ${e.message}`));
        p.on('console', m => { if (m.type() === 'error') errs.push(`[${pg} ${w} ${motion}] ${m.text()}`); });
        p.on('requestfailed', r => {
          if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(r.url())) return; // tiers bloqué par le proxy
          errs.push(`[${pg} ${w} ${motion}] échec ${r.url()}`);
        });

        await p.goto(BASE + pg, { waitUntil: 'load' });
        await p.evaluate(() => document.fonts.ready);
        /* L'ouverture se retire du DOM à la fin. L'attendre, sinon on mesure
           une page couverte par un voile. */
        await p.waitForFunction(() => !document.getElementById('intro'), null, { timeout: 5000 })
               .catch(() => {});
        await p.waitForTimeout(200);

        const r = await parcourir(p);
        const ok = r.sw <= r.vw + 1 && r.out.length === 0;
        if (!ok) {
          bad++;
          ligne.push(`${w}:✗+${r.sw - r.vw}px(${r.out[0] || 'doc'})`);
        } else ligne.push(`${w}:ok`);
        await ctx.close();
      }
      console.log(pg.padEnd(23) + ligne.join('  '));
    }
  }

  console.log(errs.length ? '\nERREURS:\n' + [...new Set(errs)].join('\n')
                          : '\naucune erreur console, aucune requête locale en échec');
  console.log(bad ? `\n✗ ${bad} combinaison(s) en défaut`
                  : `\n✓ aucun débordement : ${PAGES.length} pages × ${W.length} largeurs × ${MOTION.length} régimes`);
  await b.close();
  process.exit(bad ? 1 : 0);
})();
