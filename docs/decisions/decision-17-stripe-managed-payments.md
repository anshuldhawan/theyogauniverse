# Decision #17 — Stripe Managed Payments (merchant of record)

**Status: RESOLVED — not viable. Proceed with Stripe Connect per PAY-1/§7.8.**
**Date:** 28 July 2026 · **Investigated by:** engineering (per the v1.2 requirement that this be examined before Section 7.8 is built)

## Question

v1.2 asks whether Stripe Managed Payments — where Stripe acts as merchant of
record and absorbs indirect-tax compliance — could replace or complement the
planned Connect + Stripe Tax architecture, potentially eliminating the Track
A/B tax machinery and the PAY-11a region flags.

## Findings

Two independent, categorical disqualifiers, from Stripe's own eligibility
documentation ([docs.stripe.com/payments/managed-payments/eligibility](https://docs.stripe.com/payments/managed-payments/eligibility)):

1. **No platforms or marketplaces.** Managed Payments supports direct
   integrations only. It explicitly does not support Connect platforms,
   Express accounts, or accounts controlled by a platform — precisely the
   architecture a two-sided marketplace requires. "You sell the product
   directly to customers, not through a platform or marketplace" is an
   eligibility condition.

2. **Fully automated digital products only.** Eligibility is limited to SaaS,
   software and digital content. Stripe's docs state directly: "If your
   service involves human intervention (such as live 1-1 coaching), it
   doesn't qualify." Our inventory — in-person classes, live online classes,
   retreats, teacher trainings, private sessions — is disqualified as a
   product class. At most, a pre-recorded on-demand library could qualify,
   and only if sold by the provider directly, not through us.

Secondary observations, for completeness:

- Under Managed Payments the customer-facing merchant is **Link** ("Sold
  through Link" on statements and receipts) — ceding the checkout and
  post-purchase relationship the PRD's messaging/booking requirements assume
  we own.
- The model would also invert PAY-13 (provider of record for the service) and
  the agency-model waiver/liability posture in §7.9.

## Decision

Build Section 7.8 as specified: Stripe Connect (Express) with the platform as
limited payment agent, Stripe Tax for calculation under Track A (US
marketplace-facilitator registrations) and Track B (buyer-region flags,
PAY-11a), commission per PAY-5, escrow per PAY-8, double-entry ledger per
PAY-14. The payment-orchestration interface (src/lib/payments.ts) keeps a
second rail possible if Stripe's eligibility rules ever change.

## Re-visit trigger

Re-open only if Stripe extends Managed Payments to (a) Connect platforms and
(b) human-delivered services. Neither is announced or hinted at as of July 2026.
