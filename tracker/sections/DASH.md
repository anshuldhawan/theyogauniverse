# DASH — Provider Dashboard (§7.12)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 11 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| DASH-1 | in-progress | 4 | resumable step model and responsive onboarding UI added with complete advertising-only branch and US-only Stripe guard; persistent claim/identity handshake pending |
| DASH-2 | in-progress | 4 | list-view schedule manager live (add/remove/capacity, src/app/dashboard/schedule); calendar view + drag pending |
| DASH-3 | done | 4 | bookings roster with manual check-in + no-show marking, transactable-only (src/app/dashboard/bookings) |
| DASH-4 | in-progress | 4 | transactable-only own-booking CRM derivation and dashboard contact view added/tested; notes, injuries, tags, segments and export persistence pending |
| DASH-5 | in-progress | 4 | US/transactable-only payouts surface already hides advertising-only providers and shows held/available balances; financial summary/scheduled-release/commission/refund domain added, but payout history, tax-document ingestion and downloadable statements remain |
| DASH-6 | n-a | 4 | Struck through in the PRD (removed in v1.1). |
| DASH-7 | done | 4 | public-page performance panel renders for EVERY provider incl. advertising-only (src/lib/dashboard.ts, /dashboard) |
| DASH-8 | done | 4 | hide-not-disable enforced for transaction panels, CRM and transactional marketing tools; advertising providers receive only complete universal tools (tested) |
| DASH-9 | in-progress | 4 | role-safe seven-day team invite domain and team surface added; persisted invitations/affiliation management pending |
| DASH-10 | in-progress | 4 | cancellation/waiver/house-rule/booking-window validation and policy surface added; save actions and version history pending |
| DASH-11 | in-progress | 4 | navigation and new dashboard surfaces are responsive/phone-scrollable; roster/check-in interaction polish pending |
