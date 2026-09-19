/* ═══════════════════════════════════════════════════════════════════════════
   Leadcore — comportements de la page
   ───────────────────────────────────────────────────────────────────────────
   Aucune dépendance. Trois règles tenues d'un bout à l'autre :

   1. Un seul écouteur de défilement et un seul écouteur de pointeur pour
      toute la page, tous les deux cadencés par requestAnimationFrame.
   2. On n'écrit que des transform, des opacity et des variables CSS. Jamais
      une largeur, une hauteur ni une position, qui forceraient un calcul de
      mise en page à chaque image.
   3. Les IntersectionObserver se débranchent dès qu'ils ont servi.

   Sans JavaScript la page reste complète et lisible : tout ce qui est masqué
   au départ l'est par une règle préfixée .js, et cette classe est posée par le
   script inline du <head>.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ─────────── 1. séquence d'ouverture ───────────
     Elle ne se joue que quand elle a du sens :
       - jamais sous prefers-reduced-motion ;
       - une seule fois par session, pour ne pas punir la navigation ;
       - jamais sur une ancre profonde, un visiteur qui vise #tarifs ne doit
         pas attendre ;
       - jamais si la page est restaurée depuis le cache de navigation.
     Elle se coupe au premier geste, et se retire du DOM à la fin : aucune
     couche fixe ne reste au-dessus de la page.

     Coût assumé : l'ouverture couvre le héros pendant 2,4 s, donc elle
     repousse d'autant le Largest Contentful Paint de la première visite. */
  var intro = doc.getElementById("intro");
  var INTRO_MS = 1700;
  var seen = false;
  try { seen = sessionStorage.getItem("lc-intro") === "1"; } catch (e) {}

  /* Un visiteur qui arrive d'une campagne — email froid, LinkedIn — a déjà
     décidé de venir. Lui faire attendre l'ouverture avant le premier mot dépense
     son attention à l'endroit du parcours où elle coûte le plus cher, et c'est
     le public que ce site sert d'abord. L'ouverture est donc réservée à l'accès
     direct : celui qui tape l'adresse, ou qui revient. */
  var campagne = /[?&](utm_[a-z]+|c|ref|gclid|fbclid|li_fat_id|mc_[a-z]+)=/i
                   .test(window.location.search);

  var playIntro = intro && !calm && !seen && !campagne &&
    !window.location.hash &&
    !(window.performance && performance.getEntriesByType &&
      (performance.getEntriesByType("navigation")[0] || {}).type === "back_forward");

  var hero = doc.querySelector(".hero");

  var endIntro = function () {
    if (!intro) return;
    var el = intro;
    intro = null;
    el.parentNode && el.parentNode.removeChild(el);
    doc.documentElement.classList.remove("intro-on");
    if (hero && !calm) hero.classList.add("boot");
  };

  if (playIntro) {
    try { sessionStorage.setItem("lc-intro", "1"); } catch (e) {}
    doc.documentElement.classList.add("intro-on");
    intro.classList.add("go");

    var timer = setTimeout(endIntro, INTRO_MS);
    var skip = function () {
      clearTimeout(timer);
      endIntro();
    };
    /* le premier geste passe l'ouverture */
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (ev) {
      doc.addEventListener(ev, skip, { once: true, passive: true });
    });
  } else {
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    intro = null;
    if (hero && !calm) hero.classList.add("boot");
  }

  /* ─────────── 2. en-tête ───────────
     Se masque quand on descend, revient au premier geste vers le haut. */
  var hdr = doc.querySelector(".hdr");
  var nav = doc.getElementById("nav");
  var prog = doc.querySelector(".prog");

  /* La jauge de progression est calculée par le compositeur quand le navigateur
     sait faire (animation-timeline), et seulement sinon par ce script. */
  var progByCss = !calm && window.CSS && CSS.supports &&
    CSS.supports("animation-timeline: scroll(root block)");

  if (hdr) {
    var lastY = window.scrollY || 0;
    var hidden = false;
    var ticking = false;

    var onScroll = function () {
      var y = window.scrollY || 0;
      if (y < 0) y = 0;

      hdr.classList.toggle("is-stuck", y > 8);

      var menuOpen = nav && nav.classList.contains("open");
      var down = y > lastY + 2;
      var up = y < lastY - 2;

      if (!menuOpen && down && y > 240 && !hidden) {
        hdr.classList.add("is-hidden");
        hidden = true;
      } else if ((up || y <= 240 || menuOpen) && hidden) {
        hdr.classList.remove("is-hidden");
        hidden = false;
      }
      if (down || up) lastY = y;

      if (prog && !progByCss) {
        var span = doc.documentElement.scrollHeight - window.innerHeight;
        prog.style.transform = "scaleX(" + (span > 0 ? Math.min(1, y / span) : 0) + ")";
      }
    };

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { onScroll(); ticking = false; });
    }, { passive: true });
    onScroll();
  }

  /* ─────────── 3. menu mobile ─────────── */
  var toggle = doc.querySelector(".nav-toggle");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setOpen(false);
    }, { passive: true });
  }

  /* ─────────── 4. apparition au défilement ───────────
     Le décalage entre éléments voisins vient de --i, posé dans le HTML : la
     cascade est donc une affaire de CSS, le script ne fait que dire « visible ».

     Les compositions de page (section 30) sont observées elles aussi : sur les
     navigateurs qui savent cadencer une animation sur le défilement, .in ne
     sert qu'aux barres et aux traits ; sur les autres, c'est ce qui rend les
     blocs visibles. */
  var reveals = doc.querySelectorAll(
    ".rv, .pipe, .node, .chrono-b, .led, .duo .col, .vs .r, .band-c, .spine, " +
    ".flow, .railh, .stop, .pcell, .ratio");

  if (calm || !hasIO) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("in"); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revealIO.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(reveals, function (el) { revealIO.observe(el); });
  }

  /* ─────────── 4 bis. le défilé de l'accueil ───────────
     Une affirmation est active quand elle traverse le tiers médian de la
     fenêtre. Un seul observateur, aucun écouteur de défilement, et la marge
     racine fait tout le travail de sélection : ce qui est dans la bande est
     actif, le reste ne l'est pas.

     Sans JavaScript, le balisage porte déjà .on sur la première affirmation. */
  var defile = doc.querySelector(".defile");
  if (defile && hasIO) {
    var steps = defile.querySelectorAll(".dstep");
    var poser = function (i) {
      for (var k = 0; k < steps.length; k++) steps[k].classList.toggle("on", k === i);
    };
    var defIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = Array.prototype.indexOf.call(steps, e.target);
        if (i >= 0) poser(i);
      });
    }, { rootMargin: "-38% 0px -46% 0px", threshold: 0 });
    Array.prototype.forEach.call(steps, function (el) { defIO.observe(el); });
  }

  /* ─────────── 5. section courante dans la navigation ─────────── */
  var navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];
  if (hasIO && navLinks.length) {
    var byId = {};
    Array.prototype.forEach.call(navLinks, function (a) {
      byId[a.getAttribute("href").slice(1)] = a;
    });
    var visible = [];
    var markIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        var at = visible.indexOf(id);
        if (entry.isIntersecting && at === -1) visible.push(id);
        else if (!entry.isIntersecting && at !== -1) visible.splice(at, 1);
      });
      Array.prototype.forEach.call(navLinks, function (a) { a.removeAttribute("aria-current"); });
      var current = visible[visible.length - 1];
      if (current && byId[current]) byId[current].setAttribute("aria-current", "true");
    }, { rootMargin: "-25% 0px -55% 0px" });

    Object.keys(byId).forEach(function (id) {
      var sec = doc.getElementById(id);
      if (sec && sec.tagName === "SECTION") markIO.observe(sec);
    });
  }

  /* ─────────── 6. chiffres qui montent ───────────
     La valeur finale est déjà dans le HTML : sans script, ou sous
     prefers-reduced-motion, elle s'affiche telle quelle. La largeur est figée
     avant la première image pour qu'aucun chiffre ne fasse bouger sa ligne. */
  var counters = doc.querySelectorAll("[data-count]");

  if (!calm && hasIO && counters.length) {
    var ready = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();

    ready.then(function () {
      var plan = Array.prototype.map.call(counters, function (el) {
        var text = el.textContent.trim();
        var group = (text.match(/\d(\D)\d/) || [])[1] || "";
        return {
          el: el,
          text: text,
          group: group,
          target: parseInt(text.replace(/\D/g, ""), 10) || 0,
          w: 0
        };
      });

      /* une passe de lecture, puis une passe d'écriture : pas d'aller-retour
         entre calcul de mise en page et style */
      plan.forEach(function (p) { p.w = p.el.getBoundingClientRect().width; });
      plan.forEach(function (p) {
        p.el.style.display = "inline-block";
        p.el.style.minWidth = Math.ceil(p.w) + "px";
        p.el.setAttribute("aria-hidden", "false");
      });

      var fmt = function (n, group) {
        var s = String(n);
        if (!group || s.length < 4) return s;
        var out = "";
        for (var i = 0; i < s.length; i++) {
          if (i > 0 && (s.length - i) % 3 === 0) out += group;
          out += s.charAt(i);
        }
        return out;
      };

      var run = function (p) {
        var t0 = 0;
        var dur = 1000;
        var step = function (now) {
          if (!t0) t0 = now;
          var k = (now - t0) / dur;
          if (k >= 1) { p.el.textContent = p.text; return; }
          /* même courbe que --ease-out en CSS, pour que tout arrive ensemble */
          var e = 1 - Math.pow(1 - k, 3);
          p.el.textContent = fmt(Math.round(p.target * e), p.group);
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };

      var countIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var p = plan.filter(function (x) { return x.el === entry.target; })[0];
          if (p) run(p);
          countIO.unobserve(entry.target);
        });
      }, { threshold: 0.45 });

      plan.forEach(function (p) { countIO.observe(p.el); });
    });
  }

  /* ─────────── 7. les quatre conditions se valident ───────────
     Sur la fiche du héros : les cases passent au vert une par une. C'est la
     règle contractuelle jouée en quatre temps, pas un effet de plus. */
  var checks = doc.querySelector("[data-checks]");
  if (checks) {
    var items = checks.querySelectorAll("li");
    var tick = function () {
      Array.prototype.forEach.call(items, function (li, i) {
        setTimeout(function () { li.classList.add("ok"); }, 520 + i * 190);
      });
    };
    if (calm || !hasIO) {
      Array.prototype.forEach.call(items, function (li) { li.classList.add("ok"); });
    } else {
      var checkIO = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        checkIO.disconnect();
        tick();
      }, { threshold: 0.4 });
      checkIO.observe(checks);
    }
  }

  /* ─────────── 8. ce qui ne tourne qu'à l'écran ───────────
     La bande défilante, le point de la fiche et le paquet qui descend les rails
     portent data-live. Une animation qui continue hors du champ consomme des
     images pour rien : l'observateur pose et retire .live, et la feuille de
     style met les boucles en pause au lieu de les supprimer, pour qu'elles
     reprennent là où elles s'étaient arrêtées. */
  var lives = doc.querySelectorAll("[data-live]");
  if (lives.length && !calm && hasIO) {
    var liveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("live", entry.isIntersecting);
      });
    }, { threshold: 0.01 });
    Array.prototype.forEach.call(lives, function (el) { liveIO.observe(el); });
  }

  /* ─────────── 9. pointeur : liseré des cartes et aimant des boutons ───────────
     Un seul écouteur pour la page entière, une seule image par mouvement, et
     rien du tout au doigt ni quand l'utilisateur demande moins d'animation. */
  if (fine && !calm) {
    var moveEvt = null;
    var pTick = false;
    var litCard = null;
    var magnet = null;

    var clear = function (el) {
      if (!el) return;
      el.style.removeProperty("--tx");
      el.style.removeProperty("--ty");
    };

    var flush = function () {
      pTick = false;
      var e = moveEvt;
      if (!e) return;
      var target = e.target;
      if (!target || !target.closest) return;

      /* liseré et nappe lumineuse, au pointeur */
      var card = target.closest(".card");
      if (card !== litCard) {
        if (litCard) litCard.classList.remove("lit");
        if (card) card.classList.add("lit");
        litCard = card;
      }
      if (card) {
        var cr = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - cr.left) + "px");
        card.style.setProperty("--my", (e.clientY - cr.top) + "px");
      }

      /* aimant : le bouton se déplace de quelques pixels vers le curseur, et
         son reflet suit le pointeur */
      var btn = target.closest(".btn");
      if (btn && btn.classList.contains("btn-sm")) btn = null;
      if (btn !== magnet) { clear(magnet); magnet = btn; }
      if (btn) {
        var br = btn.getBoundingClientRect();
        var dx = (e.clientX - (br.left + br.width / 2)) / (br.width / 2);
        var dy = (e.clientY - (br.top + br.height / 2)) / (br.height / 2);
        var cap = function (v) { return Math.max(-1, Math.min(1, v)); };
        btn.style.setProperty("--tx", (cap(dx) * 5).toFixed(2) + "px");
        btn.style.setProperty("--ty", (cap(dy) * 3).toFixed(2) + "px");
        btn.style.setProperty("--mx", (e.clientX - br.left) + "px");
        btn.style.setProperty("--my", (e.clientY - br.top) + "px");
      }
    };

    doc.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      moveEvt = e;
      if (pTick) return;
      pTick = true;
      requestAnimationFrame(flush);
    }, { passive: true });

    /* la souris quitte la fenêtre : on repose tout */
    doc.addEventListener("pointerleave", function () {
      if (litCard) { litCard.classList.remove("lit"); litCard = null; }
      clear(magnet);
      magnet = null;
    });
  }

  /* ─────────── 10. adresse de contact, depuis config.js ─────────── */
  var contact = window.LEADCORE_CONTACT || {};
  if (contact.email) {
    Array.prototype.forEach.call(doc.querySelectorAll("[data-contact-email]"), function (el) {
      el.setAttribute("href", "mailto:" + contact.email);
      if (el.hasAttribute("data-contact-email-text")) el.textContent = contact.email;
    });
  }

  /* ─────────── 11. calendrier ───────────
     Tant que provider et url ne sont pas renseignés dans config.js, le bloc de
     repli écrit dans le HTML reste affiché. */
  var slot = doc.getElementById("booking-slot");
  if (!slot) return;

  var cfg = window.LEADCORE_BOOKING || {};
  var url = (cfg.url || "").trim();
  var provider = cfg.provider;
  if (!provider || !url) return;

  var src = url;
  var sep = url.indexOf("?") === -1 ? "?" : "&";
  if (provider === "cal") {
    /* La vue mois demande de la largeur : sur un téléphone elle tombe à 260 px
       et devient illisible. En dessous de 640 px, Cal a une vue en colonne
       faite pour ça. Le choix se fait au chargement, pas au redimensionnement :
       recharger l'iframe pendant que quelqu'un choisit une date lui ferait
       perdre sa sélection. */
    src += sep + "embed=true&theme=dark&layout=" +
           (window.innerWidth < 640 ? "column_view" : "month_view");
  } else if (provider === "calendly") {
    src += sep + "hide_gdpr_banner=1&background_color=0A110F&text_color=F2F8F5&primary_color=19C78B";
  }

  var frame = doc.createElement("iframe");
  frame.src = src;
  frame.title = "Calendrier de prise de rendez-vous Leadcore";
  frame.loading = "lazy";
  /* la vue colonne tient dans moins de hauteur que la vue mois */
  frame.style.minHeight = (window.innerWidth < 640 ? 520 : (cfg.height || 680)) + "px";
  frame.setAttribute("allow", "fullscreen");

  slot.innerHTML = "";
  slot.appendChild(frame);
  slot.setAttribute("data-state", "loaded");

  void root;
})();
