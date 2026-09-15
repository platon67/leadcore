# Mise à jour de l'offre et du process — septembre 2026

Document interne. Il reprend les décisions prises après l'audit du modèle, ce
qu'elles changent dans le fonctionnement quotidien, et ce qui reste ouvert.

Référence : [`LEADCORE-FONCTIONNEMENT.md`](LEADCORE-FONCTIONNEMENT.md), mis à
jour en conséquence.

---

## 1. Ce qui change

| Sujet | Avant | Maintenant | Raison |
|---|---|---|---|
| Ticket client minimum | 3 000 € | **7 000 €**, ou un récurrent de valeur équivalente | À 3 000 €, le client ne récupère qu'environ 1,3 fois sa dépense. Il ne renouvelle pas, et il ne recommande pas. |
| Frais de setup | aucun | **1 200 €**, facturés au démarrage | Le mois 1 coûte entre 400 et 800 € d'infrastructure et de données, plus 20 à 30 heures de travail, pour 500 € de recette. |
| Engagement | mensuel dès le départ | **3 mois**, puis mensuel | Le warm-up prend 2 à 3 semaines et un cycle d'optimisation en prend 4. Avant 90 jours, on ne sait pas si le marché répond. |
| Promesse de volume | 15 à 20 RDV / mois | **8 à 12 RDV / mois** annoncés | On livre 15 à 20 quand le marché le permet. Sur-livrer fidélise, manquer une promesse coûte le client et le cas client. |
| No-show | non facturé, sans plus de précision | **Prospect absent** : replanifié une fois, facturé seulement s'il a lieu. **Annulation ou absence côté client** : facturée 50 %. | Le taux de présence dépend aussi du client. On ne porte pas seul un risque qu'on ne contrôle qu'à moitié. |
| Reporting | s'arrête au RDV honoré | ajout du **statut de chaque RDV à J+30** (perdu / en cours / signé + montant) | Sans le CA généré, impossible de prouver le ROI, donc impossible de monter les prix ni de produire un cas client chiffré. |
| Segments | non suivis dans le temps | **plan de renouvellement écrit dès l'onboarding** | À 2 400 contacts touchés par mois, un segment s'épuise en 4 à 6 mois. Le décrochage arrive au mois 5 si rien n'est prévu. |

### Grille tarifaire retenue

