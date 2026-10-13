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
  const fmt = v => String(Math.floor(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
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

  /* ---------- Héros : la liste des rendez-vous se remplit, un par un ---------- */
  const appL = $('#appL');
  if (appL && !still) {
    const rows = [...appL.children], toast = $('#toast'), toastT = $('#toastT'), appN = $('#appN');
    const textes = ['Mardi 10:00 · bureau d\u2019études, Lyon', 'Mercredi 14:30 · éditeur SaaS, Nantes', 'Jeudi 09:00 · ESN, Lille', 'Vendredi 11:30 · cabinet RH, Bordeaux'];
    let k = 0, timer = 0, vis = false;
    // le plus récent s'insère en haut : on les fait arriver du dernier au premier
    const vider = () => { rows.forEach(r => r.remove()); k = 0; appN.textContent = '0'; };
    const pas = () => {
      if (!vis) return;
      if (k < rows.length) {
        const i = rows.length - 1 - k, r = rows[i];
        rows.forEach(x => x.classList.remove('sel'));
        r.classList.add('sel', 'neuf'); appL.prepend(r);
        r.addEventListener('animationend', () => r.classList.remove('neuf'), { once: true });
        toastT.textContent = textes[i]; appN.textContent = ++k;
        $('.af-t').textContent = r.dataset.t; $('.af-m').innerHTML = r.dataset.m; $('.app-fiche blockquote').textContent = '\u00ab\u202f' + r.dataset.q + '\u202f\u00bb';
        $('.app-fiche').animate([{ opacity: .3 }, { opacity: 1 }], { duration: 500, easing: 'cubic-bezier(.2,0,0,1)' });
        toast.classList.remove('on'); void toast.offsetWidth; toast.classList.add('on');
        timer = setTimeout(pas, 1100);
      } else {
        toast.classList.remove('on');
        timer = setTimeout(() => { vider(); timer = setTimeout(pas, 350); }, 2600);
      }
    };
    // la liste reste pleine tant que la boucle n'a pas démarré : jamais d'écran vide
    let parti = false;
    new IntersectionObserver(([e]) => {
      vis = e.isIntersecting; clearTimeout(timer);
      if (vis) timer = setTimeout(() => { if (!parti) { parti = true; vider(); } pas(); }, parti ? 300 : 700);
    }).observe(appL.closest('.app'));
  }


  /* ---------- Héros : les faisceaux ----------
     Une réponse part d'un prospect et file vers Leadcore (gris). Environ deux
     sur cinq sont qualifiées : la carte vire à l'or, un faisceau d'or part vers
     l'agenda et un créneau se remplit. Agenda plein : il se vide et recommence. */
  const beam = $('#beam');
  if (beam && !still) {
    const NS = 'http://www.w3.org/2000/svg', svg = $('.beam-svg', beam), noyau = $('.bm-noyau', beam), ag = $('.bm-agenda', beam);
    const pros = [...beam.querySelectorAll('.bm-pros li')], cells = [...$('#bmG').children], N = $('#bmN'), T = $('#bmT');
    const ordre = [6, 1, 12, 8, 3, 10, 14, 0, 5, 11, 2, 9, 13, 4, 7];
    const JOURS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.'], HEURES = ['09:00', '11:30', '15:00'];
    const VIVIER = [['IN', 'Directeur des opérations', 'Industriel · Rennes'], ['AG', 'Fondatrice', 'Agence web · Paris'], ['LO', 'Directeur commercial', 'Logistique · Lyon'], ['CA', 'Associé', "Cabinet d'avocats · Nice"], ['FO', 'Directrice', 'Organisme de formation · Lille'], ['IM', 'Gérant', 'Promoteur · Toulouse'], ['SE', 'Directeur général', 'Sécurité privée · Marseille'], ['ED', 'CEO', 'Éditeur SaaS · Grenoble'], ['CO', 'Dirigeant', 'Conseil IT · Strasbourg'], ['TR', 'Directrice', 'Transport · Nantes']];
    let rails = [], sortie = '', rempli = 4, v = 0, vis = false, timer = 0;
    const occupe = new Set();
    const tracer = () => {
      const b = beam.getBoundingClientRect(), c = noyau.getBoundingClientRect(), g = ag.getBoundingClientRect();
      const cx = c.left - b.left, cy = c.top + c.height / 2 - b.top;
      const courbe = (x1, y1, x2, y2) => `M${x1} ${y1}C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`;
      rails = pros.map(li => { const r = li.getBoundingClientRect(); return courbe(r.right - b.left, r.top + r.height / 2 - b.top, cx, cy); });
      sortie = courbe(cx + c.width, cy, g.left - b.left, g.top + g.height / 2 - b.top);
      svg.innerHTML = [...rails, sortie].map(d => `<path class="bm-rail" d="${d}"/>`).join('');
    };
    const tir = (d, cls, ms) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d); p.setAttribute('pathLength', '1'); p.setAttribute('class', 'bm-trait ' + cls); svg.append(p);
      return p.animate([{ strokeDashoffset: .22 }, { strokeDashoffset: -1 }], { duration: ms, easing: 'cubic-bezier(.5,0,.25,1)' }).finished.then(() => p.remove());
    };
    const renouveler = li => {
      const [i, r, c] = VIVIER[v++ % VIVIER.length];
      li.querySelector('.av').textContent = i; li.querySelector('.who').innerHTML = `<b>${r}</b>${c}`;
      li.classList.remove('chg'); void li.offsetWidth; li.classList.add('chg');
    };
    const poser = li => {
      if (rempli >= cells.length) return;
      const n = ordre[rempli++], cell = cells[n];
      cell.textContent = li.querySelector('.av').textContent; cell.classList.add('on', 'neuf');
      N.textContent = rempli;
      T.textContent = `${JOURS[n % 5]} ${HEURES[Math.floor(n / 5)]} · ${li.querySelector('.who').lastChild.textContent.replace(' · ', ', ')}`;
      T.classList.remove('chg'); void T.offsetWidth; T.classList.add('chg');
      if (rempli === cells.length) setTimeout(() => { cells.forEach(x => { x.className = ''; x.textContent = ''; }); rempli = 0; N.textContent = 0; }, 2200);
    };
    const reponse = async () => {
      const libres = pros.map((_, i) => i).filter(i => !occupe.has(i));
      if (!libres.length) return;
      const i = libres[Math.floor(Math.random() * libres.length)], li = pros[i];
      occupe.add(i); li.classList.add('lit');
      await tir(rails[i], 'gris', 1200);
      li.classList.remove('lit');
      noyau.classList.remove('pouls'); void noyau.offsetWidth; noyau.classList.add('pouls');
      const ok = Math.random() < .42;
      li.classList.add(ok ? 'ok' : 'non');
      if (ok) { await tir(sortie, 'or', 900); poser(li); } else await new Promise(r => setTimeout(r, 700));
      await new Promise(r => setTimeout(r, 500));
      li.classList.remove('ok', 'non'); renouveler(li); occupe.delete(i);
    };
    const boucle = () => { if (!vis) return; reponse(); timer = setTimeout(boucle, 750); };
    new ResizeObserver(tracer).observe(beam);
    document.fonts && document.fonts.ready.then(tracer);
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; clearTimeout(timer); if (vis) timer = setTimeout(boucle, 600); }).observe(beam);
  }

  /* ---------- Comment ça marche : l'écran suit la position dans la section ---------- */
  const cmt = $('#comment');
  if (cmt && !still) {
    const ecrans = [...cmt.querySelectorAll('.ecran')], etapes = [...cmt.querySelectorAll('.cmt-steps li')];
    let cur = -1, raf = 0, vis = false;
    const montrer = i => {
      if (i === cur) return; cur = i;
      ecrans.forEach((e, k) => { e.classList.toggle('on', k === i); e.classList.toggle('passe', k < i); });
      etapes.forEach((e, k) => e.classList.toggle('on', k === i));
    };
    const tick = () => {
      if (innerWidth <= 900) return; // sous 900 px les trois écrans s'empilent, rien à piloter
      const r = cmt.getBoundingClientRect(), p = cl(-r.top / (r.height - innerHeight));
      montrer(p < .34 ? 0 : p < .67 ? 1 : 2);
      if (vis) raf = requestAnimationFrame(tick);
    };
    montrer(0);
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; cancelAnimationFrame(raf); if (vis) raf = requestAnimationFrame(tick); }).observe(cmt);
  }

  if (still) return;

  /* ---------- Montants : ils montent puis se figent ---------- */
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
  document.querySelectorAll('#chiffres .cf-g').forEach(g => [...g.children].forEach((el, i) => el.style.setProperty('--i', el.classList.contains('o') || !g.classList.contains('cal') ? i : 0)));
  ['chiffres', 'rien', 'semaines', 'gantt', 'conditions', 'deux', 'barres', 'phases', 'mal1', 'mal2', 'mal3'].forEach(id => {
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
