# 06 — Unit economics

Partie de l'[Operating System outbound & delivery](README.md).

Tous les chiffres viennent de `tools/simulateur_os.py`. Relancer le
simulateur avec les taux réels dès qu'ils existent : c'est un modèle, pas une
mesure.

```
python3 tools/simulateur_os.py --section client
python3 tools/simulateur_os.py --set positive_rate=0.012 --set show_rate=0.70
```

---

## F1 — Hypothèses et leur justification

| Paramètre | BASE | Justification | Solidité |
|---|---:|---|---|
| Contacts uniques / mois | 1 900 | Document de référence (MAJ-OFFRE §3) | Décision interne |
| Touches | 4 | Référence ; benchmark 4-7 | Solide |
| Envois / boîte / jour | 30 | 00-RECHERCHE §3.3 (15-40 selon opérateurs) | Moyenne |
| Réserve de boîtes | 25 % | Remplacement sans rupture | Hypothèse |
| Taux de réponse / contact | 6,3 % | 120 réponses / 1 900 contacts (référence) | À mesurer |
| Taux de positif / contact | 1,5 % | Référence ; fourchette publiée 0,5-2 % | **Hypothèse la plus sensible** |
| Positif → booké | 55 % | Référence | À mesurer |
| Présence | 75 % | Référence ; 55-65 % sans rappels, plus avec (00-RECHERCHE §3.6) | Conditionnée aux rappels |
| Rendement sourcing | 60 % | Bruts → envoyables après ICP, enrichissement, vérification | À mesurer (catch-all) |
| Sourcing / contact brut | 0,02 € | Apollo + Sirene (gratuit) | Moyenne |
| Enrichissement / contact final | 0,06 € | FullEnrich ~0,05-0,06 €/email trouvé | Moyenne |
| Vérification / email | 0,004 € | MillionVerifier ~37-39 $/10 000 | Solide |
| IA / contact | 0,01 € | Haiku batch N3 ≈ 0,002 € + marge pour N4 sur une minorité | Solide (majorant) |
| IA / réponse | 0,003 € | Classification + brouillon | Solide |
| Boîte | 6,90 €/mois | Google Workspace Business Starter HT | À confirmer |
| Domaine | 12 €/an | .fr / .com | Solide |
| Coût horaire opérateur | 28 €/h | ~42 k€ chargés / 1 500 h | Hypothèse France |
| Minutes / réponse | 4 | Lecture, validation du brouillon IA, CRM | Hypothèse |
| Minutes / positive | 15 | Qualification, créneaux, fiche | Hypothèse |
| Minutes / RDV booké | 10 | Confirmation, passation, suivi | Hypothèse |
| Heures fixes / client / mois | 13 | Revue hebdo, reporting, listes, copy, tests | Hypothèse |
| Setup lissé | 1 200 € / 6 mois | Durée de vie moyenne supposée | Hypothèse |

---

## F2 — Par client et par mois

Outils partagés au palier 10 clients (57 €/client).

| Poste | LOW COST | BASE | HIGH PERFORMANCE | SCALE |
|---|---:|---:|---:|---:|
| Hypothèses d'entonnoir | 1,0 % positif, 70 % présence | 1,5 %, 75 % | 2,5 %, 85 % | 1,8 %, 80 % |
| Contacts uniques | 1 900 | 1 900 | 2 500 | 2 500 |
| Emails | 7 600 | 7 600 | 10 000 | 10 000 |
| RDV honorés | 6,6 | 11,8 | 31,9 | 20,9 |
| **Data** (sourcing + enrichissement + vérification) | 159 € | 190 € | 419 € | 225 € |
| **IA** | 4 € | 19 € | 101 € | 38 € |
| **Boîtes + domaines** | 52 € | 123 € | 145 € | 145 € |
| **Automatisation et outils** (quote-part) | 57 € | 57 € | 57 € | 57 € |
| **Opérateurs** | 691 € | 860 € | 1 434 € | 619 € |
| **Coûts directs** | **963 €** | **1 250 €** | **2 156 €** | **1 084 €** |
| Recette (setup lissé inclus) | 2 030 € | 3 051 € | 7 075 € | 4 882 € |
| Marge brute | 1 067 € | 1 801 € | 4 919 € | 3 798 € |
| Marge brute % | 53 % | 59 % | 70 % | 78 % |

