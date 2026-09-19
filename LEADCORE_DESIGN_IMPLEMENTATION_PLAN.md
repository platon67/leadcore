# Leadcore — Plan d'implémentation

Compagnon de [`LEADCORE_DESIGN_UX_AUDIT.md`](LEADCORE_DESIGN_UX_AUDIT.md).
**Rien n'a été modifié dans le site.** Ce document liste ce qu'il faut changer,
dans quel ordre, et pourquoi cet ordre.

**Convention d'effort :** Low ≤ 1 h · Medium 1 à 4 h · High > 4 h.

**Arbitrages rendus le 19 septembre 2026 par le propriétaire :** DA-03 → option B
(suppression de `.sig`) · SLOP-04 → suppression des photographies · DA-02 → dans
le périmètre. CVR-01 est débloqué : calendrier Cal.com et adresse de contact
branchés.

---

# TOP 10 PRIORITY MATRIX

| # | ID | Problème | Impact | Effort | Action |
|---|---|---|---|---|---|
| 1 | BUG-01 | Débordement 1 156 px, Collaboration | Critique | Low | Corriger |
| 2 | CVR-01 | Conversion = mailto vers adresse inexistante | Critique | Medium | Restructurer |
| 3 | PERF-01 | 2 790 ms avant le premier mot | Critique | Low | Réduire |
| 4 | BUG-02 | Harnais de test aveugle au mountement par défaut | Critique | Low | Corriger la méthode |
| 5 | TRUST-01 | Le fondateur réduit à deux initiales | Critique | Medium | Restructurer |
| 6 | CVR-02 | Trou de CTA de 7 000 px | Élevé | Medium | Ajouter |
| 7 | BUG-03 | Débordement 4 px mobile, Méthode | Élevé | Low | Corriger |
| 8 | A11Y-01 | Cibles tactiles sous 44 px | Élevé | Low | Corriger |
| 9 | DA-01 | 22 titres sur 22 avec la même formule | Élevé | Medium | Desserrer |
| 10 | DA-02 | 40 tailles, 9 graisses, 14 rayons | Élevé | High | Systématiser |

---

# PHASE 1 — FOUNDATION

*Ce qui est cassé en production. Rien d'autre ne doit passer avant.*

### BUG-01 · Débordement horizontal de Collaboration
**Localisation :** `styles.css` §35, `.railh` / `.railh-head`.
**Problème :** `scrollWidth` 2 596 px pour `clientWidth` 1 440. Présent à 900, 1 024,
1 280, 1 440, 1 920 px. La tête de frise est large de 1 256 px puis translatée de
1 247 px, sans rognage sur son conteneur.
**Modification :** `overflow-x: clip` sur `.railh`. **Pas** `overflow: hidden` —
les anneaux `.ring` débordent volontairement vers le haut et seraient rognés.
Vérifier après coup que l'anneau à `top:-32px` et son `scale(3.4)` restent visibles.
**Justification :** visibility of system status — une barre de défilement latérale
non sollicitée est un signal de défaillance.
**Impact :** crédibilité, perception de sérieux technique.
**Priorité :** Critical · **Effort :** Low

### BUG-02 · Le harnais de vérification doit voir le mouvement par défaut
**Localisation :** scripts de contrôle (`deborde.js`, `contraste.js`).
**Problème :** les deux contextes sont créés en `reducedMotion:'reduce'`, media query
sous laquelle `.railh-head` porte `display:none`. Six pages × huit largeurs
passaient au vert avec le défaut en production. Les scripts ne défilent pas non plus.
**Modification :** chaque contrôle de mise en page tourne deux fois — mouvement par
défaut et mouvement réduit — et parcourt la page de haut en bas avant de mesurer.
**Justification :** un test qui ne peut pas échouer ne teste rien.
**Impact :** fiabilité de tout ce qui sera vérifié ensuite.
**Priorité :** Critical · **Effort :** Low

