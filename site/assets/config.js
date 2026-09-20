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

  /* Identifiant du type de rendez-vous chez Cal, lu par assets/rdv.js pour
     interroger l'API. On le retrouve avec :
       curl "https://api.cal.com/v2/event-types?username=<compte>" \
            -H "cal-api-version: 2024-06-14"
     Si ce champ est vide, le calendrier maison ne se monte pas et le bloc de
     repli du HTML reste affiché — avec le lien vers la page Cal et l'email. */
  eventTypeId: 7144191,

  /* Durée affichée dans l'interface. Cal la connaît déjà ; elle n'est ici que
     pour l'écrire à l'écran sans un aller-retour de plus. */
  dureeMin: 30,

  /* Nombre de jours explorés en avant à partir d'aujourd'hui. */
  horizonJours: 28,

  // Hauteur minimale du bloc, en pixels, pour éviter un saut au chargement.
  height: 680
};

/* Adresse utilisée par le repli et par le pied de page.
   Adresse provisoire, en attendant le domaine : aucun domaine n'est rattaché
   au projet, donc contact@leadcore.fr n'existe pas. Se change ici seulement. */
window.LEADCORE_CONTACT = {
  email: "platon.leadcore@gmail.com"
};
