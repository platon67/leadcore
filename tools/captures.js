/* Leadcore — captures de référence, pour mesurer ce qu'un changement déplace.
   Usage : SP=<...> node tools/captures.js <dossier de sortie>
   Puis : node tools/compare.js <avant> <après> */
const { chromium } = require((process.env.SP || '.') + '/node_modules/playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://127.0.0.1:8391/';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = (process.env.PAGES || 'index.html,methode.html,collaboration.html,tarifs.html').split(',');
const W = (process.env.W || '1440,390').split(',').map(Number);
const out = process.argv[2];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: CHROME });
  for (const w of W) for (const pg of PAGES) {
    /* mouvement réduit : on compare des pages posées, pas des animations en
       cours — sinon le bruit de l'animation noie la différence qu'on cherche */
    const ctx = await b.newContext({ viewport:{width:w,height:1000}, reducedMotion:'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + pg + '?utm_source=t', { waitUntil:'load' });
    await p.evaluate(() => document.fonts.ready);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y=0; y<H; y+=800) { await p.evaluate(v=>scrollTo(0,v), y); await p.waitForTimeout(40); }
    await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/${pg.replace('.html','')}-${w}.png`, fullPage:true });
    const h = await p.evaluate(()=>document.documentElement.scrollHeight);
    fs.appendFileSync(`${out}/hauteurs.txt`, `${pg} ${w} ${h}\n`);
    await ctx.close();
  }
  await b.close();
  console.log('captures → ' + out);
})();
