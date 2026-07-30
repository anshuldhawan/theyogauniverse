# Decision #7 — Legal basis for publishing the non-US index

**Status:** RESOLVED — owner sign-off, 29 July 2026.

**Decision:** The 30 advertising-only non-US cities publish as designed.
Rationale accepted by the owner: an advertising-only listing *sends referral
traffic to the listed professional* — the platform charges them nothing,
never intermediates their transaction, and never holds their money
(PAY-17a). The listing is a benefit, not an extraction.

**The control that makes this defensible (ING-7, now implemented end-to-end):**

- Public request page `/legal/removal` — no account needed
  (`src/app/(site)/legal/removal/page.tsx`, `src/app/actions/removal.ts`).
- Verified requests — the requester's email matches the listing's own contact
  address — are honoured **immediately** (`src/lib/removal.ts`).
- Every other request lands in `/admin/moderation` with a one-click
  **Honor removal** action and a visible 72-hour SLA badge.
- Honouring suppresses the provider from every public read (directory, city
  hubs, profile, slots, featured) **and** writes a permanent tombstone so
  re-ingestion can never restore the listing (`src/lib/repo`,
  `src/lib/ingestion.ts` `recordOptOut`).
- Linked from the footer, the privacy policy, and every seeded provider
  profile ("Is this you?").

**Residual counsel item (not a blocker):** per-jurisdiction confirmation of
the legitimate-interests basis (documented LIA/DPIA, GDPR Art. 14 notice
timing) remains recommended as a standing legal task.
