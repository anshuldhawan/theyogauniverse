# BKG — Booking & Checkout (§7.7)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 21 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| BKG-1 | in-progress | 3 | instant book live; request/application accept-decline domain state ensures no payment link before acceptance (src/lib/booking-controls.ts; tested), provider workflow pending |
| BKG-2 | in-progress | 3 | currency-safe multi-item cart totals tested for booking/add-ons/guests; checkout persistence/UI pending |
| BKG-3 | in-progress | 3 | mobile guest checkout exists but currently exceeds the ≤3-step requirement and does not put wallets on the first screen |
| BKG-4 | in-progress | 3 | size/position/FIFO/response window plus auto-charge and hold-confirm offer states tested; persisted promotion/charge orchestration pending |
| BKG-5 | in-progress | 3 | cancellation with seat release tested; book-for-a-friend per-attendee waivers pending |
| BKG-6 | in-progress | 3 | refund ladder + credit flag tested; immutable booking snapshot, no-show/late fees, weather/force-majeure overrides pending |
| BKG-7 | in-progress | 3 | policy/availability-gated reschedule result and price difference tested; transactional seat move/UI pending |
| BKG-8 | in-progress | 3 | deposit/balance schedule plus retry and auto-cancel/manual-review dunning states tested; off-session charging/invoicing pending |
| BKG-9 | in-progress | 3 | exact 3/6/12 schedules and retry policy tested; card-on-file recurring collection/disclosure UI pending |
| BKG-10 | in-progress | 3 | questionnaire review accept/decline/expiry and post-acceptance payment-link gate tested; provider workflow pending |
| BKG-11 | in-progress | 3 | class-pack credit/expiry/transferability implemented; shareability and membership lifecycle/Billing integration pending |
| BKG-12 | in-progress | 3 | eligibility across linked identity keys tested; durable cross-device claim storage pending |
| BKG-13 | in-progress | 3 | gift-card redemption/balance implemented; gift booking delivery flow pending |
| BKG-14 | in-progress | 3 | percent/fixed/windows/caps/currency implemented; provider/platform scope, atomic usage and stacking enforcement pending |
| BKG-15 | in-progress | 3 | transactability, seat availability, PO and net-terms validation tested; invoice/consolidated billing workflow pending |
| BKG-16 | done | 3 | ICS export with escaping (bookingIcs); confirmation page with terms (src/app/(site)/booking/[reference]) |
| BKG-17 | in-progress | 3 | check-in code on confirmation page; QR wrapper + provider scan view in Phase 4 (WEB-4) |
| BKG-18 | in-progress | 3 | explicit transition table and illegal-transition rejection tested; durable transition audit log/idempotency pending |
| BKG-19 | in-progress | 3 | atomic in-memory seat reservation and decline rollback tested; required 500-concurrent/20-capacity database load test pending |
| BKG-20 | done | 3 | Direct-contact flow: forwards to provider email, no thread/SLA/retention, records only-that-it-happened, rate-limited (actions/contact.ts) |
| BKG-21 | in-progress | 3 | no extra friction for non-US buyers in flow; local methods live via PAY-19 region resolution; non-USD presentment currency still pending |