**Phase de preuve** (aujourd'hui, avant cas clients chiffrés)

- 1 200 € de setup, une fois, au démarrage.
- 500 € / mois.
- 200 € par rendez-vous honoré.
- Engagement de 3 mois, puis mensuel.

**Phase établie** (à partir de deux cas clients avec CA signé documenté)

- 1 500 € de setup.
- 1 500 € / mois.
- 150 € par rendez-vous honoré.

Le déplacement du poids vers le retainer est volontaire : en phase de preuve,
86 % de la recette est variable, ce qui rend un mauvais mois de délivrabilité
insupportable pour la trésorerie.

---

## 2. Ce que ça change dans le process

### Cycle de vente

- Le qualificatif de ticket passe à 7 000 € dans le script d'appel et dans la
  grille de qualification des prospects Leadcore.
- Nouvelle objection à traiter : les frais de setup. Réponse : ils couvrent le
  temps où rien ne sort encore, c'est-à-dire les domaines, le warm-up, la base
  et les séquences. Un prestataire qui ne facture pas le setup le facture
  ailleurs, ou le bâcle.
- Nouvelle objection : l'engagement de 3 mois. Réponse : le warm-up seul prend
  2 à 3 semaines. Un engagement mensuel promettrait un résultat qu'aucune
  infrastructure ne peut produire en 30 jours.
- Annoncer 8 à 12 rendez-vous par mois. Ne jamais annoncer 15 à 20, même quand
  le marché le permet.

### Contrat

Clauses à ajouter ou à préciser :

1. Frais de setup, montant et exigibilité au démarrage.
2. Durée initiale de 3 mois, puis reconduction mensuelle.
3. Politique de no-show, dans les termes du tableau ci-dessus.
4. Engagement du client à renvoyer le statut de chaque rendez-vous à J+30.
5. Propriété des données : qui garde la base et les domaines à la sortie.

### Onboarding

Ajouts à la checklist :

- [ ] Frais de setup facturés et encaissés avant le démarrage technique
- [ ] Durée initiale de 3 mois actée au contrat
- [ ] Politique de no-show relue avec le client
- [ ] Canal de retour à J+30 défini (fichier partagé, CRM ou point mensuel)
- [ ] Plan de renouvellement de segments écrit : segment 1 actif, segments 2 et
      3 identifiés, volume disponible estimé pour chacun

### Reporting

Le reporting hebdomadaire ne change pas. Le reporting mensuel gagne deux
lignes :

- statut des rendez-vous du mois précédent à J+30 ;
- coût par client signé, en plus du coût par rendez-vous honoré.

### Suivi des segments

Nouveau tableau à tenir par client : segment, volume total estimé, volume déjà
touché, volume restant, taux de réponse observé. Quand le volume restant passe
sous deux mois de production, le segment suivant est préparé.

---

## 3. Volumes de référence

Ce qu'il faut réellement produire pour 12 rendez-vous honorés dans un mois :

```
12 honorés         ÷ 0,75 (taux de présence)      = 16 rendez-vous bookés
16 bookés          ÷ 0,55 (positif vers booké)    = 29 réponses positives
29 positives       ÷ 0,015 (taux de positif)      = 1 900 contacts uniques
1 900 contacts     × 4 touches                    = 7 600 emails
7 600 emails       ÷ (35 envois/jour × 21 jours)  = ~10 boîtes actives
```

Deux conséquences opérationnelles : il faut environ 1 900 contacts en ICP
nouveaux chaque mois, et environ 120 réponses à traiter par client et par mois.
C'est cette charge de traitement, pas l'envoi, qui fixe le nombre de clients
qu'un opérateur peut suivre.

---

## 4. Économie d'unité mise à jour

Par client et par mois, en phase de preuve, à 12 rendez-vous honorés :

| Poste | Montant |
|---|---|
| Retainer | 500 € |
| Variable (12 × 200 €) | 2 400 € |
| **Recette mensuelle** | **2 900 €** |
| Infrastructure (domaines, boîtes, séquenceur) | 120 à 200 € |
| Données et enrichissement | 100 à 400 € |
| Main-d'œuvre de traitement des réponses | 300 à 600 € |
| **Coûts directs** | **520 à 1 200 €** |
| **Marge brute** | **1 700 à 2 380 €** |

Le mois 1 reste déficitaire sans les frais de setup : environ 800 € de coûts
pour 500 € de recette, avant même de compter le temps passé. Avec les 1 200 €
de setup, le premier mois est à l'équilibre.

Seuil de rentabilité de la structure : environ 6 à 8 clients actifs. Un
opérateur suit 4 à 6 clients, la charge de traitement des réponses étant le
facteur limitant.

---

## 5. Ce qui reste à trancher

Ces sujets sont ouverts et ne sont pas traités dans cette mise à jour.

| Sujet | Ce qu'il faut décider | Pourquoi ça compte |
|---|---|---|
| **Niche** | Une verticale unique pour les six prochains mois | Sans verticale, chaque client repart de zéro : listes, angles, objections, et aucun cas client réutilisable. |
| **RGPD et conformité** | Base légale, mentions, opt-out, registre, contrat de sous-traitance | Un service juridique posera la question avant de signer. Documenté en amont, ça devient un argument. |
| **Rémunération des commerciaux** | Assiette et durée de la commission des closers, KPI réels des setters | Une commission de 20 % sur la valeur vie d'un client récurrent détruit la marge. Le KPI « 60 à 100 contacts par jour » ne correspond pas à un setter qui traite des réponses. |
| **Canal 2** | LinkedIn en complément de l'email, et à partir de quel client | L'email seul est fragile : un domaine bloqué et la production tombe à zéro. |

---

## 6. Suivi de la mise à jour

- [x] Grille tarifaire arrêtée
- [x] Deck commercial aligné (ticket, setup, engagement, promesse, no-show, J+30)
- [x] Document de fonctionnement mis à jour
- [ ] Contrat type mis à jour
- [ ] Modèle de reporting mensuel mis à jour
- [ ] Tableau de suivi des segments créé
