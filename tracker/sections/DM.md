# DM — Domain Model rules (§6.1)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 8 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| DM-1 | done | 1 | teaches_at m2m + time-bounded with mutual confirmation (src/db/schema.ts) |
| DM-2 | done | 1 | listings/occurrences separate; per-occurrence teacher/room/capacity/price/status overrides (schema) |
| DM-3 | done | 1 | provenance/confidence_score/last_verified_at/source_ref shared columns on all entities |
| DM-4 | done | 1 | integer minor units + ISO-4217 everywhere; src/lib/money.ts with unit tests incl JPY exponent |
| DM-5 | done | 1 | timestamptz UTC; occurrences carry IANA timezone identifier |
| DM-6 | in-progress | 1 | deleted_at soft-delete on entity tables + account_privacy_requests export/erase queue; destructive GDPR erasure worker (COMP-4) still pending |
| DM-7 | done | 1 | derived engine src/lib/transactability.ts; request-scoped for Track B; no static column; 7 unit tests |
| DM-8 | done | 1 | supply_type + performance_country on listings; publish-time non-null enforcement in app layer |
