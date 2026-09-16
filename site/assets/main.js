(function () {
  "use strict";

  /* ---- menu mobile ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- bordure de l'en-tête au défilement ---- */
  var hdr = document.querySelector(".hdr");
  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- apparition au défilement ---- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".rv");

  if (reduced || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---- adresse de contact injectée depuis config.js ---- */
  var contact = window.LEADCORE_CONTACT || {};
  if (contact.email) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-contact-email]"), function (el) {
      el.setAttribute("href", "mailto:" + contact.email);
      if (el.hasAttribute("data-contact-email-text")) el.textContent = contact.email;
    });
  }

  /* ---- calendrier ---- */
  var slot = document.getElementById("booking-slot");
  if (!slot) return;

  var cfg = window.LEADCORE_BOOKING || {};
  var url = (cfg.url || "").trim();
  var provider = cfg.provider;

  if (!provider || !url) return; // le repli écrit dans le HTML reste affiché

  var src = url;
  if (provider === "cal") {
    src += (url.indexOf("?") === -1 ? "?" : "&") +
      "embed=true&theme=dark&layout=month_view";
  } else if (provider === "calendly") {
    src += (url.indexOf("?") === -1 ? "?" : "&") +
      "hide_gdpr_banner=1&background_color=0A110F&text_color=F2F8F5&primary_color=19C78B";
  }

  var frame = document.createElement("iframe");
  frame.src = src;
  frame.title = "Calendrier de prise de rendez-vous Leadcore";
  frame.loading = "lazy";
  frame.style.minHeight = (cfg.height || 680) + "px";
  frame.setAttribute("allow", "camera; microphone; fullscreen");

  slot.innerHTML = "";
  slot.appendChild(frame);
  slot.setAttribute("data-state", "loaded");
})();
