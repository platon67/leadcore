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

Business documents, SOPs and client-facing material are written in French.

## Conventions

- Reference documentation lives in `docs/`.
- `.claude/settings.json` enables the `caveman` and `taste-skill` plugins
  repository-wide. `taste-skill` carries the frontend design skills used for the
  sales deck in `deck/`.
- `.claude/skills/stop-slop/` holds the stop-slop skill (MIT, Hardik Pandya):
  removes AI writing patterns from prose. Use it on client-facing copy,
  sequences and deck text.
