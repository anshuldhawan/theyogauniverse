# WEB — Responsive Web (§7.19)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 6 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| WEB-1 | done | 4 | single responsive Next.js app; no native apps |
| WEB-2 | in-progress | 4 | mobile-first responsive flows exist; explicit Instagram/TikTok/Facebook webview checkout/OAuth/cookie test evidence remains external browser QA |
| WEB-3 | in-progress | 4 | Stripe Payment Element provides wallet-to-card degradation; required browser/version compatibility matrix still needs device-lab evidence |
| WEB-4 | done | 4 | provider mobile check-in uses device camera + bundled QR decoder with permission/error handling and manual reference fallback; booking page emits QR |
| WEB-5 | in-progress | 4 | manifest, registered service worker, offline caching for visited bookings/roster, VAPID push subscription/handler and email fallback implemented; install/push device-matrix evidence remains |
| WEB-6 | done | 4 | ICS export + deep links plus Web Share API with clipboard fallback on provider and booking pages |
