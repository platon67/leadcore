# Skills de méthode (par opposition aux skills de design)

Les huit skills documentées à côté servent le travail sur `site/` et `deck/`.
Les trois ci-dessous ne parlent pas d'interface : elles portent sur la façon
dont l'agent travaille. Elles ont été ajoutées le 20 septembre 2026.

| Skill | Ce qu'elle fait | Source | Licence |
|---|---|---|---|
| `karpathy-guidelines` | quatre règles contre les erreurs de codage courantes des LLM : réfléchir avant d'écrire, simplicité d'abord, modifications chirurgicales, critère de succès vérifiable | `forrestchang/andrej-karpathy-skills`, d'après les observations d'Andrej Karpathy | MIT (déclarée dans `plugin.json`) |
| `headroom` | compression locale du contexte : sorties d'outils, journaux, fichiers | projet Headroom (`headroom-ai` sur PyPI) | **non fournie** |
| `rtk` | réduction des sorties de commandes shell (Rust Token Killer) | `rtk-ai/rtk` | **non fournie** |

## Deux réserves à connaître

**Les deux CLI ne sont pas installées ici.** `headroom` et `rtk` sont absentes
du conteneur, et les skills correspondantes décrivent des commandes qui
n'existent pas. Les deux prévoient le cas — elles demandent de vérifier la
présence de l'outil et de retomber sur les commandes natives — donc elles ne
cassent rien, mais elles ne servent à rien tant que les CLI ne sont pas là.

**Leur licence n'est pas connue.** Les deux fichiers ont été fournis en
`.md` isolé, sans en-tête de licence ni dépôt d'origine attaché. Le reste du
dossier enregistre systématiquement source et licence ; ici on ne peut pas.
À vérifier auprès des dépôts amont avant toute rediffusion.

## Ce qui n'a pas été fait

`karpathy-guidelines` est aussi distribuée en amont sous forme de `CLAUDE.md`
à fusionner dans celui du projet. On a retenu la forme skill : le `CLAUDE.md`
de Leadcore décrit l'activité, pas la méthode de codage. La contrepartie est
qu'une skill ne s'applique que lorsqu'elle est appelée, là où un `CLAUDE.md`
s'applique à chaque tour. Si les règles doivent valoir par défaut, c'est le
fichier amont `CLAUDE.md` qu'il faut fusionner.
