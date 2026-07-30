# ADM — Admin & Ops Console (§7.16)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 10 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| ADM-1 | in-progress | 4 | storage-agnostic search/edit/merge/split/unpublish, immutable snapshot audit and rollback engine + tests added (`src/lib/admin-operations.ts`); production record adapters and mutation UI remain |
| ADM-2 | in-progress | 4 | credential/insurance/claim/disputed-claim assignment, resolution, audit and SLA engine + tests added; durable queue adapter and working mutation UI remain |
| ADM-3 | done | 4 | moderation queue with reason codes, escalation, logged resolution (src/app/admin/moderation, src/lib/moderation.ts) |
| ADM-4 | in-progress | 4 | translated labels, locale fallback and synonym resolution domain + tests added; durable taxonomy repository and full CRUD UI remain |
| ADM-5 | done | 4 | Track B per-region flag + payment methods + commissions all config (src/lib/config/markets.ts); surfaced in console |
| ADM-6 | in-progress | 4 | refund/adjustment/commission workflow, two-distinct-approver escrow control, immutable execution state and Stripe-vs-ledger reconciliation engine + tests added; Stripe execution/persistence adapters remain |
| ADM-7 | in-progress | 4 | consent-gated, 30-minute, audit-logged impersonation session engine + tests added; provider consent capture and dashboard session wiring remain |
| ADM-8 | in-progress | 4 | identity-gated access/rectification/erasure/portability workflow with 30-day SLA timers + tests added; cross-store fulfillment/export/erasure adapters remain |
| ADM-9 | in-progress | 4 | validated config-only city activation plans generate city/studio/school routes and enforce payout eligibility + tests; persistent no-deploy config writer remains |
| ADM-10 | done | 4 | transactability console: payability x tax track x performance country with WHY line (src/app/admin/page.tsx) |
