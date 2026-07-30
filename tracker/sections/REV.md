# REV — Reviews & Ratings (§7.10)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 12 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| REV-1 | done | 3 | verified-attendee constraint enforced: booking reference + email match + state check (src/lib/reviews.ts, tested) |
| REV-2 | done | 3 | 24-hour open and 30-day close enforced by reviewWindow and validateReview; boundary-tested (src/lib/reviews.ts, platform-requirements.test.ts) |
| REV-3 | done | 3 | listing-type dimension sets plus integer 1..5 validation implemented and tested (src/lib/reviews.ts) |
| REV-4 | done | 3 | min-length free text enforced; photo moderation queue in Phase 4 |
| REV-5 | done | 3 | listing/teacher/studio attribution modelled in schema; substitute teacher wins occurrence attribution, independent of transactability (reviewAttribution, tested) |
| REV-6 | in-progress | 3 | one-reply right modelled; provider reply UI lands with dashboard |
| REV-7 | in-progress | 3 | 24-hour edit rule and reason/actor-required T&S deletion domain implemented; schema stores audit fields. Persistence action/admin deletion UI pending |
| REV-8 | done | 3 | aggregate suppression below n=3; distributions not bare stars (canPublishAggregate, ProviderProfile) |
| REV-9 | in-progress | 3 | explainable IP/device velocity, text reuse, incentive and linked-account triage implemented/tested; production device/IP signal store pending |
| REV-10 | in-progress | 3 | bounded six-month half-life implemented/tested; ranking integration pending |
| REV-11 | in-progress | 3 | post-occurrence email/web-push request scheduler with 24-hour delay, review suppression and one-reminder maximum implemented/tested; durable worker and production channel delivery remain |
| REV-12 | in-progress | 3 | labelled MT display contract retains accessible original, tested; translation provider and review UI integration pending |
