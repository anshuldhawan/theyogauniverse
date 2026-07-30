# ANL — Analytics & Reporting (§7.17)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 5 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| ANL-1 | done | 4 | governed event schema; advertising-only events structurally excluded from post-contact funnel (src/lib/analytics.ts); production sink = PostHog via Vercel Marketplace (server: src/lib/posthog-server.ts, browser: src/components/posthog-provider.tsx) |
| ANL-2 | in-progress | 4 | comprehensive governed KPI calculator +  advertising-only reach boundary and tests added (`src/lib/analytics-reporting.ts`); payment-risk event producers and warehouse-backed dashboard data remain |
| ANL-3 | in-progress | 4 | per-city coverage/freshness/verification/duplicate reporting split structurally by transactional vs advertising-only, tested and surfaced at `/admin/analytics`; production quality-feed adapter remains |
| ANL-4 | in-progress | 4 | deterministic versioned server assignment, allocation/holdouts, weighted variants and enforced SRCH-16 0.80–0.85 band + tests added; assignment still needs wiring into live rank requests and active experiment configuration |
| ANL-5 | done | 4 | optional PostHog, Vercel Analytics, Speed Insights and replay are not mounted before affirmative consent; GPC opt-out honoured (`src/components/ComplianceProviders.tsx`, consent policy and ANL tests) |
