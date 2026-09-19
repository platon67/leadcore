/* Compare deux jeux de captures : hauteur de page, et proportion de pixels
   qui changent. Un chiffre, pas une impression. */
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const [a, b] = process.argv.slice(2);
const lire = d => Object.fromEntries(
  fs.readFileSync(path.join(d,'hauteurs.txt'),'utf8').trim().split('\n')
    .map(l => { const [p,w,h]=l.split(' '); return [p+' '+w, +h]; }));
const ha = lire(a), hb = lire(b);
console.log('page                 largeur   hauteur avant → après      écart');
for (const k of Object.keys(ha)) {
  const [pg,w] = k.split(' ');
  const d = hb[k]-ha[k];
  const pct = (100*d/ha[k]).toFixed(1);
  console.log(`${pg.padEnd(22)}${w.padStart(5)}   ${String(ha[k]).padStart(6)} → ${String(hb[k]).padStart(6)}    ${(d>=0?'+':'')+d} px (${pct} %)`);
}
