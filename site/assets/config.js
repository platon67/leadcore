/* Leadcore — point d'intégration unique pour la prise de rendez-vous.
   C'est le seul fichier à modifier quand le compte de réservation existe.

   provider : "cal" | "calendly" | null
   url      : lien public du calendrier
              Cal.com   -> "https://cal.com/leadcore/diagnostic-30min"
              Calendly  -> "https://calendly.com/leadcore/diagnostic-30min"

   Tant que provider vaut null, la page affiche un bloc de repli avec
   le bouton email. Rien d'autre à changer ailleurs. */

window.LEADCORE_BOOKING = {
  provider: null,
  url: "",
  // Hauteur minimale du calendrier intégré, en pixels.
  height: 680
};

/* Adresse utilisée par le repli et par le pied de page. */
window.LEADCORE_CONTACT = {
  email: "contact@leadcore.fr"
};
