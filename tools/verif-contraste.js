/* Leadcore — contrôle de contraste, WCAG AA.

   Même leçon que tools/verif-mise-en-page.js : la version précédente ne
   tournait qu'en `reducedMotion:'reduce'` et ne défilait jamais. Or sous
   mouvement par défaut un texte peut être peint à une opacité intermédiaire
   pendant sa révélation, et un texte jamais révélé n'est jamais mesuré. On
   parcourt donc la page, et on mesure dans les deux régimes.

   Usage : cd site && python3 -m http.server 8391 &
           SP=<...> node tools/verif-contraste.js */
const { chromium } = require((process.env.SP || '.') + '/node_modules/playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8391/';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const liste = (v, def) => (process.env[v] ? process.env[v].split(',') : def);
const PAGES = liste('PAGES', ['index.html','methode.html','collaboration.html','tarifs.html','mentions-legales.html','confidentialite.html']);
const W = liste('W', ['1440','390']).map(Number);
const MOTION = liste('MOTION', ['no-preference','reduce']);
(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  let total = 0;
  for (const motion of MOTION) {
  console.log('\n\u2550\u2550\u2550 mouvement : ' + motion + ' \u2550\u2550\u2550');
  for (const w of W) {
  for (const pg of PAGES) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: motion });
  const p = await ctx.newPage();
  await p.goto(BASE + pg + '?utm_source=t', { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => !document.getElementById('intro'), null, { timeout: 5000 }).catch(() => {});
  /* parcourir : ce qui n'a jamais été révélé n'a jamais été mesuré */
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(60); }
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(900);

  const bad = await p.evaluate(() => {
    const srgb = v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    const lum = ([r, g, bl]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(bl / 255);
    const parse = c => (c.match(/[\d.]+/g) || []).map(Number);
    const over = (fg, bg) => {          // aplatit une couleur semi-opaque sur son fond
      const a = fg.length > 3 ? fg[3] : 1;
      return [0, 1, 2].map(i => fg[i] * a + bg[i] * (1 - a));
    };
    // fond effectif : on remonte les ancêtres jusqu'à trouver un fond opaque
    const bgOf = el => {
      let n = el, stack = [];
      while (n && n !== document.documentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c.length && (c.length < 4 || c[3] > 0)) {
          stack.push(c);
          if (c.length < 4 || c[3] === 1) break;
        }
        n = n.parentElement;
      }
      let base = [12, 20, 19];   // --ground, le sol du site
      for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
      return base;
    };
    const out = [];
    document.querySelectorAll('main *, footer *, header *').forEach(el => {
      const txt = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
      if (!txt) return;
      const st = getComputedStyle(el);
      if (st.visibility === 'hidden' || st.display === 'none' || +st.opacity === 0) return;
      if (el.closest('[aria-hidden="true"]')) return;   // décoratif
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const bg = bgOf(el);
      const fg = over(parse(st.color), bg);
      const l1 = lum(fg), l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const size = parseFloat(st.fontSize), wt = +st.fontWeight || 400;
      const large = size >= 24 || (size >= 18.66 && wt >= 700);
      const need = large ? 3 : 4.5;
      if (ratio < need) {
        const sec = el.closest('section,footer,header');
        out.push({
          sec: sec ? (sec.id || sec.className.split(' ')[0]) : '?',
          theme: (sec && (sec.className.match(/t-\w+/) || ['nuit'])[0]) || 'nuit',
          sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''),
          txt: txt.slice(0, 44), ratio: +ratio.toFixed(2), need,
          size: +size.toFixed(1)
        });
      }
    });
    return out;
  });

  total += bad.length;
  console.log(`  ${pg.padEnd(24)}${String(w).padStart(5)}px  ${bad.length ? bad.length + ' sous le seuil' : 'conforme'}`);
  bad.forEach(x => console.log(
    `   ${x.sec.padEnd(13)} ${x.theme.padEnd(11)} ${String(x.ratio).padStart(5)}:1 (min ${x.need}) ${String(x.size).padStart(5)}px  ${x.sel.slice(0,26).padEnd(26)} « ${x.txt} »`));
  await ctx.close();
  }}}
  console.log();
  console.log(total ? '\u2717 ' + total + ' texte(s) sous le seuil AA au total'
                    : '\u2713 aucun texte sous le seuil AA : ' + PAGES.length + ' pages \u00d7 ' + W.length + ' largeurs \u00d7 ' + MOTION.length + ' r\u00e9gimes');
  await b.close();
  process.exit(total ? 1 : 0);
})();
