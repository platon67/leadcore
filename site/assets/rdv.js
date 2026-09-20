/* Leadcore — prise de rendez-vous.
   ═══════════════════════════════════════════════════════════════════════════
   Remplace l'iframe Cal par une interface écrite ici, dans la direction
   artistique du site. Tout se passe dans le navigateur : l'API publique de Cal
   répond en `access-control-allow-origin: *` sur les deux points d'entrée dont
   on a besoin, et aucun des deux ne demande de clé pour un type de rendez-vous
   public. Il n'y a donc ni serveur, ni fonction, ni secret à déployer — le
   site reste strictement statique.

     GET  api.cal.com/v2/slots      en-tête cal-api-version: 2024-09-04
          -> { data: { "2026-09-22": [ { start: "…+02:00" }, … ] } }
     POST api.cal.com/v2/bookings   en-tête cal-api-version: 2024-08-13
          -> { start, eventTypeId, attendee:{ name, email, timeZone, language },
               bookingFieldsResponses:{ notes } }

   Vérifié par préflight : `access-control-allow-methods` contient POST et
   `access-control-allow-headers` contient `cal-api-version` et `Content-Type`.

   Le fuseau est celui du visiteur, pas le nôtre : quelqu'un à Montréal doit
   lire ses heures à lui, et c'est aussi ce que Cal attend pour découper les
   créneaux. Il est écrit à l'écran, parce qu'un horaire sans fuseau est une
   source d'absence au rendez-vous.

   États couverts, tous visibles à l'écran : chargement, échec réseau, aucun
   créneau sur l'horizon, choix du jour, choix de l'heure, formulaire, envoi en
   cours, créneau pris entre-temps, refus de l'API, confirmation.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var doc = document;
  var hote = doc.getElementById("booking-slot");
  if (!hote) return;

  /* Sans `fetch`, on ne monte rien et le repli écrit dans le HTML — lien vers
     la page Cal et adresse email — reste en place. Le reste du site est en
     ES5 ; c'est le seul fichier qui demande davantage, et il le vérifie. */
  if (!window.fetch || !Element.prototype.closest) return;

  var cfg = window.LEADCORE_BOOKING || {};
  var idType = cfg.eventTypeId;
  /* Sans identifiant on ne monte rien : le repli écrit dans le HTML — lien
     vers la page Cal et adresse email — reste affiché tel quel. */
  if (!idType) return;

  var API = "https://api.cal.com/v2";
  var DUREE = cfg.dureeMin || 30;
  var HORIZON = cfg.horizonJours || 28;
  var fuseau = "Europe/Paris";
  try {
    var t = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (t) fuseau = t;
  } catch (e) { /* navigateur sans Intl complet : on garde Paris */ }

  /* ─────────── mise en forme ─────────── */

  function cleJour(d) {
    /* YYYY-MM-DD en heure locale, pas en UTC : `toISOString` décale d'un jour
       pour quiconque est à l'est de Greenwich après 22 h. */
    var m = d.getMonth() + 1, j = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (j < 10 ? "0" : "") + j;
  }

  function heure(iso) {
    try {
      return new Date(iso).toLocaleTimeString("fr-FR", {
        hour: "2-digit", minute: "2-digit", timeZone: fuseau
      });
    } catch (e) { return iso; }
  }

  function jourLong(cle) {
    var d = new Date(cle + "T12:00:00");
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  }

  function jourCourt(cle) {
    var d = new Date(cle + "T12:00:00");
    return {
      jour: d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
      nb: d.getDate(),
      mois: d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")
    };
  }

  function echappe(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ─────────── le questionnaire ───────────
     Il passe entre le choix du créneau et la confirmation, et non après,
     pour une raison technique : les réponses partent dans les notes de la
     réservation, et l'API v2 de Cal ne sait pas ajouter de notes à une
     réservation déjà créée (elle sait replanifier, annuler, confirmer,
     refuser, changer le lieu — pas éditer les réponses). Récoltées après le
     POST, elles n'auraient nulle part où aller.

     Une question par écran, qui avance toute seule au clic. Un formulaire de
     cinq questions empilées se lit comme une corvée ; cinq écrans d'un seul
     geste se traversent en dix secondes, et on voit la fin dès le début grâce
     à la barre de progression. Aucun champ à remplir jusqu'au dernier écran,
     où il n'en reste que deux, ceux que Cal exige.

     La question de la valeur client est le critère de sélection du site. Une
     réponse sous le seuil n'arrête rien et ne déclenche aucun avertissement :
     la page Tarifs dit qu'on en parle pendant l'appel, c'est donc pendant
     l'appel qu'on en parle. Elle part dans les notes, et l'appel est préparé. */
  var QUESTIONS = [
    {
      id: "activite", q: "Vous vendez quoi\u00a0?",
      r: ["Du logiciel B2B", "Des prestations d\u2019agence", "Du conseil ou de l\u2019expertise",
          "De la prestation technique", "Autre service B2B"]
    },
    {
      id: "valeur", q: "Combien vous rapporte un client, en moyenne\u00a0?",
      aide: "Sur toute sa durée de vie, pas sur la première facture.",
      r: ["Moins de 7\u202f000\u00a0\u20ac", "7\u202f000 \u00e0 20\u202f000\u00a0\u20ac",
          "20\u202f000 \u00e0 50\u202f000\u00a0\u20ac", "Plus de 50\u202f000\u00a0\u20ac"]
    },
    {
      id: "capacite", q: "Vos commerciaux peuvent honorer combien de rendez-vous par mois\u00a0?",
      aide: "On cale le volume dessus. Mieux vaut sous-estimer.",
      r: ["Moins de 5", "5 \u00e0 10", "10 \u00e0 20", "Plus de 20"]
    },
    {
      id: "deja", q: "Vous avez déjà tenté quoi\u00a0?", multi: true,
      aide: "Plusieurs réponses possibles.",
      r: ["Rien pour l\u2019instant", "De l\u2019emailing", "LinkedIn", "Du téléphone", "Une agence"]
    },
    {
      id: "quand", q: "Vous voudriez démarrer quand\u00a0?",
      r: ["Tout de suite", "Ce trimestre", "Je me renseigne"]
    }
  ];

  /* ─────────── état ─────────── */

  var jours = [];        // [{ cle, creneaux:[iso] }]
  var jourActif = null;
  var choisi = null;     // l'ISO du créneau retenu
  var etape = 0;         // la question en cours
  var reponses = {};     // { id: "réponse" } ou { id: ["a","b"] } si multi

  /* ─────────── squelette ─────────── */

  hote.innerHTML =
    '<div class="rdv">' +
      '<div class="rdv-hd">' +
        '<span class="rdv-lbl">Choisir un créneau</span>' +
        '<span class="rdv-tz" title="Les horaires sont affichés dans votre fuseau"></span>' +
      '</div>' +
      '<div class="rdv-corps" aria-live="polite"></div>' +
    '</div>';

  var corps = hote.querySelector(".rdv-corps");
  hote.querySelector(".rdv-tz").textContent = fuseau.replace(/_/g, " ");
  hote.setAttribute("data-state", "monte");

  var libelle = hote.querySelector(".rdv-lbl");
  function phase(t) { if (libelle) libelle.textContent = t; }
  function peindre(html) { corps.innerHTML = html; }

  function messageBrut(titre, texte, action) {
    peindre(
      '<div class="rdv-msg">' +
        '<p class="rdv-msg-t">' + echappe(titre) + "</p>" +
        '<p class="rdv-msg-d">' + texte + "</p>" +
        (action || "") +
      "</div>"
    );
  }

  function replis() {
    /* Les deux sorties de secours, toujours les mêmes : la page Cal d'origine
       et l'email. Elles existent déjà dans le HTML de repli ; on les reconstruit
       ici parce qu'on a remplacé son contenu. */
    var mail = (window.LEADCORE_CONTACT || {}).email || "";
    var h = "";
    if (cfg.url) {
      h += '<a class="btn btn-gho btn-sm" href="' + echappe(cfg.url) + '" target="_blank" rel="noopener">Ouvrir le calendrier</a>';
    }
    if (mail) {
      h += '<a class="btn btn-gho btn-sm" href="mailto:' + echappe(mail) + '">Écrire un mot</a>';
    }
    return h ? '<div class="rdv-replis">' + h + "</div>" : "";
  }

  /* ─────────── chargement des créneaux ─────────── */

  function charger() {
    peindre(
      '<div class="rdv-charge" role="status">' +
        '<span class="rdv-points" aria-hidden="true"><i></i><i></i><i></i></span>' +
        "<p>On regarde les créneaux libres…</p>" +
      "</div>"
    );

    var debut = new Date();
    var fin = new Date();
    fin.setDate(fin.getDate() + HORIZON);

    var u = API + "/slots?eventTypeId=" + encodeURIComponent(idType) +
            "&start=" + cleJour(debut) + "&end=" + cleJour(fin) +
            "&timeZone=" + encodeURIComponent(fuseau);

    fetch(u, { headers: { "cal-api-version": "2024-09-04" } })
      .then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      })
      .then(function (j) {
        var d = j && j.data;
        if (!d) throw new Error("charge vide");
        jours = Object.keys(d).sort().map(function (cle) {
          return {
            cle: cle,
            creneaux: (d[cle] || []).map(function (c) { return c.start; })
          };
        }).filter(function (x) { return x.creneaux.length; });

        if (!jours.length) {
          messageBrut(
            "Rien de libre dans les " + HORIZON + " jours qui viennent",
            "L’agenda est plein jusque-là. Écrivez-nous une ligne avec votre secteur et votre ticket moyen&nbsp;: on vous ouvre un créneau.",
            replis()
          );
          hote.setAttribute("data-state", "vide");
          return;
        }
        jourActif = jours[0].cle;
        hote.setAttribute("data-state", "pret");
        peindreChoix();
      })
      .catch(function () {
        messageBrut(
          "Le calendrier ne répond pas",
          "On n’arrive pas à joindre l’agenda pour le moment. Les deux voies ci-dessous fonctionnent&nbsp;:",
          replis()
        );
        hote.setAttribute("data-state", "erreur");
      });
  }

  /* ─────────── choix du jour et de l'heure ─────────── */

  function peindreChoix() {
    phase("Choisir un créneau");
    var jourObj = null;
    for (var i = 0; i < jours.length; i++) if (jours[i].cle === jourActif) jourObj = jours[i];
    if (!jourObj) jourObj = jours[0];

    var hj = jours.map(function (x) {
      var c = jourCourt(x.cle);
      var actif = x.cle === jourObj.cle;
      return '<button type="button" class="rdv-j' + (actif ? " on" : "") + '" data-jour="' + x.cle + '"' +
             ' aria-pressed="' + (actif ? "true" : "false") + '">' +
               '<span class="d">' + echappe(c.jour) + "</span>" +
               '<span class="n">' + c.nb + "</span>" +
               '<span class="m">' + echappe(c.mois) + "</span>" +
               '<span class="c">' + x.creneaux.length + "</span>" +
             "</button>";
    }).join("");

    var hh = jourObj.creneaux.map(function (iso) {
      return '<button type="button" class="rdv-h" data-iso="' + echappe(iso) + '">' + heure(iso) + "</button>";
    }).join("");

    peindre(
      '<div class="rdv-choix">' +
        '<div class="rdv-bloc">' +
          '<p class="rdv-t">Quel jour&nbsp;?</p>' +
          '<div class="rdv-jours" role="group" aria-label="Jours disponibles">' + hj + "</div>" +
        "</div>" +
        '<div class="rdv-bloc">' +
          '<p class="rdv-t">' + echappe(jourLong(jourObj.cle)) + "</p>" +
          '<div class="rdv-heures" role="group" aria-label="Heures disponibles">' + hh + "</div>" +
        "</div>" +
      "</div>"
    );
  }

  /* ─────────── le questionnaire ─────────── */

  /* Six étapes en tout : les cinq questions, puis les coordonnées. Comptée sur
     cinq, la barre serait vide au premier écran — ce qui se lit comme un
     défaut d'affichage plutôt que comme un début. */
  function barre(n) {
    return '<div class="rdv-prog" aria-hidden="true">' +
             '<span class="rdv-prog-b" style="--p:' + (n / (QUESTIONS.length + 1)) + '"></span>' +
           "</div>";
  }

  function peindreQuestion() {
    if (etape >= QUESTIONS.length) { peindreForm(); return; }
    phase("Préqualification");
    var Q = QUESTIONS[etape];
    var choix = reponses[Q.id];

    var boutons = Q.r.map(function (txt, i) {
      var pris = Q.multi ? (choix || []).indexOf(txt) !== -1 : choix === txt;
      return '<button type="button" class="rdv-r' + (pris ? " on" : "") + '"' +
             ' data-q="' + Q.id + '" data-v="' + echappe(txt) + '" style="--i:' + i + '"' +
             ' aria-pressed="' + (pris ? "true" : "false") + '">' +
               '<span class="t">' + echappe(txt) + "</span>" +
               '<span class="k" aria-hidden="true"></span>' +
             "</button>";
    }).join("");

    /* Une question à réponse unique avance d'elle-même ; une question à
       réponses multiples ne peut pas deviner qu'on a fini, donc elle seule
       porte un bouton de passage. */
    var suite = Q.multi
      ? '<button type="button" class="rdv-suite" data-suite' +
        ((choix && choix.length) ? "" : " disabled") + ">Continuer</button>"
      : "";

    peindre(
      '<div class="rdv-q">' +
        barre(etape + 1) +
        '<div class="rdv-q-hd">' +
          '<button type="button" class="rdv-back" data-arriere aria-label="Revenir">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>' +
          "</button>" +
          '<span class="rdv-pas">Question ' + (etape + 1) + " sur " + QUESTIONS.length + "</span>" +
          '<span class="rdv-quand">' + echappe(jourLong(jourActif) + " · " + heure(choisi)) + "</span>" +
        "</div>" +
        '<p class="rdv-q-t">' + Q.q + "</p>" +
        (Q.aide ? '<p class="rdv-q-a">' + Q.aide + "</p>" : "") +
        '<div class="rdv-rs" role="group">' + boutons + "</div>" +
        suite +
      "</div>"
    );
  }

  function repondre(bouton) {
    var id = bouton.getAttribute("data-q");
    var val = bouton.getAttribute("data-v");
    var Q = QUESTIONS[etape];

    if (Q.multi) {
      var l = reponses[id] || [];
      var i = l.indexOf(val);
      if (i === -1) l.push(val); else l.splice(i, 1);
      reponses[id] = l;
      peindreQuestion();
      return;
    }

    reponses[id] = val;
    /* On marque le choix, puis on avance : sans ce délai le bouton n'a jamais
       l'air d'avoir été pressé, et le saut d'écran paraît accidentel. */
    bouton.classList.add("on");
    bouton.setAttribute("aria-pressed", "true");
    var attend = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;
    setTimeout(avancer, attend);
  }

  function avancer() {
    etape++;
    peindreQuestion();
  }

  /* ─────────── formulaire ─────────── */

  function peindreForm() {
    var quand = jourLong(jourActif) + " à " + heure(choisi);
    phase("Confirmer");
    peindre(
      '<div class="rdv-form">' +
        barre(QUESTIONS.length + 1) +
        '<div class="rdv-recap">' +
          '<span class="q">' + echappe(quand) + "</span>" +
          '<span class="s">' + DUREE + "&nbsp;min, en visio · " + echappe(fuseau.replace(/_/g, " ")) + "</span>" +
          '<button type="button" class="rdv-chg" data-retour>Changer</button>' +
        "</div>" +
        jetons() +
        '<p class="rdv-f-t">Il ne manque que ça.</p>' +
        '<form novalidate>' +
          '<div class="rdv-duo">' +
            '<label class="rdv-ch"><span>Nom et prénom</span>' +
              '<input name="nom" type="text" autocomplete="name" required></label>' +
            '<label class="rdv-ch"><span>Email professionnel</span>' +
              '<input name="email" type="email" autocomplete="email" required></label>' +
          "</div>" +
          '<label class="rdv-ch"><span>Société</span>' +
            '<input name="societe" type="text" autocomplete="organization"></label>' +
          '<p class="rdv-err" role="alert" hidden></p>' +
          '<button type="submit" class="btn btn-pri rdv-go">Confirmer le rendez-vous</button>' +
          '<p class="rdv-fine">Vous recevrez l’invitation et le lien visio par email. Aucun autre usage n’est fait de votre adresse.</p>' +
        "</form>" +
      "</div>"
    );
  }

  function jetons() {
    /* Les réponses données restent visibles au dernier écran : on vient de les
       donner en cinq gestes, et on doit pouvoir vérifier qu'on n'a pas cliqué
       de travers avant de valider. Un clic ramène à la question. */
    var h = QUESTIONS.map(function (Q, i) {
      var v = reponses[Q.id];
      if (!v || (Q.multi && !v.length)) return "";
      var txt = Q.multi ? v.join(", ") : v;
      return '<button type="button" class="rdv-jeton" data-q-retour="' + i + '">' +
             echappe(txt) + "</button>";
    }).join("");
    return h ? '<div class="rdv-jetons">' + h + "</div>" : "";
  }

  function notesPrequal() {
    var l = [];
    QUESTIONS.forEach(function (Q) {
      var v = reponses[Q.id];
      if (!v || (Q.multi && !v.length)) return;
      l.push(Q.q.replace(/\u00a0/g, " ") + " " + (Q.multi ? v.join(", ") : v));
    });
    return l;
  }

  function envoyer(form) {
    var nom = form.nom.value.trim();
    var email = form.email.value.trim();
    var societe = form.societe.value.trim();
    var err = form.parentNode.querySelector(".rdv-err");

    function dire(m) {
      err.textContent = m;
      err.hidden = false;
    }
    err.hidden = true;

    if (nom.length < 2) { dire("Il manque votre nom."); form.nom.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { dire("Cette adresse email n’a pas l’air valide."); form.email.focus(); return; }

    var notes = [];
    if (societe) notes.push("Société : " + societe);
    var pq = notesPrequal();
    if (pq.length) notes.push("— Préqualification —\n" + pq.join("\n"));

    var bouton = form.querySelector(".rdv-go");
    bouton.disabled = true;
    bouton.textContent = "On enregistre…";

    var charge = {
      start: choisi,
      eventTypeId: idType,
      attendee: { name: nom, email: email, timeZone: fuseau, language: "fr" }
    };
    if (notes.length) charge.bookingFieldsResponses = { notes: notes.join("\n\n") };

    fetch(API + "/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "cal-api-version": "2024-08-13" },
      body: JSON.stringify(charge)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || (res.j && res.j.status === "error")) {
          var m = (res.j && res.j.error && res.j.error.message) || "";
          bouton.disabled = false;
          bouton.textContent = "Confirmer le rendez-vous";
          /* Le cas qui arrive vraiment : quelqu'un a pris le créneau pendant
             qu'on remplissait le formulaire. On le dit, et on renvoie au choix
             avec une liste fraîche plutôt que de laisser réessayer dans le
             vide. */
          if (/no longer available|already booked|not available|past/i.test(m)) {
            dire("Ce créneau vient d’être pris. On recharge les disponibilités.");
            setTimeout(charger, 1400);
            return;
          }
          dire("L’enregistrement a échoué. Réessayez, ou écrivez-nous.");
          return;
        }
        confirmer(res.j && res.j.data, nom, email);
      })
      .catch(function () {
        bouton.disabled = false;
        bouton.textContent = "Confirmer le rendez-vous";
        dire("La connexion a été interrompue. Réessayez dans un instant.");
      });
  }

  function confirmer(data, nom, email) {
    phase("C’est réservé");
    var quand = jourLong(jourActif) + " à " + heure(choisi);
    var lien = data && (data.meetingUrl || (data.location && /^https?:/.test(data.location) ? data.location : ""));
    peindre(
      '<div class="rdv-ok" role="status">' +
        '<span class="rdv-coche" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.4 4.4L19 7.6"/></svg>' +
        "</span>" +
        "<p class=\"rdv-ok-t\">C’est noté, " + echappe(nom.split(" ")[0]) + ".</p>" +
        '<p class="rdv-ok-q">' + echappe(quand) + "</p>" +
        '<p class="rdv-ok-d">L’invitation part sur <b>' + echappe(email) + "</b> avec le lien visio. " +
          "Si vous ne la voyez pas d’ici dix minutes, regardez vos indésirables.</p>" +
        (lien ? '<a class="btn btn-gho btn-sm" href="' + echappe(lien) + '" target="_blank" rel="noopener">Ouvrir le lien visio</a>' : "") +
      "</div>"
    );
    hote.setAttribute("data-state", "confirme");
  }

  /* ─────────── branchement ─────────── */

  corps.addEventListener("click", function (ev) {
    var j = ev.target.closest ? ev.target.closest(".rdv-j") : null;
    if (j) { jourActif = j.getAttribute("data-jour"); peindreChoix(); return; }

    var h = ev.target.closest ? ev.target.closest(".rdv-h") : null;
    if (h) {
      choisi = h.getAttribute("data-iso");
      etape = 0; reponses = {};
      peindreQuestion();
      return;
    }

    var r = ev.target.closest ? ev.target.closest(".rdv-r") : null;
    if (r) { repondre(r); return; }

    var pr = ev.target.closest ? ev.target.closest("[data-suite]") : null;
    if (pr) { avancer(); return; }

    var ar = ev.target.closest ? ev.target.closest("[data-arriere]") : null;
    if (ar) {
      if (etape > 0) { etape--; peindreQuestion(); }
      else { choisi = null; peindreChoix(); }
      return;
    }

    var jt = ev.target.closest ? ev.target.closest("[data-q-retour]") : null;
    if (jt) { etape = +jt.getAttribute("data-q-retour"); peindreQuestion(); return; }

    if (ev.target.closest && ev.target.closest("[data-retour]")) { choisi = null; peindreChoix(); }
  });

  corps.addEventListener("submit", function (ev) {
    if (ev.target.tagName !== "FORM") return;
    ev.preventDefault();
    envoyer(ev.target);
  });

  charger();
})();