Grille : LOW COST, BASE et HIGH PERFORMANCE en phase de preuve (1 200 € +
500 €/mois + 200 €/RDV) ; SCALE en phase établie (1 500 € + 1 500 €/mois +
150 €/RDV).

**Poste « sales »** : la vente d'un client est portée par le moteur A (CAC,
F6), pas par la delivery. Elle n'apparaît pas ici pour ne pas la compter deux
fois.

**Écart avec le document de référence.** Il donne 520 à 1 200 € de coûts
directs. Le modèle BASE arrive à 1 250 € parce qu'il compte les 13 heures
fixes (revue, reporting, listes, tests) en plus du traitement des réponses,
et 17 boîtes au lieu d'une dizaine. La marge brute reste dans la fourchette
du document (1 700 à 2 380 €).

### Répartition des coûts directs (BASE)

```
Opérateurs      ████████████████████████████████████  69 %   860 €
Data            ████████                               15 %   190 €
Boîtes/domaines █████                                  10 %   123 €
Outils          ██                                      5 %    57 €
IA              █                                       2 %    19 €
```

---

## F3 — Par lead, par email, par RDV

| Unité | LOW COST | BASE | HIGH PERF. | SCALE |
|---|---:|---:|---:|---:|
| Coût par contact brut sourcé | 0,28 € | 0,39 € | 0,56 € | 0,26 € |
| Coût par contact envoyé (« lead ») | 0,51 € | 0,66 € | 0,86 € | 0,43 € |
| Coût par email | 0,127 € | 0,164 € | 0,216 € | 0,108 € |
| Coût par réponse | 10,1 € | 10,4 € | 10,8 € | 6,9 € |
| Coût par réponse positive | 50,7 € | 43,9 € | 34,5 € | 24,1 € |
| **Coût par RDV honoré** | **145 €** | **106 €** | **68 €** | **52 €** |
| Prix facturé par RDV honoré | 200 € | 200 € | 200 € | 150 € |

Le coût **data seul** par contact envoyé est de 0,08 à 0,17 € ; le coût
**tout compris** (heures incluses) est de 0,43 à 0,86 €. Un contact mal
ciblé ne coûte pas 0,10 € : il coûte les minutes de quelqu'un qui lit une
réponse inutile.

---

## F4 — Sensibilité (BASE, un paramètre à la fois)

| Paramètre modifié | RDV honorés | Coûts directs | Recette | Marge brute | Coût / RDV |
|---|---:|---:|---:|---:|---:|
| **BASE** | 11,8 | 1 250 € | 3 051 € | 1 801 € | 106 € |
| Positif 1,0 % | 7,8 | 1 159 € | 2 268 € | 1 109 € | 148 € |
| Positif 2,0 % | 15,7 | 1 341 € | 3 835 € | 2 494 € | 86 € |
| Positif 2,5 % | 19,6 | 1 432 € | 4 619 € | 3 187 € | 73 € |
| Présence 60 % (sans rappels) | 9,4 | 1 250 € | 2 581 € | 1 331 € | 133 € |
| Présence 85 % | 13,3 | 1 250 € | 3 365 € | 2 115 € | 94 € |
| Booking 45 % | 9,6 | 1 237 € | 2 624 € | 1 387 € | 129 € |
| Coût horaire 35 € | 11,8 | 1 465 € | 3 051 € | 1 586 € | 125 € |
| Coût horaire 22 € | 11,8 | 1 066 € | 3 051 € | 1 986 € | 91 € |
| 2 min / réponse (IA) | 11,8 | 1 138 € | 3 051 € | 1 913 € | 97 € |
| 7 h fixes (automatisation du reporting) | 11,8 | 1 082 € | 3 051 € | 1 969 € | 92 € |
| Rendement sourcing 45 % | 11,8 | 1 275 € | 3 051 € | 1 776 € | 108 € |
| Enrichissement 0,12 € | 11,8 | 1 364 € | 3 051 € | 1 687 € | 116 € |

**Lecture.**

1. Le taux de positif et la présence pèsent 5 à 10 fois plus que tous les
   postes de coût. Un point de présence vaut plus qu'une renégociation
   d'outil.
