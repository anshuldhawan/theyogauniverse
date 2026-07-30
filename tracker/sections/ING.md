# ING — Data Ingestion, Seeding & Claim (§7.13)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 12 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| ING-1 | in-progress | 4 | connector contract/runner, normalisation, resolution, confidence scoring, staging and publish gate implemented/tested; concrete production source connectors pending |
| ING-2 | done | 4 | entity resolution: normalised name+geo match, same-name-different-city routes to human review (tested) |
| ING-3 | done | 4 | durable-field allowlist is the only auto-publish payload; tested in stageCandidate |
| ING-4 | done | 4 | schedules and prices are explicitly rejected from automated staging publication; tested |
| ING-5 | done | 4 | third-party image fields are explicitly rejected from automated publication; tested |
| ING-6 | in-progress | 4 | Claim page with authenticity-first pitch + performance stats; verification handshake pending |
| ING-7 | done | 4 | opt-out tombstones survive re-crawls; public /legal/removal request flow with instant verified removal, one-click admin honour, 72h SLA badge (src/lib/removal.ts, src/app/actions/removal.ts, src/lib/repo suppression; tested) |
| ING-8 | done | 4 | field-level source URL/method/timestamp/agent version emitted for every staged durable field; schema persists it; tested |
| ING-9 | in-progress | 4 | 90-day demotion/180-day unpublish disposition with faster advertising-only decay added/tested; scheduler and public unpublication integration pending |
| ING-10 | in-progress | 4 | fail-closed robots/ToS/rate policy gate plus admin legal-register surface implemented/tested; legal review remains operational |
| ING-11 | in-progress | 4 | provider-facing incorrect/closed reporting feeds unified Ops queue; general suggest-edit workflow and status updates pending |
| ING-12 | done | 4 | executor policy routes fetching to crawlers, deterministic work to parsers, and permits model inference only for unstructured extraction/normalisation/disambiguation with low-confidence human review (src/lib/operations-controls.ts, tested) |
