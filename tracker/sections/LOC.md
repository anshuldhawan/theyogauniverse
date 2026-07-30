# LOC — Localisation (§10)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 7 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| LOC-1 | in-progress | 2 | next-intl with 7 locale catalogs + browser/geo/cookie resolution and language UI; full catalog coverage pending |
| LOC-2 | in-progress | 2 | ICU-ready catalogs and Intl currency utilities; hardcoded product strings and per-locale addresses remain |
| LOC-3 | in-progress | 2 | reusable MT-labelled display with accessible original; translation provider/review integration remains |
| LOC-4 | in-progress | 2 | account→cookie→browser→geo preference abstraction, explicit UI override and year-persisted cookie; account write action remains |
| LOC-5 | in-progress | 2 | tested clock, week-start, measurement, name-order and currency defaults; broad product-surface adoption remains |
| LOC-6 | in-progress | 2 | en-US/en-GB/en-AU cultural format resolution implemented; variant spelling/content catalogs remain |
| LOC-7 | in-progress | 2 | converted-price UI discloses source amount, rate date, FX margin, USD settlement and issuer variance; checkout/listing integration remains |
