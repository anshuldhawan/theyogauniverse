# LST — Listing Types & Inventory (§7.4)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 14 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| LST-1 | in-progress | 2 | Typed recurring-class details cover RRULE/EXDATE, timezone, duration, capacity, teacher, room and hybrid delivery; editor/persistence pending |
| LST-2 | in-progress | 2 | Typed one-off/series event schema supports all named event categories; editor/persistence pending |
| LST-3 | in-progress | 2 | Typed cohort course schema covers dates, sessions, capacity, attendance and make-up policy; UI pending |
| LST-4 | in-progress | 2 | Retreat schema covers departures, independent room inventory/pricing, inclusions, itinerary, deposits/balance, limits and insurance prompt; UI pending |
| LST-5 | in-progress | 2 | Training schema covers hours/accreditation/modules/contact hours/lead/prereqs/application/caps/instalments/accommodation/delivery; UI pending |
| LST-6 | in-progress | 2 | Private-session schema covers availability, duration pricing, location modes, travel radius and surcharge; UI pending |
| LST-7 | in-progress | 2 | On-demand schema requires private media refs, chapters/duration/level/bundles and short-lived signed URL TTL; storage/player pending |
| LST-8 | in-progress | 2 | Venue schema covers capacity/rooms/accommodation/catering/availability/day-rate range and publish guard forbids transaction price; UI pending |
| LST-9 | done | 2 | Draft/published/paused/archived, scheduled publish, public/unlisted/private visibility and publish invariants implemented/tested |
| LST-10 | in-progress | 2 | CSV import/export, integer bulk price changes, deduplicated bulk-cancel refund/notification commands implemented; dashboard/refund execution pending |
| LST-11 | in-progress | 2 | Clone domain operation copies pricing/policies into a fresh draft and is tested; dashboard action/persistence pending |
| LST-12 | in-progress | 2 | Complete vocab categories, synonyms/accent resolution and locale-aware labels implemented; full term translations across every locale pending |
| LST-13 | done | 2 | Version/deprecate-never-delete model + explicit replacement migration helper retaining unknown terms; covered by taxonomy tests |
| LST-14 | done | 2 | Indicative ranges in provider currency, labelled indicative, no transaction value (LST-14 copy on cards+profiles) |
