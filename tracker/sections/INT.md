# INT — Integrations (§7.18)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 11 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| INT-1 | done | 4 | ICS + quoted CSV import, stable external IDs, native-inventory conflict precedence, and per-source replacement (src/lib/schedule-import.ts, tested); vendor sync scheduling remains an ops concern |
| INT-2 | done | 4 | Zoom, Google Meet, and native WebRTC meeting adapter with deterministic offline mode and guarded provider mode (src/lib/integrations.ts, tested) |
| INT-3 | in-progress | 4 | Google Business Profile authenticated adapter covers NAP/hours; review signals require a separately authorised Google reviews surface |
| INT-4 | in-progress | 4 | Google geocoding with OpenStreetMap fallback implemented and tested; transit/travel-time provider remains external |
| INT-5 | in-progress | 4 | credential-registry adapter, not-found fallback, timeout/error boundary implemented; live registry contracts/credentials remain external |
| INT-6 | done | 4 | Resend email, Twilio SMS, VAPID web push, service-worker push handling, and email fallback implemented with keyless local adapters |
| INT-7 | in-progress | 4 | signed media-pipeline adapter plus AVIF/WebP delivery configured; live transcode/adaptive-streaming/CDN provider requires external provisioning |
| INT-8 | done | 4 | versioned providers/availability/booking APIs, hashed API-key validation, rate limits, signed retryable lifecycle webhooks, and partner docs implemented and tested |
| INT-9 | done | 4 | allowlisted signed attribution is rejected before recording for every advertising-only listing (src/lib/affiliate.ts + API, tested) |
| INT-10 | done | 4 | privacy-minimised insurance referral rendered only in transactable retreat checkout; no buyer PII sent (tested) |
| INT-11 | done | 4 | Stripe is the only payments integration (src/lib/payments.ts) |
