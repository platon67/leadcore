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

  /* ─────────── état ─────────── */

  var jours = [];        // [{ cle, creneaux:[iso] }]
  var jourActif = null;
  var choisi = null;     // l'ISO du créneau retenu

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

  /* ─────────── formulaire ─────────── */

  function peindreForm() {
    var quand = jourLong(jourActif) + " à " + heure(choisi);
    peindre(
      '<div class="rdv-form">' +
        '<div class="rdv-recap">' +
          '<span class="q">' + echappe(quand) + "</span>" +
          '<span class="s">' + DUREE + "&nbsp;min, en visio · " + echappe(fuseau.replace(/_/g, " ")) + "</span>" +
          '<button type="button" class="rdv-chg" data-retour>Changer</button>' +
        "</div>" +
        '<form novalidate>' +
          '<div class="rdv-duo">' +
            '<label class="rdv-ch"><span>Nom et prénom</span>' +
              '<input name="nom" type="text" autocomplete="name" required></label>' +
            '<label class="rdv-ch"><span>Email professionnel</span>' +
              '<input name="email" type="email" autocomplete="email" required></label>' +
          "</div>" +
          '<label class="rdv-ch"><span>Société</span>' +
            '<input name="societe" type="text" autocomplete="organization"></label>' +
          '<label class="rdv-ch"><span>Ce qu’on devrait regarder <em>facultatif</em></span>' +
            '<textarea name="mot" rows="2" placeholder="Votre ticket moyen, ce que vous avez déjà tenté…"></textarea></label>' +
          '<p class="rdv-err" role="alert" hidden></p>' +
          '<button type="submit" class="btn btn-pri rdv-go">Confirmer le rendez-vous</button>' +
          '<p class="rdv-fine">Vous recevrez l’invitation et le lien visio par email. Aucun autre usage n’est fait de votre adresse.</p>' +
        "</form>" +
      "</div>"
    );
  }

  function envoyer(form) {
    var nom = form.nom.value.trim();
    var email = form.email.value.trim();
    var societe = form.societe.value.trim();
    var mot = form.mot.value.trim();
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
    if (mot) notes.push(mot);

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
    if (h) { choisi = h.getAttribute("data-iso"); peindreForm(); return; }

    if (ev.target.closest && ev.target.closest("[data-retour]")) { choisi = null; peindreChoix(); }
  });

  corps.addEventListener("submit", function (ev) {
    if (ev.target.tagName !== "FORM") return;
    ev.preventDefault();
    envoyer(ev.target);
  });

  charger();
})();
