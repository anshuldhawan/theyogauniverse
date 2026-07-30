# SRCH — Search & Discovery (§7.6)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 16 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| SRCH-1 | in-progress | 2 | unified provider search is live; generic cross-type discovery documents + type filtering tested (src/lib/discovery.ts), production index wiring pending |
| SRCH-2 | in-progress | 2 | location/provider/time modes modelled and tested in discovery domain; first-class mode UI pending |
| SRCH-3 | in-progress | 2 | tonight/tomorrow morning/weekend/available-now plus explicit range evaluation implemented; production occurrence-index integration pending |
| SRCH-4 | in-progress | 2 | existing live provider filters + exact booking-mode exclusions; many required advanced facets remain absent |
| SRCH-5 | in-progress | 2 | retreat duration/price/accommodation/food/accreditation/hours/audience/deposit/instalment filtering tested; UI/index integration pending |
| SRCH-6 | in-progress | 2 | natural-language time/online mapping with evaluation log payload and keyword fallback tested; broader structured extraction pending |
| SRCH-7 | in-progress | 2 | deterministic geo clustering and polygon draw-to-search primitives implemented/tested with stable result IDs for list synchronisation; interactive map/list UI and production geospatial index remain |
| SRCH-8 | in-progress | 2 | accent-insensitive fuzzy autosuggest with typo tolerance across names/cities/neighbourhoods/styles/destinations tested; production autosuggest endpoint pending |
| SRCH-9 | in-progress | 2 | saved-search schema plus deduplicated new-result email/web-push alert state implemented/tested; authenticated CRUD UI and scheduled production delivery worker remain |
| SRCH-10 | in-progress | 2 | validated 2–4 item comparison model supports mixed bookable/advertising-only price labels, duration, inclusions, accreditation and rating; comparison selection/persistence UI remains |
| SRCH-11 | in-progress | 2 | cross-language query-expansion matching and clearly labelled translated display with original retention implemented/tested; translation/search provider and live index integration remain |
| SRCH-12 | done | 2 | Zero-result state offers widen/online/clear alternatives — never a dead end |
| SRCH-13 | in-progress | 2 | measurable concurrent load harness, p95 calculation and strict 400ms server budget implemented/tested; no claim of 500k-listing production performance until representative benchmark output is captured |
| SRCH-14 | in-progress | 2 | Versioned ranker (src/lib/ranking.ts); missing behavioural signals degrade to static weights (tested); live signals pending |
| SRCH-15 | in-progress | 2 | deterministic live→demote→unpublish disposition tested from age/failure count; ingestion/index enforcement pending |
| SRCH-16 | done | 2 | Config multiplier 0.82 within disclosed 0.80–0.85 band; signal-not-filter; ratio + band unit tests |
