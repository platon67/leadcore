/* ═══════════════════════════════════════════════════════════════════════════
   Leadcore — la machine du héros
   ───────────────────────────────────────────────────────────────────────────
   Un rendu 3D logiciel, dans un canevas 2D, sans bibliothèque et sans WebGL.
   La scène : le marché tombe en poussière, la trémie en retient l'essentiel
   sur ses parois, le peu qui passe est forgé au cœur de la machine, et la
   pièce descend s'empiler sur le socle du client.

   ── POURQUOI CE RENDU-LÀ ───────────────────────────────────────────────────
   La scène fait cent vingt faces et trois cents grains. C'est deux ordres de
   grandeur sous ce qui justifie WebGL, et quatre cents kilo-octets sous ce que
   coûterait une bibliothèque 3D — sur un site qui n'a ni dépendance ni étape
   de compilation. Écrire la projection, le tri et l'éclairage à la main coûte
   ce fichier, et rend en échange le seul contrôle qui compte ici : celui de la
   matière. Un moteur généraliste apporte ses matériaux par défaut, et ses
   matériaux par défaut sont exactement l'aspect plastique qu'on ne veut pas.

   ── CE QUI FAIT QUE ÇA N'A PAS L'AIR BON MARCHÉ ────────────────────────────
   Quatre règles, tenues partout :

   · Le métal reste sombre et neutre. La face la plus éclairée de la machine
     est à 17 % de blanc, et elle est grise, pas verte. Un objet 3D qui « brille » est un objet en plastique ; un objet
     en métal dans une pièce noire est presque noir, et ce sont ses arêtes qui
     le dessinent.
   · Une seule lumière colorée, et elle est dans la machine. L'émeraude ne
     vient jamais d'un dégradé posé sur une surface : elle vient du foyer, et
     elle décroît en 1/d². Ce qui est près du foyer est vert, ce qui est loin
     ne l'est pas. C'est ce qui donne le volume.
   · Chaque face est bordée d'un trait un peu plus clair que son aplat. Sans
     ce liseré, un rendu à faces plates s'affaisse en taches ; avec lui, il est
     usiné.
   · Rien n'est arrondi et rien ne rebondit. Prismes à huit pans, chanfreins,
     une vue de trois quarts qui oscille de neuf degrés sur vingt-six secondes.
     Le mouvement dit « machine en marche », pas « animation ».

   ── COMMENT ────────────────────────────────────────────────────────────────
   1. La géométrie fixe (trémie, corps, montants, collerette, socle) est
      construite une fois, en coordonnées du monde.
   2. Par image : les sommets passent en repère caméra (lacet, tangage,
      translation), puis en perspective. Les faces sont éliminées au signe de
      leur normale, éclairées, triées par profondeur décroissante, et peintes
      du fond vers l'avant.
   3. La poussière est triée en deux paquets, derrière et devant le plan du
      foyer : c'est assez pour qu'un grain passe derrière la trémie au lieu de
      flotter dessus, et ça évite de trier trois cents points par image.
   4. Les lueurs sont deux dégradés radiaux peints une fois hors écran, puis
      recopiés en mélange additif. Aucun `shadowBlur`, aucun filtre.

   Rien ne tourne hors de l'écran ni dans un onglet en arrière-plan. Sous
   `prefers-reduced-motion`, la scène est avancée à vide jusqu'à un état qui
   dit quelque chose, rendue une fois, et c'est tout : une machine à l'arrêt
   reste une machine.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var fig = document.querySelector(".forge");
  if (!fig) return;
  var stage = fig.querySelector(".forge-stage");
  var cv = fig.querySelector(".forge-c");
  if (!stage || !cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  if (!ctx) return;

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─────────── couleurs, prises à la feuille de style ───────────
     La charte est déclarée une fois, en haut de styles.css. Ce fichier n'en
     recopie aucune valeur : il les lit. */
  var css = getComputedStyle(document.documentElement);
  function triplet(name, fb) {
    var v = css.getPropertyValue(name).trim();
    var m = v.match(/^#?([0-9a-f]{6})$/i);
    if (m) { var n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    m = v.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    return m ? [+m[1], +m[2], +m[3]] : fb;
  }
  var C_ACC = triplet("--accent", [25, 199, 139]);
  var C_HI = triplet("--accent-hi", [92, 237, 186]);
  var C_DUST = triplet("--mist-dim", [126, 146, 137]);

  function rgba(r, g, b, a) {
    return "rgba(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + "," + a + ")";
  }

  /* ─────────── empreintes de lueur, peintes une fois ─────────── */
  function sprite(c, mid) {
    var R = 64, o = document.createElement("canvas");
    o.width = o.height = R * 2;
    var g = o.getContext("2d");
    var grd = g.createRadialGradient(R, R, 0, R, R, R);
    grd.addColorStop(0, rgba(c[0], c[1], c[2], 1));
    grd.addColorStop(mid, rgba(c[0], c[1], c[2], 0.24));
    grd.addColorStop(1, rgba(c[0], c[1], c[2], 0));
    g.fillStyle = grd;
    g.fillRect(0, 0, R * 2, R * 2);
    return o;
  }
  /* ─────────── qualité ───────────
     Le coût de cette scène n'est pas dans le calcul, il est dans le nombre de
     pixels peints : cinq cents empreintes translucides en mélange additif,
     plus deux cents faces, sur toute la surface du panneau. Mesuré à CPU ÷ 4 :
     63 ms par image en densité 2, 31 ms en densité 1 — c'est la densité de
     pixels qui décide, et rien d'autre.

     D'où deux décisions. La densité est plafonnée à 1,5 : au-delà, on paie le
     double pour des arêtes d'un pixel sur un objet sombre et flou, ce qui ne
     se voit pas. Et la scène se dégrade d'elle-même — si la moyenne glissante
     passe 26 ms, elle descend d'un cran, jusqu'à deux. Elle ne remonte jamais :
     une qualité qui oscille se remarque, une qualité basse ne se remarque pas.
     Une machine rapide garde tout ; une machine lente garde soixante images
     par seconde, ce qui compte davantage. */
  var TIERS = [
    { dpr: 1.5, div: 520, halo: 1, spark: 0.44 },
    { dpr: 1.15, div: 950, halo: 0.82, spark: 0.34 },
    { dpr: 1, div: 1700, halo: 0.7, spark: 0.28 }
  ];
  var tier = 0, Q = TIERS[0];

  var SP_CORE = sprite(C_HI, 0.18);
  var SP_HALO = sprite(C_ACC, 0.4);
  /* La poussière était peinte en `fillRect`. À un pixel et demi de côté, sur du
     noir, quatre cents carrés durs ne font pas un champ : ils font du bruit de
     capteur. Une empreinte ronde, même minuscule, redevient un grain. */
  var SP_DUST = sprite(C_DUST, 0.3);

  function glow(img, x, y, r, a) {
    if (a <= 0.004 || !(r > 0)) return;
    ctx.globalAlpha = a > 1 ? 1 : a;
    ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
  }
  /* les grandes lueurs sont les plus chères au pixel : elles rétrécissent
     avant tout le reste quand la scène descend d'un cran */
  function halo(x, y, r, a) { glow(SP_HALO, x, y, r * Q.halo, a); }

  /* ═══════════ 1. LA GÉOMÉTRIE ═══════════
     Tout est en unités du monde, Y vers le haut, origine au centre de la
     machine. Les cotes sont ici et nulle part ailleurs : la chute de la
     poussière relit les mêmes, donc la trémie du dessin et la trémie du calcul
     sont la même trémie.

     Les pièces ont une épaisseur. La trémie est un double cône fermé par un
     jonc ; le corps, la collerette et le socle ont chacun leur bride ou leur
     lamage. C'est ce qui sépare une maquette en carton d'une pièce usinée :
     une paroi sans épaisseur n'attrape jamais la lumière sur sa tranche. */
  var M = {
    hopTop: 1.30, hopBot: 0.72,
    hopRTop: 1.16, hopRBot: 0.40,          /* le cône intérieur : celui qui trie */
    hopWall: 0.075,
    /* Le corps est conique, et c'est une contrainte de vue avant d'être un
       parti pris. Cylindrique, il faisait 0,92 de rayon jusqu'en bas : vu de
       27° au-dessus, son bord avant passait plus bas à l'écran que le foyer
       logé dessous, et le cachait entièrement. On peut abaisser la caméra —
       mais alors on ne voit plus dans la trémie, et la machine ne montre plus
       ce qu'elle attrape. Le corps se resserre donc vers le bas : la vue est
       dégagée, et une machine qui s'affine sous sa gueule se lit mieux qu'un
       cylindre posé sur un pied. */
    bodyTop: 0.72, bodyRTop: 0.84,
    bodyBot: -0.10, bodyRBot: 0.50,
    flangeBot: -0.21, flangeR: 0.58,
    cageTop: -0.21, cageBot: -1.50, postR: 0.46,
    collarTop: -1.50, collarBot: -1.66, collarR: 0.56, boreR: 0.26,
    coreY: -1.00, coreR: 0.32,
    plinthTop: -2.05, plinthBot: -2.50, plinthR: 1.24,
    plinthBoreR: 0.82, plinthBoreY: -2.17,
    baseTop: -2.50, baseBot: -2.58, baseR: 1.31,
    ingotR: 0.46, ingotH: 0.075, ingotPitch: 0.092, ingotMax: 5,
    cloudTop: 3.60, cloudHalf: 1.62,
    frameTop: 2.32
  };

  /* Matériaux. Aplat de base, gain diffus, part prise au foyer, et de combien
     le liseré dépasse l'aplat.

     Le métal est neutre et sombre, presque gris. La tentation, sur un site
     émeraude, est de teinter la matière elle-même : c'est l'erreur qui fait
     qu'un rendu a l'air d'un jouet en plastique coloré. La couleur ne doit
     appartenir qu'à la lumière — ici le foyer — et la matière doit se contenter
     de la recevoir. Face la plus éclairée de la machine : 18 % de blanc.

     Réglé deux fois. Au premier jet, tout était teinté et la machine avait
     l'air d'un jouet vert. Au second, le métal était neutre mais si sombre que
     la machine n'était plus qu'une silhouette : on ne voyait plus qu'elle
     était en volume. Le gain diffus est donc remonté d'un cran et demi, et
     c'est le contraste entre faces, pas la clarté moyenne, qui porte le
     relief. */
  var MAT = {
    shell: { base: [11, 15, 15], gain: [31, 38, 38], lit: 0.34, edge: 1.85 },
    inner: { base: [7, 11, 11], gain: [11, 15, 15], lit: 0.8, edge: 1.7 },
    post: { base: [14, 19, 19], gain: [36, 44, 44], lit: 0.7, edge: 1.95 },
    plinth: { base: [10, 14, 14], gain: [28, 34, 34], lit: 0.18, edge: 1.9 }
  };

  var BV = [], BF = [];

  function vtx(x, y, z) { BV.push(x, y, z); return BV.length / 3 - 1; }

  function ring(y, r, n, off) {
    var a = [], i;
    for (i = 0; i < n; i++) {
      var t = (i + (off || 0)) / n * 6.283185;
      a.push(vtx(Math.cos(t) * r, y, Math.sin(t) * r));
    }
    return a;
  }

  /* Une face, avec sa normale et son centre calculés une fois pour toutes.

     L'orientation ne vient pas du sens d'écriture des sommets. Elle vient d'un
     vecteur d'intention — « cette face regarde dehors », « celle-là regarde
     le haut » — auquel la normale géométrique est recalée. C'est la deuxième
     version : la première éliminait les faces arrière au signe de l'aire
     projetée, ce qui suppose que toutes les couronnes soient écrites dans le
     même sens. Elles ne l'étaient pas, et la collerette et le socle rendaient
     un pan sur deux. Une intention explicite ne peut pas se tromper de signe. */
  function face(idx, mat, hint, tag) {
    var i, j, nx = 0, ny = 0, nz = 0, cx = 0, cy2 = 0, cz = 0, n = idx.length;
    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      var xi = BV[idx[i] * 3], yi = BV[idx[i] * 3 + 1], zi = BV[idx[i] * 3 + 2];
      var xj = BV[idx[j] * 3], yj = BV[idx[j] * 3 + 1], zj = BV[idx[j] * 3 + 2];
      nx += (yi - yj) * (zi + zj);         /* Newell : juste même sur un quad gauche */
      ny += (zi - zj) * (xi + xj);
      nz += (xi - xj) * (yi + yj);
      cx += xi; cy2 += yi; cz += zi;
    }
    var L = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= L; ny /= L; nz /= L;
    cx /= n; cy2 /= n; cz /= n;

    var hx, hy, hz;
    if (hint === "up") { hx = 0; hy = 1; hz = 0; }
    else if (hint === "down") { hx = 0; hy = -1; hz = 0; }
    else {
      var rl = Math.hypot(cx, cz) || 1;
      hx = cx / rl; hy = 0; hz = cz / rl;
      if (hint === "in") { hx = -hx; hz = -hz; }
    }
    if (nx * hx + ny * hy + nz * hz < 0) { nx = -nx; ny = -ny; nz = -nz; }

    BF.push({ v: idx, m: mat, nx: nx, ny: ny, nz: nz, cx: cx, cy: cy2, cz: cz, tag: tag || 0 });
  }

  function band(up, lo, mat, hint, tag) {
    for (var i = 0; i < up.length; i++) {
      var j = (i + 1) % up.length;
      face([up[i], up[j], lo[j], lo[i]], mat, hint, tag);
    }
  }

  /* rayon du corps à la hauteur y — le cône est décrit par ses deux bouts */
  function taper(y) {
    var u = (y - M.bodyBot) / (M.bodyTop - M.bodyBot);
    return M.bodyRBot + (M.bodyRTop - M.bodyRBot) * u;
  }

  (function buildMachine() {
    var n = 8, o = 0.5, k;

    /* ── la trémie : cône intérieur, cône extérieur, jonc ──
       tag 1 = la paroi qui trie, celle sur laquelle les refus s'allument. */
    var iT = ring(M.hopTop, M.hopRTop, n, o);
    var iB = ring(M.hopBot, M.hopRBot, n, o);
    var oT = ring(M.hopTop, M.hopRTop + M.hopWall, n, o);
    var oB = ring(M.hopBot, M.hopRBot + M.hopWall, n, o);
    /* Le cône intérieur est découpé en trois anneaux. L'éclairage est calculé
       au centre de chaque face : sur une facette qui fait toute la hauteur du
       cône, la décroissance en 1/d² s'y moyenne et la paroi devient un aplat
       uniforme — exactement la surface en plastique qu'on essaie d'éviter.
       Trois anneaux suffisent à ce que le fond de la trémie soit plus chaud
       que son bord. */
    var prev = iB;
    for (k = 1; k <= 3; k++) {
      var u = k / 3;
      var cur = k === 3 ? iT : ring(M.hopBot + (M.hopTop - M.hopBot) * u,
                                    M.hopRBot + (M.hopRTop - M.hopRBot) * u, n, o);
      band(prev, cur, "inner", "in", 1);
      prev = cur;
    }
    band(oT, oB, "shell", "out");
    band(iT, oT, "shell", "up");

    /* ── le corps, son épaulement et sa bride de pied ── */
    var bT = ring(M.bodyTop, M.bodyRTop, n, o);
    var bB = ring(M.bodyBot, M.bodyRBot, n, o);
    band(oB, bT, "shell", "up");                     /* l'épaulement */
    /* Une gorge fait le tour du corps, au tiers de sa hauteur. Un bloc lisse
       n'est pas une machine, c'est une borne : il faut au moins une arête
       horizontale pour que la lumière rasante ait quelque chose à accrocher,
       et pour que l'échelle de la pièce se lise. */
    var gy = M.bodyTop - (M.bodyTop - M.bodyBot) * 0.34;
    var g1 = ring(gy, taper(gy), n, o);
    var g2 = ring(gy - 0.02, taper(gy - 0.02) - 0.05, n, o);
    var g3 = ring(gy - 0.11, taper(gy - 0.11) - 0.05, n, o);
    var g4 = ring(gy - 0.13, taper(gy - 0.13), n, o);
    band(bT, g1, "shell", "out");
    band(g1, g2, "inner", "down");
    band(g2, g3, "inner", "out");
    band(g3, g4, "inner", "up");
    band(g4, bB, "shell", "out");
    var fT = ring(M.bodyBot, M.flangeR, n, o);
    var fB = ring(M.flangeBot, M.flangeR, n, o);
    band(bB, fT, "shell", "up");
    band(fT, fB, "shell", "out");
    band(fB, ring(M.flangeBot, M.flangeR * 0.5, n, o), "shell", "down");

    /* ── les quatre montants : la cage qui tient le foyer en l'air ── */
    for (k = 0; k < 4; k++) {
      var t = (k / 4) * 6.283185 + 0.7854;
      var cxp = Math.cos(t), czp = Math.sin(t);
      var pxo = cxp * M.postR, pzo = czp * M.postR, w = 0.09;
      var rx = cxp * w, rz = czp * w, ax = -rz, az = rx;
      var up = [
        vtx(pxo + ax, M.cageTop, pzo + az), vtx(pxo + rx, M.cageTop, pzo + rz),
        vtx(pxo - ax, M.cageTop, pzo - az), vtx(pxo - rx, M.cageTop, pzo - rz)
      ];
      var lo = [
        vtx(pxo + ax, M.cageBot, pzo + az), vtx(pxo + rx, M.cageBot, pzo + rz),
        vtx(pxo - ax, M.cageBot, pzo - az), vtx(pxo - rx, M.cageBot, pzo - rz)
      ];
      band(up, lo, "post", "out");
    }

    /* ── la collerette percée : le métal par lequel la pièce sort ── */
    var cOT = ring(M.collarTop, M.collarR, n, o);
    var cOB = ring(M.collarBot, M.collarR, n, o);
    var cIT = ring(M.collarTop, M.boreR, n, o);
    var cIB = ring(M.collarBot, M.boreR, n, o);
    band(cOT, cOB, "shell", "out");
    band(cIB, cIT, "inner", "in");
    band(cIT, cOT, "shell", "up");
    band(cOB, cIB, "shell", "down");

    /* ── le socle du client : large, bas, lamé sur le dessus ──
       Les pièces s'empilent dans le lamage : une pile posée sur une surface
       plate flotte, une pile logée dans son creux appartient au socle. */
    var pT = ring(M.plinthTop, M.plinthR, n, o);
    var pB = ring(M.plinthBot, M.plinthR, n, o);
    var qT = ring(M.plinthTop, M.plinthBoreR, n, o);
    var qB = ring(M.plinthBoreY, M.plinthBoreR, n, o);
    band(qT, pT, "plinth", "up");
    band(qB, qT, "inner", "in");
    face(ring(M.plinthBoreY, M.plinthBoreR, n, o), "inner", "up");
    band(pT, pB, "plinth", "out");
    var eT = ring(M.baseTop, M.baseR, n, o);
    var eB = ring(M.baseBot, M.baseR, n, o);
    band(pB, eT, "plinth", "up");
    band(eT, eB, "plinth", "out");

    /* Quatre bossages sur la face du socle : la seule chose qui dise que
       l'objet du bas est une machine et pas un piédestal. */
    for (k = 0; k < 4; k++) {
      var bt = (k / 4) * 6.283185 + 0.7854;
      var bx = Math.cos(bt) * 1.03, bz = Math.sin(bt) * 1.03, bw = 0.1;
      var bu = [
        vtx(bx - bw, M.plinthTop + 0.055, bz - bw), vtx(bx + bw, M.plinthTop + 0.055, bz - bw),
        vtx(bx + bw, M.plinthTop + 0.055, bz + bw), vtx(bx - bw, M.plinthTop + 0.055, bz + bw)
      ];
      var bl = [
        vtx(bx - bw, M.plinthTop, bz - bw), vtx(bx + bw, M.plinthTop, bz - bw),
        vtx(bx + bw, M.plinthTop, bz + bw), vtx(bx - bw, M.plinthTop, bz + bw)
      ];
      for (var q = 0; q < 4; q++) {
        var q2 = (q + 1) % 4;
        face([bu[q], bu[q2], bl[q2], bl[q]], "plinth",
             q === 0 ? "in" : (q === 2 ? "out" : "out"));
      }
      face([bu[3], bu[2], bu[1], bu[0]], "plinth", "up");
    }
  })();

  /* ═══════════ 2. LA CAMÉRA ═══════════ */
  var W = 0, H = 0, DPR = 1, SCALE = 1, FOC = 1, CX = 0, CY = 0;
  /* 27°. En dessous de 25 on ne voit pas dans la trémie, et une machine dont
     on ne voit pas l'intérieur ne montre pas ce qu'elle attrape — ce qui est
     tout le sujet. Au-dessus de 30 la chaîne s'écrase et le socle est vu de
     trop haut. */
  var CAM_D = 7.6, PITCH = 0.47;
  var YAW0 = 0.28, YAW_A = 0.15;    /* la machine n'est jamais vue de face */

  function measure() {
    var box = stage.getBoundingClientRect();
    if (!box.width) return false;
    W = box.width; H = box.height || box.width;
    DPR = Math.min(window.devicePixelRatio || 1, Q.dpr);
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    SCALE = Math.max(0.75, H / 660);
    fit();
    return true;
  }

  /* Le cadrage est mesuré, pas deviné.

     Première version : la focale se déduisait de la hauteur de la scène en
     supposant tous les points à la distance de la caméra. C'est faux dès qu'un
     objet est large — le bord avant du socle est à 6,4 et non 7,6, donc il est
     grossi de 21 % et sortait du cadre par le bas. Un facteur de sécurité
     choisi à la main aurait tenu jusqu'à la prochaine cote modifiée.

     On projette donc réellement tous les sommets de la machine, aux deux
     extrêmes du lacet, et on prend l'enveloppe. La machine reçoit 68 % de la
     hauteur et se pose en bas du cadre ; ce qui reste au-dessus est pour le
     marché, qui déborde volontairement par le haut. Changer une cote de la
     machine recadre la scène toute seule. */
  function fit() {
    var uMin = 1e9, uMax = -1e9, vMin = 1e9, vMax = -1e9;
    var sweep = [YAW0 - YAW_A, YAW0, YAW0 + YAW_A];
    for (var q = 0; q < sweep.length; q++) {
      setAngles(sweep[q], PITCH);
      for (var i = 0; i < BV.length; i += 3) {
        toView(BV[i], BV[i + 1], BV[i + 2]);
        if (vz < 0.8) continue;
        var u = vx / vz, v = vy / vz;
        if (u < uMin) uMin = u; if (u > uMax) uMax = u;
        if (v < vMin) vMin = v; if (v > vMax) vMax = v;
      }
    }
    FOC = Math.min(W * 0.94 / (uMax - uMin), H * 0.68 / (vMax - vMin));
    CX = W * 0.5 - FOC * (uMin + uMax) * 0.5;
    CY = H * 0.965 + FOC * vMin;          /* le pied du socle, presque en bas */
  }

  var pX = [], pY = [], pZ = [];
  var cy = 1, sy = 0, cp = 1, sp = 0;
  var vx = 0, vy = 0, vz = 0;

  /* monde → repère caméra. Le cadrage n'est plus dans cette fonction : il est
     dans `fit()`, qui donne le centre écran et la focale. La rotation se fait
     donc autour de l'origine du monde, qui est le centre de la machine — c'est
     le seul axe autour duquel une machine a une raison de tourner. */
  function setAngles(a, p) {
    cy = Math.cos(a); sy = Math.sin(a);
    cp = Math.cos(p); sp = Math.sin(p);
  }

  /* ─────────── monde → repère caméra ───────────
     La caméra est posée sur une orbite : à la distance `CAM_D` de l'origine,
     relevée du tangage, et elle vise l'origine. En développant, un point du
     monde déjà tourné du lacet en (x, y, rz) donne

         vy = y·cos p − rz·sin p
         vz = CAM_D − y·sin p − rz·cos p

     Les deux signes de `vz` sont ceux qui ont coûté le plus cher. Écrits « + »,
     un point haut s'éloigne de l'œil au lieu de s'en rapprocher : la caméra
     passe sous la scène et regarde vers le haut, ce qui, à 17°, ne se voit que
     comme « on ne voit pas dans la trémie ». Corrigé de travers ensuite, c'est
     l'axe de profondeur qui s'inversait : la machine se rendait vue de
     l'arrière, et l'intérieur de la trémie s'affichait entier au lieu d'être à
     moitié caché par sa paroi avant. Les deux fois, l'image restait
     vraisemblable — d'où la vérification à la main : un point haut doit avoir
     un `vz` plus petit, un point proche aussi. */
  function toView(x, y, z) {
    var rx = x * cy - z * sy;
    var rz = x * sy + z * cy;
    vx = rx;
    vy = y * cp - rz * sp;
    vz = CAM_D - y * sp - rz * cp;
  }
  /* même transformation, privée de la translation : pour les normales */
  function rotVec(x, y, z) {
    var rx = x * cy - z * sy;
    var rz = x * sy + z * cy;
    vx = rx;
    vy = y * cp - rz * sp;
    vz = -y * sp - rz * cp;
  }

  /* ═══════════ 3. L'ÉCLAIRAGE ═══════════
     Une directionnelle froide et faible, qui dit d'où vient le haut. Et le
     foyer, qui est la seule couleur de la scène. */
  var LX = -0.34, LY = 0.78, LZ = 0.52;
  (function () { var n = Math.hypot(LX, LY, LZ); LX /= n; LY /= n; LZ /= n; })();

  /* Deux sources ponctuelles, et pas une de plus. Le foyer, qui est la raison
     d'être de la machine. Et la gorge, juste sous la trémie : sans elle
     l'intérieur du cône est un trou noir, et on ne voit pas ce que la machine
     attrape — ce qui est précisément ce que le panneau a à montrer. Elle est
     trois fois plus faible, et elle ne bouge pas. */
  var LIGHTS = [
    { x: 0, y: 0, z: 0, c: C_HI, p: 1, on: 1 },      /* le foyer */
    { x: 0, y: 0, z: 0, c: C_ACC, p: 0.55, on: 1 }   /* la gorge d'admission */
  ];
  var coreVX = 0, coreVY = 0, coreVZ = 0, coreOn = 0.5;

  /* ═══════════ 4. LA MATIÈRE ═══════════ */
  var dust = [], sparks = [], motes = [], forms = [], ingots = [];
  var charge = 0, PER_FORM = 14;

  function seedDust(p, scatter) {
    /* Le marché est une colonne, pas un plan : les grains ont une profondeur,
       donc les uns passent devant la machine et les autres derrière. C'est ce
       qui donne son épaisseur au champ. */
    var a = Math.random() * 6.283185;
    var rr = Math.sqrt(Math.random()) * M.cloudHalf;
    p.x = Math.cos(a) * rr;
    p.z = Math.sin(a) * rr;
    p.y = scatter ? M.hopBot + Math.random() * (M.cloudTop - M.hopBot)
                  : M.cloudTop + Math.random() * 0.3;
    p.vy = 0.42 + Math.random() * 0.5;
    p.ph = Math.random() * 6.283185;
    p.out = 0;
    p.a = 0.3 + Math.random() * 0.5;
  }

  function seedAll() {
    var n = Math.max(110, Math.min(560, Math.round(W * H / Q.div)));
    dust.length = 0;
    for (var i = 0; i < n; i++) { var p = {}; seedDust(p, true); dust.push(p); }
    sparks.length = 0; motes.length = 0; forms.length = 0; ingots.length = 0;
    charge = 0;
  }

  /* Rayon intérieur de la trémie à la hauteur y. */
  function hopperR(y) {
    if (y >= M.hopTop) return M.hopRTop;
    if (y <= M.hopBot) return M.hopRBot;
    return M.hopRBot + (M.hopRTop - M.hopRBot) * (y - M.hopBot) / (M.hopTop - M.hopBot);
  }

  function stepDust(dt, t) {
    for (var i = 0; i < dust.length; i++) {
      var p = dust[i];

      if (p.out) {
        /* Jamais entré. Il ne s'évanouit pas au bord de la trémie : il tombe
           le long de la machine et sort du cadre. C'est le marché qu'on
           n'atteint pas, et il doit se voir passer. */
        p.out += dt;
        p.y -= p.vy * dt * 1.25;
        if (p.out > 2.6 || p.y < M.plinthBot) seedDust(p, false);
        continue;
      }

      /* dérive : deux sinus, assez pour que deux grains voisins ne tombent
         jamais ensemble, ce qui suffit à faire une foule */
      p.x += Math.sin(p.y * 1.7 + p.ph) * 0.08 * dt;
      p.z += Math.cos(p.y * 1.3 - t * 0.4 + p.ph) * 0.08 * dt;
      p.y -= p.vy * dt;

      if (p.y > M.hopTop) continue;

      var rho = Math.hypot(p.x, p.z);
      if (rho > M.hopRTop) { p.out = 0.0001; continue; }   /* jamais entré */

      var hr = hopperR(p.y);
      if (rho > hr) {
        /* Il a touché la paroi. C'est tout le sujet du panneau : la machine est
           grande ouverte, et ce qu'elle refuse décide de ce qui sort. Le rapport
           n'est réglé nulle part — il tombe de la géométrie, le carré du rapport
           des rayons, soit neuf pour cent de ce qui entre. */
        var k = hr / rho;
        sparks.push({ x: p.x * k, y: p.y, z: p.z * k, t: 0, a: p.a });
        seedDust(p, false);
        continue;
      }

      if (p.y <= M.hopBot) {
        motes.push({
          sx: p.x, sy: p.y, sz: p.z, x: p.x, y: p.y, z: p.z,
          u: 0, t: 0, dur: 0.6 + Math.random() * 0.4
        });
        seedDust(p, false);
      }
    }
  }

  function stepSparks(dt) {
    for (var i = sparks.length - 1; i >= 0; i--) {
      sparks[i].t += dt;
      if (sparks[i].t > Q.spark) sparks.splice(i, 1);
    }
  }

  function stepMotes(dt) {
    for (var i = motes.length - 1; i >= 0; i--) {
      var m = motes[i];
      m.t += dt;
      var u = m.t / m.dur;
      if (u >= 1) {
        motes.splice(i, 1);
        charge += 1 / PER_FORM;
        if (charge >= 1 && forms.length < 2) { charge = 0; forms.push({ t: 0, rot: Math.random() * 3 }); }
        else if (charge > 1) charge = 1;
        continue;
      }
      var e = u * u * (3 - 2 * u);
      m.u = e;
      m.x = m.sx * (1 - e);
      m.z = m.sz * (1 - e);
      m.y = m.sy + (M.coreY - m.sy) * e;
    }
  }

  var F_BIRTH = 0.7, F_FALL = 1.8, F_SET = 0.45;

  function stackTop() {
    return M.plinthBoreY + ingots.length * M.ingotPitch;
  }

  function stepForms(dt) {
    for (var i = forms.length - 1; i >= 0; i--) {
      var f = forms[i];
      f.t += dt; f.rot += dt * 0.5;

      if (f.t < F_BIRTH) {                      /* elle prend corps au foyer */
        f.y = M.coreY; f.s = f.t / F_BIRTH; f.lay = 0;
      } else if (f.t < F_BIRTH + F_FALL) {      /* elle descend */
        var u = (f.t - F_BIRTH) / F_FALL;
        var e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
        f.y = M.coreY + (stackTop() + 0.1 - M.coreY) * e;
        f.s = 1; f.lay = 0;
      } else {                                  /* elle se couche sur la pile */
        var v = Math.min(1, (f.t - F_BIRTH - F_FALL) / F_SET);
        f.y = stackTop() + 0.1;
        f.s = 1;
        f.lay = v * v * (3 - 2 * v);
        if (!f.done && v >= 1) { f.done = true; pushIngot(); }
        if (f.t > F_BIRTH + F_FALL + F_SET + 0.1) { forms.splice(i, 1); continue; }
      }
    }
  }

  /* Premier entré, premier sorti : la sixième pièce pousse la première dehors.
     Pas de remise à zéro — une remise à zéro se lirait comme une perte, et ce
     n'est pas ce qui se passe. */
  function pushIngot() {
    ingots.push({ t: 0, drop: 0 });
    if (ingots.length > M.ingotMax) {
      ingots.shift();
      for (var i = 0; i < ingots.length; i++) ingots[i].drop = M.ingotPitch;
    }
  }

  function stepIngots(dt) {
    for (var i = 0; i < ingots.length; i++) {
      ingots[i].t += dt;
      if (ingots[i].drop > 0) ingots[i].drop = Math.max(0, ingots[i].drop - dt * 0.45);
    }
  }

  /* ═══════════ 5. LE RENDU ═══════════
     Une seule liste, triée une fois par image.

     Première version : les faces étaient triées entre elles, et tout le reste
     — poussière, refus, pièces, lingots — était peint avant ou après le bloc,
     selon un plan de coupe. Ça marche tant que tout est loin de tout. Ici la
     poussière tombe dans la trémie, les refus vivent sur sa paroi intérieure et
     la pièce descend entre les montants : chacun de ces trois cas demande que
     l'objet soit intercalé entre deux faces de la machine, pas avant ni après.

     Tout entre donc dans la même liste, avec sa profondeur, et la liste est
     triée d'un bloc. Six cents entrées par image, réutilisées d'une image à
     l'autre pour ne rien allouer dans la boucle. C'est le poste le plus cher du
     rendu, et c'est ce qui permet à un grain de passer derrière la trémie. */

  var RL = [], RN = 0;

  function slot() {
    var e = RL[RN];
    if (!e) { e = { z: 0, t: 0, i: 0, x: 0, y: 0, k: 0, a: 0 }; RL[RN] = e; }
    RN++;
    return e;
  }

  var T_FACE = 0, T_DUST = 1, T_SPARK = 2, T_MOTE = 3, T_FORM = 4,
      T_INGOT = 5, T_CORE = 6;

  function shadeFace(f, nx, ny, nz, cx, cyy, cz) {
    var mat = MAT[f.m];
    var d = nx * LX + ny * LY + nz * LZ;
    if (d < 0) d = 0;
    var r = mat.base[0] + mat.gain[0] * d;
    var g = mat.base[1] + mat.gain[1] * d;
    var b = mat.base[2] + mat.gain[2] * d;

    /* Les sources ponctuelles, en 1/d². C'est cette décroissance, et pas un
       dégradé posé sur la surface, qui fait que la machine a un intérieur. */
    for (var k = 0; k < LIGHTS.length; k++) {
      var L = LIGHTS[k];
      var dx = L.x - cx, dy = L.y - cyy, dz = L.z - cz;
      var dd = dx * dx + dy * dy + dz * dz;
      var dl = Math.sqrt(dd) || 1;
      var fac = (nx * dx + ny * dy + nz * dz) / dl;
      if (fac <= 0) continue;
      var e = fac * mat.lit * L.p * L.on / (0.36 + dd * 1.35);
      if (e > 0.9) e = 0.9;
      r += L.c[0] * e * 0.5; g += L.c[1] * e * 0.5; b += L.c[2] * e * 0.5;
    }

    /* Rasance : les faces vues de biais reprennent un peu de lumière. Ce sont
       les arêtes du volume, et c'est ce qui sauve un rendu à faces plates. */
    var vl = Math.sqrt(cx * cx + cyy * cyy + cz * cz) || 1;
    var fr = 1 - Math.abs((nx * cx + ny * cyy + nz * cz) / vl);
    fr *= fr * fr;
    r += 21 * fr; g += 27 * fr; b += 28 * fr;
    return [r, g, b];
  }

  function byDepth(a, b) { return b.z - a.z; }

  function drawScene(t) {
    var i, j, n, k, e;

    /* ── les sommets de la machine, projetés une fois ── */
    n = BV.length / 3;
    for (i = 0; i < n; i++) {
      toView(BV[i * 3], BV[i * 3 + 1], BV[i * 3 + 2]);
      k = FOC / vz;
      pX[i] = CX + vx * k;
      pY[i] = CY - vy * k;
      pZ[i] = vz;
    }

    /* ── les deux sources ponctuelles, en repère caméra ── */
    coreOn = 0.45 + charge * 0.85 + Math.sin(t * 1.9) * 0.05;
    toView(0, M.coreY, 0);
    coreVZ = vz;
    LIGHTS[0].x = vx; LIGHTS[0].y = vy; LIGHTS[0].z = vz; LIGHTS[0].on = coreOn;
    var ck = FOC / vz, coreSX = CX + vx * ck, coreSY = CY - vy * ck;
    toView(0, M.hopBot + 0.1, 0);
    LIGHTS[1].x = vx; LIGHTS[1].y = vy; LIGHTS[1].z = vz; LIGHTS[1].on = 1;
    var tk = FOC / vz, thSX = CX + vx * tk, thSY = CY - vy * tk;

    /* ── remplissage de la liste ── */
    RN = 0;

    for (i = 0; i < BF.length; i++) {
      var f = BF[i];
      rotVec(f.nx, f.ny, f.nz);
      var nvx = vx, nvy = vy, nvz = vz;
      toView(f.cx, f.cy, f.cz);
      if (vz < 0.8) continue;
      /* Une face est visible quand sa normale s'oppose au rayon qui va de
         l'œil vers son centre. Normale et centre sont calculés à la
         construction : il n'y a par image qu'une rotation et un point. */
      if (nvx * vx + nvy * vy + nvz * vz >= 0) continue;
      f._c = shadeFace(f, nvx, nvy, nvz, vx, vy, vz);
      e = slot(); e.t = T_FACE; e.i = i; e.z = vz;
    }

    for (i = 0; i < dust.length; i++) {
      var p = dust[i];
      toView(p.x, p.y, p.z);
      if (vz < 1.2) continue;
      k = FOC / vz;
      var dx2 = CX + vx * k, dy2 = CY - vy * k;
      if (dx2 < -8 || dx2 > W + 8 || dy2 < -8 || dy2 > H + 8) continue;
      /* atténuation en profondeur : le fond du champ s'éteint */
      var dep = 1 - (vz - CAM_D + M.cloudHalf) / (M.cloudHalf * 2) * 0.55;
      var da = p.a * dep * (p.out ? Math.max(0, 1 - (p.out - 0.5) / 2.1) * 0.5 : 1) * 0.75;
      if (da <= 0.006) continue;
      e = slot(); e.t = T_DUST; e.i = i; e.z = vz;
      e.x = dx2; e.y = dy2; e.a = da;
      e.k = (0.9 + 1.5 * (CAM_D / vz)) * SCALE;
    }

    for (i = 0; i < sparks.length; i++) {
      var sp = sparks[i];
      toView(sp.x, sp.y, sp.z);
      if (vz < 1.2) continue;
      k = FOC / vz;
      e = slot(); e.t = T_SPARK; e.i = i; e.z = vz - 0.02;
      e.x = CX + vx * k; e.y = CY - vy * k; e.k = k;
    }

    for (i = 0; i < motes.length; i++) {
      var mo = motes[i];
      toView(mo.x, mo.y, mo.z);
      if (vz < 1.2) continue;
      k = FOC / vz;
      e = slot(); e.t = T_MOTE; e.i = i; e.z = vz;
      e.x = CX + vx * k; e.y = CY - vy * k; e.k = k;
    }

    for (i = 0; i < forms.length; i++) {
      toView(0, forms[i].y, 0);
      e = slot(); e.t = T_FORM; e.i = i; e.z = vz;
    }

    for (i = 0; i < ingots.length; i++) {
      toView(0, ingotY(i), 0);
      e = slot(); e.t = T_INGOT; e.i = i; e.z = vz;
    }

    e = slot(); e.t = T_CORE; e.z = coreVZ; e.x = coreSX; e.y = coreSY; e.k = ck;

    RL.length = Math.max(RL.length, RN);
    var list = RL.slice(0, RN);
    list.sort(byDepth);

    /* ── la peinture, du fond vers l'avant ── */
    ctx.globalCompositeOperation = "lighter";
    halo(thSX, thSY, M.hopRBot * tk * 3.2, 0.13);
    ctx.globalCompositeOperation = "source-over";
    ctx.lineJoin = "round";

    for (i = 0; i < list.length; i++) {
      e = list[i];
      switch (e.t) {
        case T_FACE: paintFace(BF[e.i]); break;
        case T_DUST: paintDust(e); break;
        case T_SPARK: paintSpark(sparks[e.i], e); break;
        case T_MOTE: paintMote(motes[e.i], e); break;
        case T_FORM: paintForm(forms[e.i]); break;
        case T_INGOT: paintIngot(e.i); break;
        case T_CORE: paintCore(e, t); break;
      }
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  function paintFace(f) {
    var vv = f.v, col = f._c, j;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(pX[vv[0]], pY[vv[0]]);
    for (j = 1; j < vv.length; j++) ctx.lineTo(pX[vv[j]], pY[vv[j]]);
    ctx.closePath();
    ctx.fillStyle = rgba(col[0], col[1], col[2], 1);
    ctx.fill();
    /* Le liseré. Sans lui, un rendu à faces plates s'affaisse en taches ;
       avec lui, il est usiné. Il n'est pas d'une couleur à part : c'est
       l'aplat de la face, multiplié — donc une arête reste sombre dans
       l'ombre, et ne dessine pas un fil de fer sur un objet noir. */
    var ed = MAT[f.m].edge;
    ctx.lineWidth = Math.max(0.6, 0.8 * SCALE);
    ctx.strokeStyle = rgba(col[0] * ed + 3, col[1] * ed + 4, col[2] * ed + 4, 0.75);
    ctx.stroke();
  }

  function paintDust(e) {
    ctx.globalCompositeOperation = "lighter";
    glow(SP_DUST, e.x, e.y, e.k, e.a);
    ctx.globalAlpha = 1;
  }

  /* Un refus. Le grain a touché la paroi : le métal s'allume à l'endroit exact
     du contact et s'éteint en quatre dixièmes de seconde. C'est le seul
     compteur du panneau, et il compte juste — il compte de vrais grains, et le
     rapport de ce qui passe vient de la géométrie de la trémie. */
  function paintSpark(sp, e) {
    var u = sp.t / Q.spark;
    var a = sp.a * (1 - u) * (1 - u);
    ctx.globalCompositeOperation = "lighter";
    halo(e.x, e.y, (4.5 + u * 8) * SCALE, a * 0.62);
    glow(SP_CORE, e.x, e.y, 2 * SCALE, a * 0.9);
    ctx.globalAlpha = 1;
  }

  function paintMote(mo, e) {
    var u = mo.u || 0;
    ctx.globalCompositeOperation = "lighter";
    glow(SP_CORE, e.x, e.y, (1 + u * 1.5) * SCALE, 0.2 + u * 0.55);
    ctx.globalAlpha = 1;
  }

  /* ─────────── l'octaèdre, en faces pleines ───────────
     Le foyer et la pièce sont le même solide. Ils ne sont pas dessinés au
     trait : un fil de fer, c'est l'aspect « ressource de jeu vidéo » qu'on
     essaie d'éviter depuis le début. Les huit faces sont peintes, en mélange
     additif, d'autant plus claires qu'elles font face — une facette de biais
     rase la lumière, une facette de face la renvoie. Le métal en fusion se
     comporte comme ça. */
  var OX = [], OY = [], OZ = [];

  function octa(cyw, r, sq, rot, inten, hot) {
    var i, j, c = Math.cos(rot), s = Math.sin(rot);
    OX.length = 0; OY.length = 0; OZ.length = 0;
    for (i = 0; i < 4; i++) {
      var ang = i / 4 * 6.283185;
      var X = Math.cos(ang) * r, Z = Math.sin(ang) * r;
      OX.push(X * c - Z * s); OY.push(cyw); OZ.push(X * s + Z * c);
    }
    OX.push(0); OY.push(cyw + r * 1.3 * sq); OZ.push(0);
    OX.push(0); OY.push(cyw - r * 1.3 * sq); OZ.push(0);

    var sx = [], sy = [], sz = [];
    for (i = 0; i < 6; i++) {
      toView(OX[i], OY[i], OZ[i]);
      var kk = FOC / vz;
      sx.push(CX + vx * kk); sy.push(CY - vy * kk); sz.push(vz);
    }

    ctx.globalCompositeOperation = "lighter";
    ctx.lineJoin = "round";
    for (i = 0; i < 4; i++) {
      j = (i + 1) % 4;
      for (var apex = 4; apex <= 5; apex++) {
        /* normale de la facette, en repère caméra */
        var ax = OX[j] - OX[i], ay = OY[j] - OY[i], az = OZ[j] - OZ[i];
        var bx = OX[apex] - OX[j], by = OY[apex] - OY[j], bz = OZ[apex] - OZ[j];
        var nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
        rotVec(nx, ny, nz);
        var nl = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
        var fx = vx / nl, fy = vy / nl, fz = vz / nl;
        toView((OX[i] + OX[j]) / 3, (OY[i] + OY[j] + OY[apex]) / 3, (OZ[i] + OZ[j]) / 3);
        var cl = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
        var face = -(fx * vx + fy * vy + fz * vz) / cl;
        if (face <= 0) continue;
        var w = Math.pow(face, 1.5);
        ctx.beginPath();
        ctx.moveTo(sx[i], sy[i]);
        ctx.lineTo(sx[j], sy[j]);
        ctx.lineTo(sx[apex], sy[apex]);
        ctx.closePath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = rgba(
          hot[0] * (0.22 + w * 0.7) * inten,
          hot[1] * (0.22 + w * 0.7) * inten,
          hot[2] * (0.22 + w * 0.7) * inten, 1);
        ctx.fill();
        ctx.lineWidth = Math.max(0.6, 0.8 * SCALE);
        ctx.strokeStyle = rgba(hot[0], hot[1], hot[2], 0.26 * inten * (0.4 + w));
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function paintCore(e, t) {
    ctx.globalCompositeOperation = "lighter";
    halo(e.x, e.y, M.coreR * e.k * 6, 0.16 + coreOn * 0.2);
    glow(SP_CORE, e.x, e.y, M.coreR * e.k * 1.25, 0.34 + coreOn * 0.34);
    octa(M.coreY, M.coreR, 1, t * 0.5, 0.55 + coreOn * 0.45, C_HI);
    ctx.globalAlpha = 1;
  }

  /* La pièce forgée : le même solide, plus froid que le foyer, qui s'écrase en
     se posant. Elle ne disparaît pas, elle devient le lingot. */
  function paintForm(f) {
    var r = M.coreR * 0.72 * f.s;
    var sq = 1 - (f.lay || 0) * 0.8;
    toView(0, f.y, 0);
    var k = FOC / vz, sx = CX + vx * k, sy = CY - vy * k;
    ctx.globalCompositeOperation = "lighter";
    halo(sx, sy, r * k * 3.6, 0.16 * f.s);
    glow(SP_CORE, sx, sy, r * k * 1.05, 0.34 * f.s);
    octa(f.y, r, sq, f.rot, 0.8 * f.s, C_ACC);
    ctx.globalAlpha = 1;
  }

  /* ─────────── les lingots ───────────
     Ce que le client a signé. Ils s'empilent dans le lamage du socle, le
     dernier arrivé le plus clair, et le plus ancien sort par le bas. Deux
     aplats très sombres et un liseré : ce sont des plaques de métal, pas des
     jetons lumineux. La lumière qu'ils portent est celle qu'ils viennent de
     recevoir, et elle s'éteint en une seconde et demie. */
  function ingotY(i) {
    return M.plinthBoreY + 0.012 + i * M.ingotPitch + (ingots[i].drop || 0);
  }

  function paintIngot(i) {
    var g = ingots[i], n = 8, j;
    var yb = ingotY(i), yt = yb + M.ingotH;
    var rr = M.ingotR * (0.62 + 0.38 * Math.min(1, g.t / 0.3));
    var young = Math.max(0, 1 - g.t / 1.5);
    var al = (0.34 + young * 0.45) * (1 - (i / M.ingotMax) * 0.26);

    var up = [], lo = [];
    for (j = 0; j < n; j++) {
      var ang = (j + 0.5) / n * 6.283185;
      var X = Math.cos(ang) * rr, Z = Math.sin(ang) * rr;
      toView(X, yt, Z);
      var k1 = FOC / vz; up.push(CX + vx * k1, CY - vy * k1);
      toView(X, yb, Z);
      var k2 = FOC / vz; lo.push(CX + vx * k2, CY - vy * k2);
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(lo[0], lo[1]);
    for (j = 1; j < n; j++) ctx.lineTo(lo[j * 2], lo[j * 2 + 1]);
    for (j = n - 1; j >= 0; j--) ctx.lineTo(up[j * 2], up[j * 2 + 1]);
    ctx.closePath();
    ctx.fillStyle = rgba(C_ACC[0] * 0.14, C_ACC[1] * 0.15, C_ACC[2] * 0.15, 1);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(up[0], up[1]);
    for (j = 1; j < n; j++) ctx.lineTo(up[j * 2], up[j * 2 + 1]);
    ctx.closePath();
    ctx.fillStyle = rgba(C_ACC[0] * (0.2 + al * 0.4), C_ACC[1] * (0.2 + al * 0.4),
                         C_ACC[2] * (0.2 + al * 0.4), 1);
    ctx.fill();
    ctx.lineWidth = Math.max(0.6, 0.8 * SCALE);
    ctx.strokeStyle = rgba(C_HI[0], C_HI[1], C_HI[2], 0.18 + al * 0.5);
    ctx.stroke();

    if (young > 0.02) {
      ctx.globalCompositeOperation = "lighter";
      toView(0, yt, 0);
      var k3 = FOC / vz;
      halo(CX + vx * k3, CY - vy * k3, rr * k3 * 2.6, young * 0.22);
      ctx.globalAlpha = 1;
    }
  }
  /* ═══════════ 6. LA BOUCLE ═══════════ */
  var raf = 0, last = 0, clock = 0, live = false;

  function render(dt) {
    clock += dt;
    /* Oscillation lente, et deux périodes qui ne tombent jamais juste : la
       machine ne repasse pas deux fois par la même image. */
    setAngles(YAW0 + Math.sin(clock * 0.2417) * YAW_A,
              PITCH + Math.sin(clock * 0.1613) * 0.02);

    stepDust(dt, clock);
    stepSparks(dt);
    stepMotes(dt);
    stepForms(dt);
    stepIngots(dt);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawScene(clock);
  }

  var watch = 0, watchN = 0;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = (now - last) / 1000;
    last = now;
    if (!(dt > 0)) return;
    if (dt > 0.05) dt = 0.05;   /* un onglet qui revient ne téléporte pas la scène */
    render(dt);

    /* Moyenne glissante sur quarante-cinq images. Les deux premières secondes
       ne comptent pas : le premier rendu compile ses chemins, et l'ouverture
       de la page tourne encore. */
    if (clock < 2) return;
    watch += dt; watchN++;
    if (watchN < 45) return;
    var avg = watch / watchN;
    watch = 0; watchN = 0;
    if (avg > 0.026 && tier < TIERS.length - 1) {
      tier++; Q = TIERS[tier];
      if (measure()) seedAll();
    }
  }

  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  if (!measure()) return;
  seedAll();

  if (calm) {
    /* Mouvement réduit : on avance la scène à vide jusqu'à un état qui dit
       quelque chose — la trémie pleine, une pièce en chemin, des lingots
       posés — puis on rend une seule image et on s'arrête là. */
    for (var w = 0; w < 1100; w++) render(0.033);
    return;
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      live = es[0].isIntersecting;
      if (live && !document.hidden) start(); else stop();
    }, { threshold: 0.03 }).observe(fig);
  } else { live = true; start(); }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else if (live) start();
  });

  var pending = 0;
  function resized() {
    if (pending) return;
    pending = requestAnimationFrame(function () {
      pending = 0;
      if (measure()) seedAll();
    });
  }
  if ("ResizeObserver" in window) new ResizeObserver(resized).observe(fig);
  else window.addEventListener("resize", resized, { passive: true });
})();
