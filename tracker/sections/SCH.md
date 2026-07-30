# SCH — Scheduling Engine (§7.5)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 10 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| SCH-1 | done | 3 | RRULE + EXDATE, holiday exclusions, seasonal rule swaps, and IANA-TZ expansion tested (src/lib/scheduling.ts, scheduling-controls.ts) |
| SCH-2 | done | 3 | occurrence override fields modelled; pure override resolution covers teacher/room/capacity/price/status without mutating parent (src/db/schema.ts, src/lib/scheduling-controls.ts; tested) |
| SCH-3 | in-progress | 3 | substitute + review attribution resolution implemented/tested; booked-student notification and provider assignment UI pending |
| SCH-4 | done | 3 | organisation-scoped room/resource overlap detection ignores cancelled/non-overlapping occurrences (src/lib/scheduling-controls.ts; tested) |
| SCH-5 | in-progress | 3 | NY spring/fall, Sydney southern-hemisphere, Phoenix no-DST tested; every indexed country and Australian state-by-state matrix still pending |
| SCH-6 | in-progress | 3 | capacity/waitlist limits plus enabled/unreserved spot selection tested; room-map UI and transactional spot persistence pending |
| SCH-7 | in-progress | 3 | open/close, late cutoff, and early-bird domain states tested (src/lib/scheduling-controls.ts); listing persistence/UI enforcement pending |
| SCH-8 | in-progress | 3 | capped, idempotent term expansion tested (src/lib/scheduling-controls.ts); persisted bulk-publish workflow/UI pending |
| SCH-9 | in-progress | 3 | booking attendance gates review eligibility; occurrence lifecycle transitions and no-show resolution remain unimplemented |
| SCH-10 | done | 3 | advertising-only capacity is advisory copy only; no held availability (PAY-17a) |
