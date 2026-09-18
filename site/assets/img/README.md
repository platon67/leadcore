# Photographies

Quatre images, retravaillées en bichromie pour appartenir à la charte.

| Fichier | Sujet | Ce qu'elle illustre |
|---|---|---|
| `base-*` | façade perforée à maille régulière | la base construite ligne par ligne |
| `infra-*` | baies de serveurs et câblage | l'infrastructure d'envoi qu'on exploite |
| `canaux-*` | la Terre de nuit, lumières des villes | deux canaux qui couvrent le même marché |
| `agenda-*` | tours vues du sol, ciel chargé | l'agenda qui se remplit |

## Provenance et licence

Toutes viennent d'**Unsplash**, sous [licence Unsplash](https://unsplash.com/license) :
usage commercial autorisé, sans attribution obligatoire. Identifiants d'origine :

| Fichier | Identifiant Unsplash |
|---|---|
| `base` | `photo-1493397212122-2b85dda8106b` |
| `infra` | `photo-1558494949-ef010cbdcc31` |
| `canaux` | `photo-1451187580459-43490279c0fa` |
| `agenda` | `photo-1511818966892-d7d671e672a2` |

## Traitement

Les quatre passent par **la même rampe**, ce qui est la seule raison pour
laquelle elles se lisent comme une série et non comme quatre prises de banque
d'images :

```bash
ffmpeg -i <source>.jpg -vf "
  scale=<w>:<h>:force_original_aspect_ratio=increase,crop=<w>:<h>,
  eq=contrast=1.22:brightness=-0.06:saturation=0,
  format=gray,
  lutrgb=r='5+(128-5)*val/255':g='14+(172-14)*val/255':b='12+(155-12)*val/255',
  vignette=PI/4.6" -y out.png
ffmpeg -i out.png -c:v libwebp -quality 68 -compression_level 6 -y <nom>-<w>.webp
ffmpeg -i out.png -q:v 6 -y <nom>-<w>.jpg
```

Désaturation totale, puis interpolation linéaire entre une ombre graphite
`rgb(5,14,12)` et une haute lumière émeraude désaturée `rgb(128,172,155)`. Une
première version montait la haute lumière à `rgb(170,216,198)` : sur un fond
quasi noir les deux images les plus claires brillaient et se décollaient de la
page. La vignette les fait rentrer dans le sol.

Deux largeurs, 960 et 560, en WebP avec repli JPEG. 136 Ko pour les quatre en
960, 51 Ko en 560.

## Si vous les remplacez

Repassez la nouvelle image par la commande ci-dessus, sans changer les valeurs
de la rampe. Une photo non traitée posée à côté des trois autres se verra
immédiatement.
