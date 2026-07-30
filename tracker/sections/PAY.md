# PAY — Payments, Payouts & Tax (§7.8)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 22 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| PAY-1 | done | 3 | Stripe sole provider behind orchestration interface; live test-mode rail verified end-to-end (destination charge pi_3TyQsA…, $24 charge, $1.20 fee, transfer to sandbox Connect acct); mock rail for dev/CI (src/lib/payments.ts) |
| PAY-2 | done | 3 | US-only payout gate is the core of the transactability engine (src/lib/transactability.ts, tested) |
| PAY-3 | done | 3 | Connect Express onboarding via Account Links, payout schedules (daily/weekly/monthly), statement descriptor, Express dashboard login, balance view from ledger (src/lib/connect.ts, src/app/actions/payouts.ts, /dashboard/payouts; tested) |
| PAY-4 | done | 3 | account.updated webhook derives connectStatus; listings drop to enquiry_only immediately (DM-7, no cache); provider notified with specific remediation; confirmed bookings untouched (src/app/api/webhooks/stripe/connect/route.ts, tested) |
| PAY-5 | done | 3 | 12%/5% commission bands as config (src/lib/commission.ts, COMMISSION_BPS in markets config) |
| PAY-6 | done | 3 | no provider subscription tier; commission is the only provider-side line |
| PAY-7 | done | 3 | destination charges with application_fee at capture (src/lib/payments.ts) |
| PAY-8 | done | 3 | escrow/delayed release for high-ticket; ledger holds + releases at event start (src/lib/ledger.ts, tested) |
| PAY-9 | in-progress | 3 | provider-fault proportional commission reversal, buyer-fault retention, and platform-goodwill allocation tested (src/lib/payment-compliance.ts); durable ledger posting pending |
| PAY-10 | done | 3 | Track A taxed at performance location; US-only performance for bookables (src/lib/tax.ts) |
| PAY-11 | done | 3 | Track B buyer-location evidence: two agreeing signals required, block on conflict (src/lib/tax.ts, tested) |
| PAY-11a | done | 3 | per-region Track B kill switch reads TRACK_B_REGIONS config, no deploy needed (src/lib/config/markets.ts) |
| PAY-12 | in-progress | 3 | v1 reporting scope control returns only 1099-K for US on-platform transactions and none for advertising-only supply (tested); Stripe W-9/TIN matching/1099 delivery remains external integration work |
| PAY-13 | in-progress | 3 | localised US Track A receipt builder with foreign-buyer no-VAT/GST note tested; delivery, help-centre link, and provider statement UI pending |
| PAY-14 | done | 3 | double-entry ledger, balanced-or-throw, currency guard (src/lib/ledger.ts, tested) |
| PAY-15 | done | 3 | SAQ-A: no card data server-side; Stripe Payment Element (hosted fields) live in checkout step 4 (src/components/site/BookingFlow.tsx); mock rail in dev |
| PAY-16 | done | 3 | 3DS2 delegated to Stripe Payments; no card handling in app code |
| PAY-17 | done | 3 | advertising-only mode fully implemented across index, profiles, CTAs (Phase 2) |
| PAY-17a | done | 3 | no fee/no masking/no conversion tracking/no held availability enforced structurally (src/lib/analytics.ts, messaging.ts) |
| PAY-18 | done | 3 | sanctioned-country block at checkout + contact flow (src/app/actions/booking.ts, contact.ts) |
| PAY-19 | done | 3 | region config resolved server-side to PaymentIntent method types (stripePaymentMethodTypes, tested) and reflected in the Payment Element; verified in sandbox (US: card+link+ACH) |
| PAY-20 | in-progress | 3 | disputed state + transitions in machine; signature-verified dispute/refund webhook moves booking to disputed/refunded incl. out-of-order event guard (src/app/api/webhooks/stripe, tested; live delivery verified via `stripe listen`); evidence auto-assembly + dispute API submission + liability ledger rules pending |
