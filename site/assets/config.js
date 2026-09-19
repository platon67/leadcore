/* Leadcore — point d'intégration unique pour la prise de rendez-vous.
   C'est le seul fichier à modifier quand le compte de réservation change.

   provider : "cal" | "calendly" | null
   url      : lien public du calendrier
              Cal.com   -> "https://cal.com/leadcore/diagnostic-30min"
              Calendly  -> "https://calendly.com/leadcore/diagnostic-30min"

   Si provider vaut null, la page affiche un bloc de repli avec le bouton
   email. Rien d'autre à changer ailleurs. */

window.LEADCORE_BOOKING = {
  provider: "cal",
  url: "https://cal.com/platon-gsniv4/30min",
  // Hauteur minimale du calendrier intégré, en pixels.
  height: 680
};

/* Adresse utilisée par le repli et par le pied de page.
   Adresse provisoire, en attendant le domaine : aucun domaine n'est rattaché
   au projet, donc contact@leadcore.fr n'existe pas. Se change ici seulement. */
window.LEADCORE_CONTACT = {
  email: "platon.leadcore@gmail.com"
};
