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

- **Target clients**: B2B SMBs with an average deal size of at least €3,000.
- **Pricing baseline**: proof phase ≈ €500/month retainer + €200 per qualified
  meeting that shows; after case studies ≈ €1,000/month + €300 per meeting.
- **Delivery target**: 15–20 qualified meetings per client per month.
- **Two engines, kept separate**: Engine A acquires Leadcore's own clients;
  Engine B delivers campaigns for those clients.
- **Core principles**: data before volume, quality before quantity, process
  before people, automate only after validation, measure every funnel step.
- The definition of a qualified meeting is contractual and per-client. Never
  change it retroactively to improve reported KPIs.

Business documents, SOPs and client-facing material are written in French.

## Conventions

- Reference documentation lives in `docs/`.
- `.claude/settings.json` enables the `caveman` plugin repository-wide.
