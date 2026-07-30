# The Yoga Universe

A two-sided global platform: the definitive **index** of yoga, meditation and breathwork providers across 50 cities, plus a **US-domestic transactional marketplace** (Stripe Connect). Built to [docs/requirements/yoga-platform-requirements-v1.2.md](docs/requirements/yoga-platform-requirements-v1.2.md).

**The index is global, the business is domestic.** 20 US cities transact; 30 Continental Europe / UK / Australia cities are advertising-only. Transactability is evaluated per listing (§4.3 of the PRD) and derived, never hand-set.

## Stack

- **Next.js (App Router)** on **Vercel** — SSR for every indexable page (SEO-1)
- **Neon Postgres** + Drizzle ORM (falls back to in-memory seed data in dev when `DATABASE_URL` is unset)
- **Clerk** for auth (guest-only mode when keys are unset)
- **Stripe** Connect / Tax / Billing / Radar behind an internal payment-orchestration interface (mock provider in dev)
- **Upstash Redis** for rate limiting and cache
- **next-intl** — 7 launch languages

## Development

```bash
pnpm install
pnpm dev          # runs against seed data, no external services needed
pnpm test         # unit tests (domain logic: transactability, ranking, scheduling, booking, ledger)
pnpm typecheck
pnpm lint
pnpm tracker:validate   # tracker <-> requirements baseline integrity
```

Seed data is extracted from the design prototype: `pnpm seed:extract`.

## Project tracker

Requirement-level progress lives in [tracker/](tracker/), pinned to the v1.2 baseline by checksum. See [tracker/README.md](tracker/README.md) for the process, including re-baselining when a new requirements version lands. CI fails if the tracker and the requirements document drift.

## Repo map

| Path | Contents |
|---|---|
| `docs/requirements/` | Versioned PRDs; v1.2 is the active baseline |
| `docs/design/` | Design prototype, frontend notes, brand guidelines (reference only) |
| `tracker/` | Requirement-level project tracker + validation script |
| `src/app/` | Routes (public site, provider dashboard, admin, API) |
| `src/components/` | The Yoga Universe design system and UI components |
| `src/db/` | Drizzle schema and migrations |
| `src/lib/` | Domain services: transactability, ranking, scheduling, booking, payments, tax, ledger |
| `src/data/seed/` | Dev seed dataset extracted from the prototype |

## Deployment (Vercel)

1. Import the repo into Vercel (framework preset: Next.js).
2. Provision Neon Postgres and Upstash Redis from the Vercel Marketplace; set Clerk and Stripe keys.
3. `vercel env pull .env.development.local` for local development against real services.

Environment variables are documented in [.env.example](.env.example). All geo-specific behaviour (cities, payout eligibility, Track B region flags, payment methods, commission rates) is configuration, never code (NG-5a).
