# MSG — Messaging & Notifications (§7.11)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 8 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| MSG-1 | done | 3 | managed threads transactable-only by construction; advertising-only uses BKG-20 forwarding (src/lib/messaging.ts) |
| MSG-2 | done | 3 | masking only in transactable threads, NEVER on advertising-only contact (maskContactDetails, tested) |
| MSG-3 | done | 3 | managed enquiry response-rate + median-response-time stats feed SRCH-14 (responseStats, tested) |
| MSG-4 | in-progress | 3 | email live; channel policy and provider preference UI cover browser push + explicit transactional SMS opt-in. Push subscription and SMS delivery adapters pending |
| MSG-5 | in-progress | 3 | booking-confirmed email sent from checkout; reminder/cancellation/waitlist templates pending |
| MSG-6 | in-progress | 3 | deny-by-default per-channel/per-topic preference centre and one-click unsubscribe domain implemented/tested; public signed unsubscribe endpoint and compliance copy pending |
| MSG-7 | in-progress | 3 | own-student/transactable-only audience derivation enforced/tested; broadcast composer, delivery and production rate/abuse integration pending |
| MSG-8 | in-progress | 3 | typed copy catalogue and locale-safe fallback added/tested for all seven launch languages; complete translation of every transactional/marketing template and native-speaker review remain |