2. Parmi les coûts, les heures dominent : 2 minutes par réponse au lieu de 4
   rapportent 112 €/client/mois ; doubler le prix de l'enrichissement en
   coûte 114 €.
3. La marge reste positive même à 0,4 % de positif (3 RDV, ~280 € de marge) :
   le retainer et le setup protègent le bas de la distribution. C'est le
   rôle voulu du setup (MAJ-OFFRE §1).

---

## F5 — Le plafond de facturation

HIGH PERFORMANCE produit 32 RDV honorés. À 200 €, la facture variable monte à
6 400 €/mois pour un client qui a signé en entendant « 8 à 12 ». Voir
[B7.1](02-MOTEUR-B.md).

| Plafond de RDV facturables (HIGH PERF.) | Recette | Marge brute |
|---|---:|---:|
| Aucun | 7 075 € | 4 919 € |
| 15 | 3 700 € | 1 544 € |
| 12 | 3 100 € | 944 € |

Avec un plafond, les RDV au-delà sont livrés **gratuitement** ou ne sont pas
produits. Livrer 32 RDV pour le prix de 12 coûte ~2 150 € de production pour
~3 100 € de recette : la marge fond. Deux voies, à trancher (voir
[11-AUDIT-V2](11-AUDIT-V2.md)) :

- **plafond + palier supérieur proposé** : le client choisit 12, 20 ou 30 RDV
  par mois, le parc est dimensionné en conséquence, et la sur-livraison se
  fait en valeur (B7) plutôt qu'en volume non facturé ;
- **pas de plafond, accord écrit à chaque dépassement** : plus de recette,
  plus de risque de churn par surprise de facture.

---

## F6 — Par client acquis (moteur A)

Hypothèses : 1,2 % de positif, 60 % de booking, 75 % de présence, 22 % de
signature sur RDV tenu, 0,12 €/contact tout compris, setter 28 €/h, closer
45 €/h, 2 h de closer par RDV tenu, 400 € de commission par client
(hypothèse, sujet ouvert), 250 €/mois d'outils.

| Signatures / mois | Coût total / mois | CAC |
|---:|---:|---:|
| 2 | 2 470 € | 1 235 € |
| 4 | 4 691 € | 1 173 € |
| 8 | 9 116 € | 1 139 € |
| 12 | 13 556 € | 1 130 € |
| 20 | 22 407 € | 1 120 € |

### Payback et LTV

| Indicateur | Phase de preuve (BASE) | Phase établie (SCALE) |
|---|---:|---:|
| CAC | ~1 170 € | ~1 150 € |
| Setup encaissé à la signature | 1 200 € | 1 500 € |
| Payback du CAC | **à la signature** | à la signature |
| Marge brute mensuelle (hors setup lissé) | ~1 600 € | ~3 550 € |
| Durée de vie supposée | 6 mois | 9 mois |
| LTV (marge brute cumulée + setup) | ~10 800 € | ~33 500 € |
| LTV / CAC | ~9 | ~29 |

La durée de vie est l'hypothèse la plus fragile de ce tableau. À 3 mois
(le minimum contractuel), la LTV de la phase de preuve tombe à ~6 000 € et le
ratio à ~5 : toujours sain.

---

## F7 — Par scénario de parc

| Scénario | Parc | Marge brute totale / mois (moteur B) | Coût moteur A / mois | Contribution avant frais de structure |
|---|---:|---:|---:|---:|
| LOW COST (lancement) | 5 | ~5 300 € | ~2 500 € | ~2 800 € |
| BASE | 10 | ~18 000 € | ~2 500 € | ~15 500 € |
| BASE | 25 | ~40 400 € | ~5 800 € | ~34 600 € |
| SCALE | 50 | ~182 200 € | ~6 900 € | ~175 300 € |
| SCALE | 100 | ~370 100 € | ~13 500 € | ~356 600 € |

Les frais de structure (direction, locaux, compta, juridique, salaires non
imputés) ne sont pas modélisés. Le document de référence fixe le seuil de
rentabilité de la structure à 6 à 8 clients actifs ; le modèle est cohérent
avec ce seuil si les frais de structure sont de l'ordre de 10 à 15 k€/mois.

La marge LOW COST à 5 clients est calculée sur le scénario LOW COST (1 067 €
par client) ; les autres lignes viennent des tableaux de montée en charge du
simulateur (encadrement inclus).