### BUG-03 · Débordement de 4 px sur Méthode en mobile
**Localisation :** `styles.css` §24, `.p-methode .sig .s3`.
**Problème :** la lame diagonale déborde de 4 px à 320 et 390 px.
**Modification :** vérifier le rognage de `.sig` à ces largeurs, ou masquer `.s3` sous
560 px — elle est de toute façon imperceptible sur un écran étroit.
**Priorité :** High · **Effort :** Low

### CVR-01 · Donner une vraie sortie au tunnel
**Localisation :** `assets/config.js`, section `#rendez-vous`, tous les CTA primaires.
**Problème :** l'unique mécanisme de conversion est `mailto:contact@leadcore.fr`,
vers une adresse qui n'existe pas encore, et la page l'annonce : « Le calendrier en
ligne n'est pas encore branché. » Un `mailto:` échoue silencieusement chez tout
visiteur desktop sans client mail configuré.
**État au 19 septembre 2026 :** le calendrier est branché (`cal`,
`https://cal.com/platon-gsniv4/30min`), l'adresse de contact est
`platon.leadcore@gmail.com`, et la phrase qui annonçait la panne est retirée.
**Reste à faire en phase 1 :** router les CTA primaires de Méthode, Collaboration
et Tarifs vers `index.html#rendez-vous` au lieu d'un `mailto:`, et vérifier le
rendu du calendrier sur téléphone (non testable ici, `cal.com` est bloqué par le
proxy d'environnement).

**Modification, par ordre de préférence :**
1. Brancher un calendrier (`provider` dans `config.js` — l'intégration est déjà écrite).
2. À défaut, un formulaire en deux champs (email + ticket moyen) traité côté serveur.
3. Au minimum immédiat : retirer la phrase qui annonce la panne, et promettre un
   délai (« vous recevez trois créneaux dans la journée »).
**Justification :** user control and freedom ; visibility of system status. Un site
qui documente sa propre indisponibilité au moment de l'engagement annule tout le
travail de crédibilité fait en amont.
**Impact :** conversion, crédibilité.
**Priorité :** Critical · **Effort :** Medium

### PERF-01 · Réduire la séquence d'ouverture
**Localisation :** `styles.css` §23, `main.js` §1.
**Problème :** 2 790 ms mesurés à CPU ÷4 avant que le titre soit lisible. Opacité du
`h1` à 0 pendant 2,6 s. Le visiteur type arrive d'un email froid, sur mobile.
**Modification :** ramener à ≤ 900 ms, **ou** ne la jouer qu'en accès direct à `/`
sans paramètre de campagne (`?utm_*`, `?c=`), **ou** la supprimer du site en gardant
le MP4 pour les usages sociaux.
**Justification :** le coût d'attention des premières secondes est le plus élevé du
parcours ; il est ici dépensé sans contrepartie informationnelle.
**Impact :** taux de rebond, conversion.
**Priorité :** Critical · **Effort :** Low

---

# PHASE 2 — UX / CONVERSION

### CVR-02 · Combler le trou de CTA
**Localisation :** Méthode, Collaboration, Tarifs.
**Problème :** deux CTA par page, à 0 % et à 86 %. 7 000 px sans porte de sortie.
**Modification :** un CTA contextuel après chaque bloc de preuve majeur, formulé
d'après ce qui vient d'être démontré — pas un bouton générique répété.
Exemples : après la fiche de rendez-vous, « Voir à quoi ressemblerait la vôtre » ;
après le ratio 2 sur 30, « Refaire ce calcul avec votre ticket moyen ».
**Justification :** la conviction a une demi-vie courte ; un CTA doit exister au
point de conviction, pas à la fin du document.
**Impact :** conversion.
**Priorité :** High · **Effort :** Medium

### A11Y-01 · Cibles tactiles
**Problème mesuré :** bouton de menu 42 × 38 px ; liens de pied 24 px ; fil d'Ariane
20 px ; logo 25 px. Minimum WCAG 2.5.8 : 44 × 44.
**Modification :** porter le bouton de menu à 44 × 44 minimum ; donner aux liens de
pied un `padding` vertical portant la zone tactile à 44 px sans changer l'apparence.
**Priorité :** High · **Effort :** Low

### UX-01 · Remonter la fiche de rendez-vous sur l'accueil
**Problème :** le seul objet concret que le client reçoit vit à 55 % d'une page de
8 300 px, sur une page secondaire.
**Modification :** la placer sur l'accueil, à la place du défilé ou de la marquee.
**Justification :** recognition over recall — montrer le livrable vaut mieux que le
décrire. C'est aussi le seul élément qui ressemble à une preuve.
**Impact :** compréhension, crédibilité, conversion.
**Priorité :** High · **Effort :** Medium

### UX-02 · Le CTA d'en-tête ne doit pas faire quitter la page
**Problème :** sur les pages intérieures il pointe vers `index.html#rendez-vous`.
**Modification :** une ancre locale vers le CTA de bas de page, ou un CTA de fin de
page collant sur mobile.
**Priorité :** Medium · **Effort :** Low

### UX-03 · Rendre le défilé accessible au clavier
**Problème :** les quatre affirmations ne sont pas focusables ; un utilisateur au
clavier ne déclenche jamais le changement d'image.
**Modification :** si le défilé est conservé, rendre les affirmations focusables et
activer au focus. Si UX-05 est appliqué, ce point disparaît.
**Priorité :** Medium · **Effort :** Low

### COPY-01 · Gloser le jargon d'infrastructure
**Problème mesuré :** SPF, DKIM, DMARC (5 fois chacun), warm-up (5), ICP (3),
outbound (4), bookés (4), délivrabilité (1) — **jamais expliqués**, dans les sections
censées rassurer un dirigeant qui n'a jamais acheté d'outbound.
**Modification :** une glose de six mots à la première occurrence de chacun.
Reformulations proposées dans le rapport, §COPYWRITING REPORT.
**Justification :** cognitive load — un terme non compris transforme une
démonstration de sérieux en mur.
**Impact :** compréhension, confiance du profil A.
**Priorité :** High · **Effort :** Low

### COPY-02 · Restituer la catégorie au-dessus de la ligne de flottaison
**Problème :** rien ne dit « agence de prospection B2B » dans le premier écran. Le
sur-titre a été retiré plus tôt dans le projet ; c'était une erreur.
**Modification :** sur-titre discret au-dessus du `h1` : « Agence de prospection
B2B · Email et LinkedIn ».
**Justification :** Jakob's law — le visiteur cherche la catégorie avant la promesse.
**Priorité :** Medium · **Effort :** Low

---

# PHASE 3 — VISUAL IDENTITY

*C'est la phase qui décide si le site reste un template ou devient Leadcore.*

### TRUST-01 · Construire la section fondateur
**Problème :** deux initiales dans un rond, à 3 029 px. Sur un site sans aucune
preuve sociale, c'est la seule preuve disponible et elle est traitée comme une
signature de bas de page.
**Modification :** photo réelle, nom, ce qu'il faisait avant, pourquoi il fait ça,
une phrase à la première personne. Remonter à la suite du premier écran.
**Justification :** authority + familiarity. En l'absence de logos clients,
l'incarnation est le seul transfert de confiance disponible.
**Impact :** crédibilité — le levier le plus fort disponible sans nouvel actif.
**Priorité :** Critical · **Effort :** Medium *(dépend d'une photo à fournir)*

### DA-01 · Desserrer la formule des titres
**Problème mesuré :** 22 titres sur 22 en « énoncé sans-serif + proposition italique
serif ». Le `README` énonce que c'est « la seule seconde voix, qui perd son effet dès
qu'on s'en sert ailleurs » — et elle est partout.
**Modification :** descendre à 6-8 occurrences, réservées aux titres qui portent un
vrai retournement (« On enlève. *On n'ajoute jamais.* » le mérite ; « Ce que ça fait
*sur un trimestre.* » non). Les autres deviennent des affirmations d'une seule voix.
**Justification :** Von Restorff — un élément ne se détache que s'il est rare. À 100 %
d'application, l'exception devient la norme et ne signale plus rien.
**Impact :** perception d'intention, différenciation.
**Priorité :** High · **Effort :** Medium

### DA-02 · Fermer les échelles
**Problème mesuré :** 40 tailles de police, 9 graisses, 53 approches, 58
interlignages, 41 paddings, 30 gaps, 14 rayons — pour 2 rayons déclarés en jetons.
Cause : `clamp()` sur chaque composant produit une valeur continue par élément.
**Décision : dans le périmètre.**

**Modification :**
- Échelle typographique fermée à 8 pas : 12 / 14 / 16 / 19 / 23 / 29 / 38 / 56.
- Trois graisses : 400, 600, 800. Supprimer 450, 550, 650, 750.
- Échelle d'espacement à 7 pas : 4 / 8 / 12 / 20 / 32 / 52 / 84.
- Trois rayons : 4 / 10 / 16, plus `999px` pour les pastilles.
- `clamp()` réservé aux deux pas d'affichage.
**Justification :** une échelle n'existe que si le lecteur peut la percevoir. 40
tailles ne produisent pas une gamme, elles produisent une absence de gamme.
**Impact :** cohérence perçue, « conçu » vs « assemblé ».
**Priorité :** High · **Effort :** High

### DA-03 · Trancher sur le système de fond
**Problème mesuré :** les quatre géométries de `.sig` sont **imperceptibles** —
échantillonnage identique entre pages à deux points sur trois.
**Modification, deux options, pas de demi-mesure :**
- **A — amplifier :** une page = une dominante réellement lisible (variation de
  luminance d'au moins 8 niveaux entre pages au même point).
- **B — supprimer :** retirer `.sig` et ses trois couches, garder le sol et le grain.
**Décision : B, arbitrée.** Recommandation d'origine ci-dessous.

**Recommandation : B.** Le système coûte du code, de la documentation et de la
complexité pour un résultat nul. Sa suppression libère la voie pour une
différenciation qui se voit — la typographie ou la composition.
**Priorité :** High · **Effort :** Medium

### DA-04 · Donner une forme propre à chaque page
**Problème :** les quatre pages partagent la même charpente (chapeau → résumé
encastré → 3-4 sections → CTA → pager) et la même largeur de colonne du haut en bas.
Aucune rupture d'échelle, aucun pleine largeur, aucun silence.
**Modification :** un geste de composition distinct par page — par exemple : Tarifs
en colonne étroite centrée comme un document contractuel ; Méthode en pleine largeur
pour le schéma puis colonne resserrée pour le détail ; Collaboration sur une trame
horizontale assumée.
**Justification :** le rythme est ce qui distingue une composition d'un gabarit.
**Impact :** différenciation, mémorisation.
**Priorité :** Medium · **Effort :** High

### DA-05 · Exploiter les pictogrammes comme signature
**Constat :** les 14 pictogrammes sont le **seul élément réellement propriétaire** du
système visuel — dessinés sur grille, pas importés d'une bibliothèque.
**Modification :** les faire monter en grade — grands formats dans les sections de
tête, remplacement des photos du défilé, usage en filigrane.
**Justification :** on renforce ce qui différencie déjà, on ne cherche pas ailleurs.
**Priorité :** Medium · **Effort :** Medium

---

# PHASE 4 — AI-SLOP REMOVAL

### SLOP-01 · Supprimer la bande défilante
**Problème :** motif générique et daté, illisible en mouvement, qui répète des
chiffres présents deux écrans plus bas, et qui tourne en boucle en permanence.
**Modification :** suppression pure.
**Priorité :** High · **Effort :** Low

### SLOP-02 · Ramener les six apparitions à deux
**Problème :** `rowIn`, `slowRise`, `nodeIn`, `fromLeft`, `fromRight`, `writeIn` font
tous « arriver un bloc ». Six variantes d'un même geste.
**Modification :** deux gestes — une montée neutre, une écriture de gauche à droite
pour le grand livre. Supprimer les quatre autres.
**Priorité :** Medium · **Effort :** Low

### SLOP-03 · Calmer les boucles de Méthode
**Problème mesuré :** 11 boucles simultanées (3 comètes, 7 battements, 1 souffle).
**Modification :** garder la comète — elle explique le trajet, c'est sa fonction.
Supprimer le battement des sept points et le souffle de la case de sortie.
**Justification :** une animation ne hiérarchise que si elle est seule à bouger.
**Priorité :** High · **Effort :** Low

### SLOP-04 · Trancher sur les photographies — **tranché : suppression**
**Problème :** quatre photos Unsplash, 150 Ko, sur l'accueil seulement, qui
n'apportent aucune information. Le traitement en bichromie les intègre visuellement
mais ne leur donne pas de fonction.
**Modification :** les remplacer par les pictogrammes agrandis (DA-05), ou par des
captures réelles anonymisées quand un client existera. **Conserver la recette de
traitement** dans `assets/img/README.md` : elle servira aux vraies images.
**Priorité :** Medium · **Effort :** Low

### SLOP-05 · Réduire la densité de cartes
**Problème :** presque chaque bloc est un rectangle arrondi bordé. Le regard n'a plus
de hiérarchie : tout porte la même enveloppe.
**Modification :** réserver la carte aux blocs qui sont réellement des objets
(fiche, panneau de prix, arrêts de frise). Le texte courant et les listes reviennent
au fil du fond, avec un simple filet quand une séparation est nécessaire.
**Justification :** figure-ground — si tout est figure, il n'y a plus de fond.
**Priorité :** Medium · **Effort :** Medium

---

# PHASE 5 — POLISH

| ID | Point | Priorité | Effort |
|---|---|---|---|
| POL-01 | Faire émerger « on refuse sous 7 000 € » au-dessus des quatre gains sur l'accueil | Medium | Low |
| POL-02 | Alléger le détail des quatre semaines sur Collaboration (redit la frise) | Medium | Low |
| POL-03 | Introduire une seconde valeur de couleur pour les états (alerte / neutre) | Low | Medium |
| POL-04 | Varier la densité entre sections — aujourd'hui constante sur 8 000 px | Low | Medium |
| POL-05 | Réduire la hauteur mobile (9 à 13 écrans par page) | Medium | Medium |

---

# ORDRE, ET POURQUOI CET ORDRE

**Phase 1 d'abord** parce qu'un site qui déborde horizontalement et dont le bouton
de conversion ne mène nulle part ne mérite aucun travail esthétique. Ce sont des
défauts qui annulent le reste.

**Phase 2 ensuite** parce que le contenu est déjà excellent : le rendre atteignable
(CTA au point de conviction, jargon glosé, fiche remontée) a un meilleur rendement
que toute retouche visuelle.

**Phase 3 avant la phase 4** parce que supprimer les motifs génériques sans avoir
construit l'identité qui les remplace laisserait un site nu. On construit d'abord ce
qui différencie, on retire ensuite ce qui banalise.

**Phase 4 ensuite**, quand les suppressions ne laissent plus de trous.

**Phase 5 en dernier**, par définition.

---

# CE QUI NE RELÈVE PAS DU SITE

Consigné ici pour mémoire, déjà traité ailleurs. Aucune retouche de design ne les
règle, et leur absence plafonne la crédibilité quoi qu'on fasse au site :

- Garantie plancher si un mois produit trois rendez-vous au lieu de huit.
- Réponse RGPD (base légale, registre, sous-traitance).
- Mécanisme d'arbitrage sur un rendez-vous facturé contesté.
- Taille de l'équipe.
- Modalités de paiement, intégration CRM, exclusivité sectorielle.
- **Deux cas clients chiffrés** — le seul actif qui réglerait le problème n°5 du
  rapport, et qui débloquerait au passage la grille tarifaire établie.
