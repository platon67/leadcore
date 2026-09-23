# Leadcore

Leadcore is a B2B lead generation agency: it fills clients' sales pipelines with
qualified prospects and booked sales meetings by running outbound email campaigns
on their behalf.

## Context for agents working in this repository

The authoritative operating document is
[`docs/LEADCORE-FONCTIONNEMENT.md`](docs/LEADCORE-FONCTIONNEMENT.md) (French,
September 2026). Read it before working on anything business-related. It covers
positioning, pricing, both operating engines, KPIs, SOPs, team structure and the
scaling plan. Key points:

- **Target clients**: B2B SMBs whose customers are worth at least €7,000 each
  (or an equivalent recurring value).
- **Pricing baseline**: proof phase = €1,200 setup + €500/month retainer + €200
  per qualified meeting that shows, on a 3-month initial term; after case
  studies = €1,500 setup + €1,500/month + €150 per meeting.
- **Delivery target**: 8–12 qualified meetings per client per month quoted to
  the client, 15–20 as the internal goal.
- **No-show policy**: a prospect no-show is rescheduled once and billed only if
  it happens; a cancellation on the client's side is billed at 50%.
- **J+30 follow-up**: the client reports what each meeting became (lost, open,
  signed with amount). It is contractual, and it is what unlocks higher pricing.
- **Two engines, kept separate**: Engine A acquires Leadcore's own clients;
  Engine B delivers campaigns for those clients.
- **Core principles**: data before volume, quality before quantity, process
  before people, automate only after validation, measure every funnel step.
- The definition of a qualified meeting is contractual and per-client. Never
  change it retroactively to improve reported KPIs.

The September 2026 revision of the offer and what it changes in the process is
in [`docs/MAJ-OFFRE-2026-09.md`](docs/MAJ-OFFRE-2026-09.md), including the
subjects still open: niche, GDPR, sales-rep compensation and a second channel.

[`docs/os/`](docs/os/README.md) is the Outbound & Delivery OS (September
2026): research with sources, both engines in implementable detail, the tool
stack, 30 n8n workflows (LC-001 to LC-030), a Postgres schema
(`docs/os/schema.sql`), unit economics, failure modes, compliance with the
points still awaiting legal review, SOPs, roadmap and a self-audit. Its
figures come from `tools/simulateur_os.py` (Python 3, no dependencies); rerun
it rather than editing numbers by hand. The OS proposes but does not change
the price grid, the 8–12 meeting promise or the qualified-meeting definition.

Business documents, SOPs and client-facing material are written in French.

## Conventions

- Reference documentation lives in `docs/`.
- `site/` holds the public marketing site: static HTML and CSS, no build step.
  It has two jobs, inform the prospects reached by outbound and let them book a
  call. Booking has its own page, `site/rendez-vous.html`, and is **handled by
  the site itself** (`site/assets/rdv.js`), which
  reads availability and creates the booking through Cal's public API straight
  from the browser — no key, no backend, no secret, so the site stays static.
  The Cal account, the event type id and the contact address live in
  `site/assets/config.js`. See `site/README.md`.
- `.claude/settings.json` enables the `caveman`, `taste-skill` and
  `ui-ux-pro-max` plugins repository-wide. `taste-skill` carries the frontend
  design skills used for the sales deck in `deck/`. `ui-ux-pro-max`
  (nextlevelbuilder, MIT) adds seven design skills and a searchable local
  database of styles, palettes, font pairings and UX rules; its search script
  needs Python 3. Use it for work on `site/` and `deck/`.
- `.claude/skills/` holds eleven vendored skills, each with its source and
  licence recorded. The first eight are for design work on `site/` and
  `deck/`:
  - `stop-slop` (MIT, Hardik Pandya) — removes AI writing patterns from prose.
    Use it on client-facing copy, sequences and deck text.
  - `anti-ui-slop` (MIT, UIZZE) — the markers of interface built without
    intent. Note its rule against inventing metrics: the home page's
    performance panel breaks it **knowingly**, on the owner's instruction, and
    `site/README.md` carries replacing those figures as its first pre-launch
    item.
  - `scroll-experience`, `fixing-motion-performance`, `high-end-visual-design`,
    `design-spells` — from `sickn33/agentic-awesome-skills`, see
    `.claude/skills/AGENTIC-AWESOME-SKILLS.md`.
  - `interaction-design` (from `wshobson/agents`) and `premium-frontend-ui`
    (from `github/awesome-copilot`).

  The last three are about how the agent works rather than what it builds,
  and apply to any code in the repository. See
  `.claude/skills/OUTILS-DE-TRAVAIL.md`, which records what is known about
  their provenance and two caveats:
  - `karpathy-guidelines` (MIT, `forrestchang/andrej-karpathy-skills`) —
    four rules against common LLM coding mistakes: think before coding,
    simplicity first, surgical changes, verifiable success criteria.
  - `headroom` and `rtk` — local context and shell-output compression. Both
    need a CLI that is **not installed in this environment**, and neither was
    supplied with a licence.
