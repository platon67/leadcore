# Motion de marque

## `leadcore-ouverture-1080p.mp4`

L'habillage d'ouverture du site, rendu en fichier : 1920 × 1080, 60 i/s,
3,67 s, H.264, 206 Ko. Fond `#0C1413` — le sol du site depuis la refonte du
fond (section 24 de `site/assets/styles.css`) — donc il se pose sans raccord
sur une page du site comme sur n'importe quel support à la charte.

Séquence, en quatre temps :

1. **0 → 0,75 s** — six points émeraude jaillissent d'un même point et
   s'écartent en couronne, avec un ressort qui dépasse puis revient.
2. **0,75 → 1,4 s** — ils se rappellent au centre et se fondent au point
   d'impact. La marque éclôt de ce point derrière un disque qui s'ouvre.
3. **1,4 → 1,5 s** — la marque encaisse une pulsation : elle s'éclaircit vers
   `--emerald-hi` et respire une fois.
4. **1,5 → 2,12 s** — le mot se révèle par balayage de gauche à droite pendant
   que le verrou glisse pour recentrer la composition. Maintien, puis fondu.

### Comment il est fabriqué

Il n'y a pas de projet After Effects : le film **est** l'animation du site.
`scratchpad/film.html` recharge `site/assets/styles.css` tel quel, Playwright
fige les animations avec l'API Web Animations et avance `currentTime` image par
image, puis ffmpeg encode la séquence. Le seul écart avec le site est la taille
de la marque, remontée à 190 px : à 104 px elle serait perdue sur un cadre 1080p.

Conséquence utile : **la vidéo ne peut pas diverger du site**. Retoucher la
chorégraphie dans `styles.css` et relancer le rendu suffit à regénérer un film
à jour. Une seule valeur est à reporter à la main, le fond : il est déclaré
dans `film.html` et dans le `fade` de ffmpeg, et doit valoir `--ground`.

### Regénérer

```bash
python3 -m http.server 8391 --directory site      # le site sert la feuille de style
python3 -m http.server 8392 --directory <scratch> # la page de rendu
node film-shoot.js                                 # 220 images en 1080p
ffmpeg -framerate 60 -i film/f%04d.png \
  -vf "fade=t=out:st=3.17:d=0.5:color=0x0C1413,format=yuv420p" \
  -c:v libx264 -profile:v high -preset slow -crf 17 -movflags +faststart \
  leadcore-ouverture-1080p.mp4
```

### Le logo en vectoriel

La marque et le mot ont été vectorisés depuis `deck/assets/leadcore-logo.png`
avec potrace, puis vérifiés par superposition pixel avec l'original. Les tracés
sont inlinés dans `site/index.html` (≈ 7,8 Ko, ~2,5 Ko une fois compressés) :
pas de requête supplémentaire, et une marque qui reste nette à toute taille.
