# NFR — Non-Functional Requirements (§8)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 12 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| NFR-1 | in-progress | 4 | machine-readable availability SLOs and production monitor plan encoded; achieved 99.9%/99.5% requires external production telemetry |
| NFR-2 | in-progress | 4 | latency budgets encoded and CWV Lighthouse gates run in CI; production p95 search/TTFB/confirmation evidence remains external |
| NFR-3 | in-progress | 4 | launch and 10× headroom targets are machine-readable/tested and indexed schema exists; production-shaped capacity/load evidence remains external |
| NFR-4 | in-progress | 4 | tested subject-country residency routing/assertion for US/EU/AU; actual multi-region databases, routing, and vendor residency evidence remain external |
| NFR-5 | n-a | 4 | independent WCAG audit removed by owner decision 29 Jul 2026 (docs/decisions/decision-nfr5-wcag-audit.md); no accessibility filters marketed or shipped; semantic best efforts via BLG-53/56 |
| NFR-6 | done | 4 | one responsive mobile-first web client; no native client or install interstitial |
| NFR-7 | in-progress | 4 | expanded security/permissions headers, dependency update monitoring, Clerk-protected internal surfaces and CI checks; ASVS L2, 2FA policy evidence, pen test and bug bounty are external |
| NFR-8 | in-progress | 4 | HSTS plus tested AES-256-GCM envelope with dedicated special-category key scope; managed datastore at-rest/KMS evidence remains external |
| NFR-9 | in-progress | 4 | Sentry tracing/errors, Vercel Speed Insights and PostHog RUM are encoded; per-region synthetic booking/contact/payment monitoring requires provisioned endpoints |
| NFR-10 | in-progress | 4 | RPO/RTO values and a quarterly isolated-restore runbook are encoded; only an executed timed restore can complete this requirement |
| NFR-11 | done | 4 | idempotency keys on checkout, same key returns same booking (src/lib/booking.ts, tested) |
| NFR-12 | done | 4 | public API versioned under /api/v1 |
