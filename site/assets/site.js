/* Leadcore — script commun du site, révision 2. Mouvement : brand/BRANDKIT.md §8.
   Règles tenues : transform et opacity seulement côté DOM ; chaque boucle rAF
   s'arrête quand sa section sort de l'écran ; sous mouvement réduit, rien ne
   bouge et chaque élément est dans son état final. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tok = (n, d) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || d;
  const C = { dust: tok('--trait', '#25282B'), lit: tok('--cendre', '#8E9398'), or: tok('--or', '#C7A462'), hi: tok('--or-hi', '#D9BC82') };
  const ease = t => 1 - Math.pow(1 - t, 4);
  const cl = v => Math.min(Math.max(v, 0), 1);
  const ss = (a, b, v) => { const t = cl((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const once = (el, fn, threshold = .35) => el && new IntersectionObserver(([e], o) => { if (e.isIntersecting) { fn(); o.disconnect(); } }, { threshold }).observe(el);
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
  const fit = canvas => {
    const r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2), ctx = canvas.getContext('2d');
    canvas.width = r.width * d; canvas.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    return { ctx, W: r.width, H: r.height };
  };

  /* Adresse de contact : un seul endroit, config.js */
  const mail = window.LEADCORE_CONTACT && window.LEADCORE_CONTACT.email;
  if (mail) document.querySelectorAll('[data-email],[data-contact-email]').forEach(a => {
    a.href = 'mailto:' + mail;
    if (a.hasAttribute('data-email') || a.hasAttribute('data-contact-email-text')) a.textContent = mail;
  });

  /* En-tête : transparent sur le héros, plein dès qu'on descend */
  const hdr = $('#hdr'), sentinelle = document.createElement('div');
  sentinelle.style.cssText = 'position:absolute;top:0;height:24px;width:1px';
  document.body.prepend(sentinelle);
  new IntersectionObserver(([e]) => hdr.classList.toggle('plein', !e.isIntersecting)).observe(sentinelle);

  /* ---------- Héros : la transmutation en boucle ----------
     ponytail: Canvas 2D, ~600 points ; WebGL seulement au-delà de ~5 000. */
  const field = $('#field');
  const exemples = [
    ['Mardi 10:00 — email, 3ᵉ touche', "Dirigeant, bureau d'études thermiques, 25 salariés, Lyon"],
    ['Mercredi 14:30 — LinkedIn, 2ᵉ message', 'Directrice commerciale, éditeur SaaS B2B, 60 salariés, Nantes'],
    ['Jeudi 09:00 — email, 4ᵉ touche', 'Directeur général, ESN, 120 salariés, Lille'],
    ['Vendredi 11:30 — LinkedIn, visite puis message', 'Directeur associé, cabinet de conseil RH, 12 salariés, Bordeaux']
  ];
  if (field) {
    let g, pts = [], cible, t0 = 0, raf = 0, vis = false, trouve = false, n = 0;
    const capA = $('#capA'), capB = $('#capB'), GAP = 22;
    const choisir = () => {
      const pool = pts.filter(p => p.x > g.W * .3 && p.x < g.W * .9 && p.y > g.H * .14 && p.y < g.H * .62);
      cible = pool[Math.floor(Math.random() * pool.length)] || pts[0];
    };
    const taille = () => {
      g = fit(field); pts = [];
      for (let y = GAP / 2; y < g.H; y += GAP) for (let x = GAP / 2; x < g.W; x += GAP) pts.push({ x, y, ph: Math.random() * 6.283 });
      choisir();
    };
    const image = now => {
      const { ctx, W, H } = g, t = (now - t0) / 1000, f = cl((t - 1.6) / .7);
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        if (p === cible) continue;
        const d = Math.hypot(p.x - cible.x, p.y - cible.y);
        const onde = f > 0 ? Math.max(0, 1 - Math.abs(d - f * 260) / 34) * (1 - f) : 0;
        const fr = Math.max(0, Math.sin(p.ph + t * 2.4)) ** 14 * (1 - f * .9);
        ctx.fillStyle = fr > .4 || onde > .3 ? C.lit : C.dust;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      }
      ctx.fillStyle = f ? C.or : C.dust;
      ctx.beginPath(); ctx.arc(cible.x, cible.y, f ? 1 + 3.5 * ease(f) : 1, 0, 6.283); ctx.fill();
      const ring = cl((t - 1.85) / 1.1);
      if (ring > 0 && ring < 1) { // l'anneau s'ouvre une fois, ouvert en bas comme celui du logo
        ctx.strokeStyle = C.hi; ctx.globalAlpha = (1 - ring) * .9; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cible.x, cible.y, 8 + 36 * ease(ring), 2.25, 7.17); ctx.stroke(); ctx.globalAlpha = 1;
      }
      if (f >= 1 && !trouve) {
        trouve = true;
        if (n++ > 0) { // le premier exemple est déjà dans le HTML
          const [a, b] = exemples[(n - 1) % exemples.length];
          capA.textContent = a; capB.textContent = b;
          [capA, capB].forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 640, delay: i * 80, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'backwards' }));
        }
      }
      if (t > 7.2) { choisir(); t0 = now; trouve = false; }
      if (vis && !still) raf = requestAnimationFrame(image);
    };
    const jouer = () => { cancelAnimationFrame(raf); t0 = performance.now() - (still ? 4000 : 0); raf = requestAnimationFrame(image); };
    new ResizeObserver(() => { taille(); jouer(); }).observe(field);
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; vis ? jouer() : cancelAnimationFrame(raf); }).observe(field);
  }

  /* ---------- Transmutation épinglée : 1 900 → 120 → 12 ----------
     La progression vient de la position de la section, lue une fois par
     image tant qu'elle est à l'écran ; on ne redessine que si elle a bougé. */
  const tm = $('#transmutation'), tc = $('#tmCanvas');
  if (tm && tc && !still && getComputedStyle(tc).display !== 'none') {
    const N = 1900, REP = 120, RDV = 12;
    const rang = [...Array(N).keys()].sort(() => Math.random() - .5);
    const etapes = [...tm.querySelectorAll('.tm-step')], prog = [...tm.querySelectorAll('.tm-prog li')];
    const LIT = hex(C.lit), DUST = hex(C.dust), OR = hex(C.or);
    let g, pts = [], vis = false, raf = 0, avant = -1, cur = -1;
    const taille = () => {
      g = fit(tc);
      const etroit = g.W < 700;
      const x0 = etroit ? g.W * .06 : g.W * .44, x1 = g.W * .95, y0 = g.H * (etroit ? .16 : .15), y1 = g.H * (etroit ? .96 : .85);
      const aw = x1 - x0, ah = y1 - y0, pas = Math.sqrt(aw * ah / N);
      const cols = Math.max(1, Math.floor(aw / pas)), rows = Math.ceil(N / cols), gx = aw / cols, gy = ah / rows;
      pts = rang.map((r, i) => ({ x: x0 + (i % cols + .5) * gx, y: y0 + (Math.floor(i / cols) + .5) * gy, r }));
      avant = -1;
    };
    const dessiner = p => {
      const { ctx, W, H } = g;
      const a = ss(.2, .36, p), b = ss(.56, .72, p), ring = cl((p - .72) / .14);
      ctx.clearRect(0, 0, W, H);
      for (const q of pts) {
        if (q.r < RDV) continue;
        const t = q.r >= REP ? a : b;          // ce qui ne répond pas s'éteint, puis ce qui ne devient pas un RDV
        const s = q.r >= REP ? 1.1 : 1.1 + .5 * a * (1 - b);
        ctx.fillStyle = mix(LIT, DUST, .15 + .85 * t);
        ctx.fillRect(q.x - s, q.y - s, s * 2, s * 2);
      }
      for (const q of pts) {
        if (q.r >= RDV) continue;
        ctx.fillStyle = mix(LIT, OR, b);
        ctx.beginPath(); ctx.arc(q.x, q.y, 1.4 + .5 * a + 2.6 * ease(b), 0, 6.283); ctx.fill();
        if (ring > 0 && ring < 1) {
          ctx.strokeStyle = C.hi; ctx.globalAlpha = 1 - ring; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(q.x, q.y, 6 + 18 * ease(ring), 2.25, 7.17); ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
    };
    const etape = p => {
      const i = p < .44 ? 0 : p < .78 ? 1 : 2;
      if (i === cur) return;
      cur = i;
      etapes.forEach((e, k) => { e.classList.toggle('on', k === i); e.classList.toggle('passe', k < i); e.setAttribute('aria-hidden', k !== i); });
      prog.forEach((l, k) => { l.classList.toggle('on', k === i); l.classList.toggle('fait', k <= i); });
    };
    const tick = () => {
      const r = tm.getBoundingClientRect();
      const p = cl(-r.top / (r.height - innerHeight));
      if (Math.abs(p - avant) > .0004) { dessiner(p); etape(p); avant = p; }
      if (vis) raf = requestAnimationFrame(tick);
    };
    taille(); etape(0);
    new ResizeObserver(taille).observe(tc);
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; cancelAnimationFrame(raf); if (vis) raf = requestAnimationFrame(tick); }).observe(tm);
  }

  if (still) return;

  /* ---------- Montants : ils montent puis se figent ---------- */
  const fmt = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  document.querySelectorAll('.cnt').forEach(el => once(el, () => {
    const t0 = performance.now(), fin = +el.dataset.to;
    const pas = now => {
      const k = ease(cl((now - t0) / 1100));
      el.textContent = fmt(Math.round(fin * k));
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }, .6));

  /* ---------- Fiche : les quatre conditions se cochent, puis le montant ---------- */
  const fiche = $('#fiche');
  if (fiche) {
    fiche.querySelectorAll('.fiche-ok li').forEach((li, i) => li.style.setProperty('--i', i));
    once(fiche, () => fiche.classList.add('go'), .5);
  }

  /* ---------- Registre : les lignes s'écrivent ---------- */
  const reg = $('#reg');
  once(reg, () => [...reg.children].forEach((li, i) => li.animate(
    [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
    { duration: 640, delay: 200 + i * 130, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'backwards' })));

  /* ---------- Pictogrammes : tracés une fois ---------- */
  const ops = $('.ops');
  once(ops, () => ops.classList.add('go'), .25);

  /* ---------- Pages intérieures : entrées déclenchées une fois ---------- */
  document.querySelectorAll('.deux .pastilles i').forEach((el, i) => el.style.setProperty('--i', i));
  ['rien', 'semaines', 'gantt', 'conditions', 'deux', 'barres', 'phases'].forEach(id => {
    const el = document.getElementById(id);
    once(el, () => el.classList.add('go'), .35);
  });

  /* Schéma des deux canaux : les impulsions ne tournent que s'il est à l'écran */
  const schema = $('#schema');
  if (schema) new IntersectionObserver(([e]) => schema.classList.toggle('vu', e.isIntersecting)).observe(schema);

  /* Les six filtres : le sommaire suit la lecture */
  const liens = [...document.querySelectorAll('.filtres-nav a')];
  if (liens.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      liens.forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id));
    }), { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('.filtre').forEach(f => io.observe(f));
  }

  /* ---------- Lecture : chaque mot reçoit son rang, la feuille fait le reste ---------- */
  const lec = $('#lecture');
  if (lec && CSS.supports('animation-timeline: view()')) {
    let i = 0;
    const couper = node => [...node.childNodes].forEach(n => {
      if (n.nodeType !== 3) return couper(n);
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(w => {
        if (!w.trim()) return frag.append(w);
        const s = document.createElement('span'); s.textContent = w; s.style.setProperty('--i', i++); frag.append(s);
      });
      n.replaceWith(frag);
    });
    couper(lec);
  }
})();
