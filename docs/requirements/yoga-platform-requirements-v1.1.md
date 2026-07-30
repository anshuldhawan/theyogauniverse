# Product Requirements — Global Yoga & Meditation Platform

**Version:** 1.1 (supersedes v1.0)
**Date:** 28 July 2026
**Status:** Approved for build
**Audience:** Engineering, Product, Design, Data, Trust & Safety, Growth

---

## Changelog — v1.0 → v1.1

Requirement IDs are **stable**. Removed items are listed here rather than renumbered, so existing tickets remain valid.

| Change | Detail |
|---|---|
| **Geography reduced** | Latin America (20 cities) and India (10 cities) removed. Launch scope is now **50 cities**: US 20, Continental Europe 20, UK 5, Australia 5. |
| **Native apps removed** | MOB-1 … MOB-5 deleted. Replaced by **WEB-1 … WEB-6** (responsive web, desktop + mobile). Section 7.19 retitled. |
| **PRO-8 removed** | Embeddable schedule widget for provider websites. |
| **Taxonomy trimmed** | "Spiritual intensity (secular ↔ devotional)" axis removed from LST-12. |
| **Payments simplified** | **Stripe only.** Razorpay, Mercado Pago, Pix, boleto, OXXO, SPEI removed from PAY-1/PAY-2. Payment orchestration abstraction retained but with a single implementation. |
| **Tax scope reduced** | India GST/TCS and all Latin American indirect tax removed from PAY-9. Remaining: US marketplace facilitator, EU VAT/OSS, UK VAT, Australia GST. |
| **DASH-6 removed** | Provider-facing performance analytics. **See flag below.** |
| **Cascading cuts** | Hindi removed from launch languages; INR/BRL/MXN/COP/ARS/CLP/PEN/UYU removed; India DPDP and Brazil LGPD removed from compliance; WhatsApp channel removed; Devanagari transliteration removed; India data region removed; Apple IAP decision removed from open items. |
| **Resolved** | Open decision #1 (UK/Australia city count) — confirmed as 5 each. |
| **New** | Open decision #11 — Stripe Connect country coverage vs. "retreats anywhere" (see PAY-15). |

> ⚠️ **Flag on the DASH-6 removal.** DASH-6 was listed under "not needed," so it is removed. Two consequences the team should be aware of:
> 1. **DASH-7 is retained** (pre-claim profile view counts). It is a subset of the same instrumentation, and it is the conversion mechanism for the entire seeding strategy. Cutting DASH-6 does not remove the need to build view/impression tracking.
> 2. Provider-facing analytics is a primary **retention** lever — it is the recurring reason a teacher logs in when they have no bookings to manage. Recommend revisiting for a fast-follow.
>
> Internal analytics (ANL-1 … ANL-5) are unaffected; the data still exists, it is simply not surfaced to providers. Restoring DASH-6 later is a UI task, not an architecture task, provided ANL-1 is built as specified.

---

## 1. Purpose & Scope

Build a two-sided global platform that is (a) the definitive **index** of yoga, meditation, and breathwork providers and offerings across the launch markets, and (b) a **transactional marketplace** where users discover, compare, book, and pay for those offerings.

The platform serves two distinct commercial motions that share one data layer:

| Motion | Inventory | Typical AOV | Take rate | Primary acquisition |
|---|---|---|---|---|
| **High-ticket** | Retreats, teacher trainings, immersions, continuing education | $150–$7,000 | 10–15% commission | Organic search, AI answer engines |
| **High-frequency** | Drop-in classes, courses, workshops, online live, on-demand | $10–$60 | 0–8% commission or SaaS | Local search, map pack, teacher-led referral |

Both must be feature-complete at launch. The high-ticket motion funds the business; the high-frequency motion creates retention and defensibility.

### 1.1 Scope boundaries

**In scope for v1:** everything in Section 7.

**Explicitly out of scope for v1 (Section 3):** wearable integration, nutrition/ayurveda booking, physical goods commerce, franchise/multi-brand hierarchy management, white-label studio websites, in-house video production, native mobile applications.

---

## 2. Product Summary

A user in any of the 50 launch cities (Appendix A) — or anywhere in the world for online and retreat inventory — can:

1. Search by location, date/time, modality, style, language, price, accessibility, and teacher attributes.
2. View verified provider profiles at stable, unique, indexable URLs.
3. Book and pay in local currency, with waiver and intake completed inline.
4. Leave verified reviews tied to completed bookings.

A teacher, studio, school, or retreat organiser can:

1. Claim a pre-seeded profile or create one from scratch in under 5 minutes.
2. Import or sync an existing schedule from their incumbent booking system.
3. Publish inventory across all six listing types with flexible pricing (drop-in, packs, memberships, deposits, instalments).
4. Receive payouts, manage students, and respond to reviews.

---

## 3. Non-Goals for v1

- **NG-1.** We are not replacing Mindbody/Momence as a studio's system of record. We interoperate with it. Full studio back-office (payroll, POS, inventory, staff scheduling) is out of scope.
- **NG-2.** We do not produce first-party content (video classes, courses). We host third-party on-demand only.
- **NG-3.** No subscription aggregator model (ClassPass-style credit pool) in v1. Architecture must not preclude it.
- **NG-4.** **No native mobile applications.** Responsive web only, optimised for desktop and mobile browsers.
- **NG-5.** No Latin America or India market entry in v1. Architecture must not preclude it — see NG-5a.
- **NG-5a.** All geo-specific behaviour (payment methods, tax rules, languages, currencies, legal templates) is configuration, never code. Adding a market must not require a deploy.

---

## 4. Geographic Scope

**50 launch cities** with full local inventory, localised city landing pages, and local payment methods:

- **United States** — 20 cities
- **Continental Europe** — 20 cities
- **United Kingdom** — 5 cities
- **Australia** — 5 cities

Full list in **Appendix A**.

**Global, non-city-bound inventory:**
- **Online / live-streamed** — searchable by timezone, language, and time-of-day. Not tied to any city. Sellable to and by anyone, subject to PAY-15.
- **Retreats** — listed anywhere in the world, including outside the 50 cities. Discovery is by destination, theme, date range, and price, not by city page.
- **Teacher trainings** — same as retreats; global.

> **Constraint arising from Stripe-only (PAY-15):** "retreats anywhere" is a *demand-side* statement. A retreat organiser can only be **paid** if they can onboard to Stripe Connect in their country. Several major retreat destinations — Indonesia/Bali, India, Costa Rica, Nicaragua, Guatemala, Sri Lanka, Nepal, Morocco — are wholly or partly outside Stripe Connect payout coverage. See PAY-15 and Open Decision #11. This is the single most material consequence of the payments simplification and needs a business answer before Phase 2.

**Architectural requirement:** city coverage is a data/content concern, never a code concern. Adding city 51 must require zero deploys. All city pages, geo hierarchies, and localisation are configuration-driven.

---

## 5. Users & Roles

| Role | Description | Key capability |
|---|---|---|
| **Guest** | Unauthenticated visitor | Search, view, guest checkout |
| **Practitioner** | Registered consumer | Book, review, save, follow, manage bookings |
| **Teacher** | Individual instructor | Own a profile, list inventory, take payment, may be affiliated to N studios |
| **Studio Owner / Manager** | Operates a physical venue | Own a studio profile, manage teacher roster, schedule, staff permissions |
| **School (RYS)** | Runs teacher trainings | List YTT/CE programmes, manage cohorts, instalments |
| **Retreat Organiser** | Runs retreats | List retreats, manage deposits/balances, rooming |
| **Venue Owner** | Rents space to organisers | List venue, receive enquiries (B2B, non-transactional v1) |
| **Internal: Ops** | Content/data operations | Merge, moderate, verify, correct records |
| **Internal: T&S** | Trust & Safety | Handle reports, suspensions, disputes |
| **Internal: Admin** | Superuser | Full access, audit-logged |

**RBAC requirement (ACC-12):** A single human may hold multiple roles across multiple organisations simultaneously. Permissions are scoped per organisation, not per user.

---

## 6. Domain Model

```
Person ──┬── TeacherProfile ──┬── TeachesAt ──> StudioProfile   (many-to-many, time-bounded)
         │                    ├── Credential (verified | self-declared)
         │                    └── Lineage ──> Teacher/Tradition  (graph edge)
         └── UserAccount ─────── Booking ──> Listing ──> Session/Occurrence
                                    │
                                    ├── Payment ──> Payout
                                    ├── Waiver (signed, immutable)
                                    └── Review (verified)

Organisation ──┬── StudioProfile
               ├── SchoolProfile (RYS)
               ├── RetreatOrganiserProfile
               └── VenueProfile

Listing (abstract) ──┬── RecurringClass
                     ├── Workshop / Event
                     ├── Course (multi-session, enrolled cohort)
                     ├── Retreat
                     ├── TeacherTraining / CE
                     ├── PrivateSession (1:1, availability-based)
                     └── OnDemandContent
```

### 6.1 Non-negotiable modelling rules

- **DM-1.** `TeacherProfile ↔ StudioProfile` is **many-to-many and time-bounded**. A teacher teaches at four studios and independently. Affiliations start and end. Getting this wrong is the single most expensive schema mistake available.
- **DM-2.** `Listing` and `Occurrence` are separate. A recurring class is one Listing with N Occurrences. Cancellations, substitutions, price overrides, and capacity changes apply to a single Occurrence without mutating the Listing.
- **DM-3.** Every entity carries `provenance` (`seeded` | `claimed` | `native`), `confidence_score`, `last_verified_at`, and `source_ref`.
- **DM-4.** Money is stored as integer minor units plus ISO-4217 currency. Never floats. Never a single implicit currency.
- **DM-5.** All timestamps stored UTC. Every Occurrence additionally stores its **IANA timezone identifier**, not an offset. Display converts to viewer-local.
- **DM-6.** Soft-delete everywhere; hard-delete only via GDPR erasure workflow (COMP-4).

---

## 7. Functional Requirements

### 7.1 Identity & Accounts (ACC)

- **ACC-1.** Sign-in via Google, Apple, Facebook, email magic link, and phone OTP.
- **ACC-2.** **Guest checkout must work end to end.** Account creation is offered post-purchase, pre-populated. Forcing registration before payment is a launch blocker.
- **ACC-3.** Apple Sign-In supported alongside other SSO providers.
- **ACC-4.** Email verification required before a user may post a review or claim a profile.
- **ACC-5.** Provider accounts require identity verification (KYC) before first payout, not before listing.
- **ACC-6.** Account merge flow for users who sign in with different providers on the same verified email.
- **ACC-7.** Session management: device list, remote revoke, 2FA (TOTP) available; mandatory for Organisation Admin roles.
- **ACC-8.** Self-serve data export and account deletion (see COMP-4).
- **ACC-9.** Users may follow teachers, studios, and cities; follows drive notification eligibility.
- **ACC-10.** Saved/wishlist collections for listings, shareable via public link.
- **ACC-11.** Practitioner profile stores: preferred styles, experience level, injuries/limitations (optional, encrypted), preferred languages, home city, timezone.
- **ACC-12.** RBAC scoped per organisation (see Section 5).

### 7.2 Provider Profiles (PRO)

Every provider has a **unique, permanent, human-readable URL**.

- **PRO-1.** URL patterns:
  - `/teachers/{slug}`
  - `/studios/{country}/{city}/{slug}`
  - `/schools/{country}/{city}/{slug}`
  - `/organisers/{slug}`
  - `/venues/{country}/{region}/{slug}`
- **PRO-2.** Slug generation with deterministic collision handling (`jane-doe`, `jane-doe-lisbon`, `jane-doe-2`). Slugs are immutable once indexed; renames issue 301s and retain the old slug permanently.
- **PRO-3.** Optional custom domain / vanity domain mapping for paid tiers (CNAME + auto-TLS).
- **PRO-4.** **Teacher profile fields:** display name, pronouns, photo, cover media, short bio (≤160 chars, used for meta description), long bio (rich text), teaching philosophy, years teaching, **lineage** (trained under whom; tradition; links to other profiles), styles taught (controlled vocabulary), modalities, languages of instruction, cities/venues taught at, credentials (7.3), insurance status, hands-on adjustment policy + consent approach, specialisms (prenatal, trauma-informed, adaptive/chair, kids, seniors, plus-size-affirming, LGBTQ+-affirming), social links (Instagram, TikTok, YouTube, Spotify, website), **video introduction**, photo gallery, upcoming schedule, on-demand library, retreats/trainings, reviews, contact/enquiry.
- **PRO-5.** **Studio/venue-specific fields:** address + geocode, opening hours, room list with capacities, amenities (showers, changing rooms, mat/prop hire, parking, bike storage, café, lockers), **accessibility** (step-free access, accessible WC, hearing loop, lift, gender-neutral facilities), heated/hot yoga capability, teacher roster, photos, house rules, cancellation policy, transport directions.
- **PRO-6.** **School (RYS) fields:** registry ID, programme catalogue, lead teachers, contact hours breakdown, curriculum outline, accommodation options, graduate outcomes, cohort calendar.
- **PRO-7.** **Link-in-bio mode:** every provider profile renders a mobile-optimised, single-column "link in bio" variant at `/{slug}` suitable for use as their Instagram/TikTok bio link, with prominent book CTA, links, and next sessions. This is a primary supply-acquisition feature, not a nice-to-have.
- ~~**PRO-8.** Embeddable schedule widget.~~ **Removed in v1.1.**
- **PRO-9.** Profile completeness score with guided next actions; drives search ranking (SRCH-14).
- **PRO-10.** Profile preview-as-visitor mode.
- **PRO-11.** Multi-location support: one Organisation, N StudioProfiles, shared roster and policies, independent schedules.
- **PRO-12.** Teacher↔studio affiliation requires **mutual confirmation**; either party may end it. Ended affiliations retain history for past bookings and reviews.

### 7.3 Credential Verification (CRD)

Trust is the primary differentiator against an open directory. Verification must be visibly tiered.

- **CRD-1.** Three trust tiers, visually distinct and defined in a public help page:
  - **Self-declared** — provider stated it, we did nothing.
  - **Document-verified** — certificate uploaded and reviewed (human or automated) by Ops.
  - **Registry-verified** — validated against an external registry (Yoga Alliance RYT/RYS, Yoga Alliance Professionals, British Wheel of Yoga, Yoga Australia, national bodies).
- **CRD-2.** Registry verification via ID lookup + name match, re-checked on a scheduled cadence. Lapsed registrations automatically downgrade the badge and notify the provider 30 days ahead.
- **CRD-3.** Certificate uploads are private by default; only the derived badge is public. Storage encrypted at rest, access audit-logged.
- **CRD-4.** Support for non-Yoga-Alliance credentials: independent lineages (Iyengar, Ashtanga authorisation levels, Sivananda, Bihar School), meditation lineages, breathwork certifications (Wim Hof, Holotropic, Oxygen Advantage), somatic/therapy credentials, first aid, safeguarding/DBS.
- **CRD-5.** **Insurance status** field: insurer, policy expiry, document upload, verified badge. Expiry triggers reminders and badge downgrade.
- **CRD-6.** Copy must be legally careful: registration is a voluntary registry, not a licence. Never imply state certification. Legal to review all badge copy.
- **CRD-7.** Ops queue for manual verification with SLA target of 2 business days.

### 7.4 Listing Types & Inventory (LST)

All six types share a common Listing base (title, description, media, provider, pricing, policies, taxonomy) with type-specific extensions.

- **LST-1. Recurring Class** — repeats on a rule (RRULE), generates Occurrences, per-occurrence capacity, teacher assignment, room assignment, in-person / online / hybrid.
- **LST-2. Workshop / Event** — one-off or short series; includes sound baths, kirtan, satsang, breathwork journeys, ice baths, cacao ceremonies, masterclasses.
- **LST-3. Course** — fixed multi-session programme with an enrolled cohort, start/end dates, attendance tracking, optional make-up policy.
- **LST-4. Retreat** — location (may be a Venue or free-text), date ranges with multiple departures, **room/occupancy types with independent inventory and pricing** (shared, private, single supplement), inclusions/exclusions, itinerary, what-to-bring, arrival/transfer info, deposit + balance schedule, min/max participants, cancellation ladder, travel insurance prompt.
- **LST-5. Teacher Training & Continuing Education** — hours (200/300/500/CE), registry accreditation, modules, contact hours with lead teacher, prerequisites, application/screening step, cohort caps, instalment plans, accommodation add-ons, online/in-person/hybrid delivery.
- **LST-6. Private Session (1:1)** — availability calendar, duration options, in-person at venue / at client's location / online, travel radius and surcharge.
- **LST-7. On-Demand Content** — video/audio upload, chaptering, duration, level, style, free or paid, pack/subscription bundling, DRM-lite (signed URLs, no public CDN paths).
- **LST-8.** **Venue listing** (B2B, enquiry-only in v1) — capacity, rooms, accommodation, catering, dates available, day-rate range. Produces a lead, not a booking.
- **LST-9.** Every Listing supports: **draft / published / paused / archived**, scheduled publish, and per-listing visibility (public, unlisted-by-link, private).
- **LST-10.** Bulk operations: CSV import/export of listings and occurrences; bulk price change; bulk cancel with automatic refunds and notifications.
- **LST-11.** Duplicate/clone a listing including pricing and policies.
- **LST-12.** **Controlled vocabularies**, centrally managed, translated, synonym-mapped:
  - *Modality:* yoga, meditation, breathwork, movement/somatics, sound, philosophy/study
  - *Yoga style:* Vinyasa, Hatha, Ashtanga, Iyengar, Yin, Restorative, Kundalini, Bikram/Hot 26, Power, Jivamukti, Sivananda, Rocket, Forrest, Aerial, Acro, Nidra, Prenatal, Chair/Adaptive, Kids, Slow Flow, Mysore
  - *Meditation style:* Vipassana, Mindfulness/MBSR, Metta, Zen/Zazen, Transcendental-style, Guided, Yoga Nidra, Sound, Non-dual, Tonglen
  - *Breathwork:* Pranayama, Conscious Connected, Holotropic-style, Wim Hof method, Buteyko, Box/Tactical
  - *Level, intensity, temperature, prop use, music*
  - ~~*Spiritual intensity (secular ↔ devotional)*~~ **Removed in v1.1.**
- **LST-13.** Taxonomy is versioned; changing a term must not orphan existing listings.

### 7.5 Scheduling Engine (SCH)

- **SCH-1.** RRULE-based recurrence with exceptions (EXDATE), holiday calendars per country, and seasonal schedule swaps.
- **SCH-2.** Occurrence-level override of teacher, room, capacity, price, and status without touching the parent Listing.
- **SCH-3.** **Substitute teacher flow:** assign a sub, notify booked students, update the Occurrence, and reflect the substitution in reviews attribution.
- **SCH-4.** Room/resource conflict detection across a studio's schedule.
- **SCH-5.** Timezone correctness across DST boundaries. Automated test suite covering DST transitions in every launch country, including Australia's Southern Hemisphere schedule and its state-by-state DST variation.
- **SCH-6.** Capacity, waitlist size limits, and optional **spot/mat selection** with a room map.
- **SCH-7.** Booking windows: open X days ahead, close Y minutes before start, late-booking cutoff, early-bird windows.
- **SCH-8.** Bulk schedule publishing for a term/season.
- **SCH-9.** Occurrence lifecycle: scheduled → in-progress → completed → (cancelled | no-show-resolved). Completion triggers review eligibility (REV-1).

### 7.6 Search & Discovery (SRCH)

- **SRCH-1.** Unified search across all listing types and providers, with type filters.
- **SRCH-2.** **Three search modes, all first-class:**
  - **Near me / city** — map + list, radius, travel-time isochrone (walk/transit/drive). Default radius tuned to ~15 minutes travel; students overwhelmingly practise close to home.
  - **Online** — timezone-aware, "starting soon," language of instruction, platform.
  - **Destination** — retreats and trainings by country/region/theme/date range/budget, independent of the 50 cities.
- **SRCH-3.** **Time-first search:** "tonight," "tomorrow morning," "this weekend," "available now," plus explicit date/time-range pickers. Many users choose by slot, not by studio.
- **SRCH-4.** Filters: modality, style, level, price range, currency-aware; language; in-person/online/hybrid; heated/non-heated; duration; teacher gender (where legal); women-only / men-only / LGBTQ+ specific sessions; accessibility (step-free, chair, adaptive); trauma-informed; prenatal/postnatal; kids/family; drop-in available; first-class-free; pack/membership accepted; instant-book; verified-credential-only; rating threshold; distance; amenities.
- **SRCH-5.** Retreat/YTT-specific filters: date range, duration (nights), total price, accommodation type, food (vegan/vegetarian/gluten-free), registry accreditation, hours (200/300/500), solo-traveller-friendly, alcohol-free, silent, family-friendly, deposit amount, instalments available.
- **SRCH-6.** **Natural-language search.** Free-text queries resolved to structured filters — e.g. "trauma-informed restorative class in Spanish, Thursday evening, near Chiado." Must degrade gracefully to keyword search. Query→filter mapping is logged for evaluation.
- **SRCH-7.** Map view with clustering, draw-to-search, and synchronised list.
- **SRCH-8.** Autosuggest across cities, neighbourhoods, studios, teachers, styles, and retreat destinations, with typo tolerance and accent/diacritic-insensitive matching across all launch languages.
- **SRCH-9.** Saved searches with email/web-push alerts ("new Ashtanga in Berlin," "Costa Rica retreats under $1,500 in November").
- **SRCH-10.** Comparison view: up to 4 retreats or trainings side by side on price, duration, inclusions, accreditation, rating.
- **SRCH-11.** Multilingual search: query in any supported language returns results across languages, with translated listing content (MT clearly labelled).
- **SRCH-12.** Zero-result handling: always return an actionable fallback (widen radius, nearest cities, online alternatives, notify-me).
- **SRCH-13.** Search performance: p95 < 400 ms server-side for filtered queries at 500k listings.
- **SRCH-14.** **Ranking signals:** relevance, distance, availability, verification tier, review quality and recency, profile completeness, booking conversion, freshness/`last_verified_at`, response rate, cancellation rate. Paid placement, if enabled, must be **clearly labelled** and rank-capped. Ranking is a versioned, testable service with offline evaluation.
- **SRCH-15.** Stale-suppression: any provider or occurrence failing liveness checks is demoted, then unpublished (ING-9).

### 7.7 Booking & Checkout (BKG)

- **BKG-1.** Instant book and request-to-book (approval) modes, per listing.
- **BKG-2.** Cart supporting a single booking or multi-item (e.g. class + mat hire + guest).
- **BKG-3.** Guest checkout (ACC-2); ≤3 steps; mobile-first; Apple Pay / Google Pay / Link on the first screen.
- **BKG-4.** **Waitlist** with position display, automatic promotion on cancellation, configurable response window, and auto-charge or hold-and-confirm modes.
- **BKG-5.** Book on behalf of a guest/friend; group bookings with per-attendee details and waivers.
- **BKG-6.** **Cancellation and refund engine** driven by provider-configured policies: free-cancel window, partial refund ladders, credit-instead-of-refund, no-show fees, late-cancel fees, weather/force-majeure overrides. Policy shown before payment and stored immutably with the booking.
- **BKG-7.** Reschedule flow where the provider permits it.
- **BKG-8.** **Deposit + balance** for retreats and trainings: deposit at booking, balance auto-charged on a schedule or invoiced, with dunning and configurable auto-cancel on failure.
- **BKG-9.** **Instalment plans** for trainings and retreats (3/6/12 payments), with card-on-file, retry logic, and clear total-cost disclosure. Non-negotiable for the YTT vertical.
- **BKG-10.** **Application step** for trainings: questionnaire, provider review, accept/decline, then payment link. No charge before acceptance.
- **BKG-11.** Class packs (N credits, expiry, transferable or not, shareable or not) and memberships (recurring, tiered, pause/freeze, cancel-anytime, contract terms, proration).
- **BKG-12.** Intro offers (first class free, first month discounted) with per-user eligibility enforcement across payment methods and devices.
- **BKG-13.** Gift cards and gift bookings, with redemption codes and balance tracking.
- **BKG-14.** Promo codes: percentage/fixed, per-provider or platform-wide, usage caps, date windows, stacking rules.
- **BKG-15.** **Corporate / group booking** enquiry and checkout: multi-seat, invoice payment (net terms), purchase order reference, consolidated billing.
- **BKG-16.** Booking confirmation with calendar file (.ics), map, arrival instructions, what-to-bring, and cancellation terms.
- **BKG-17.** **Check-in:** QR code on the booking, scannable from the provider's mobile browser (WEB-4); manual check-in list; attendance marking that drives no-show handling and review eligibility.
- **BKG-18.** Booking states: `pending → confirmed → attended | no_show | cancelled_by_user | cancelled_by_provider | refunded | disputed`. All transitions audit-logged and idempotent.
- **BKG-19.** Overbooking protection under concurrency: capacity decrements must be transactional. Load-test to 500 concurrent bookings on a 20-capacity occurrence.

### 7.8 Payments, Payouts & Tax (PAY)

- **PAY-1.** **Stripe is the sole payment provider.** Stripe Connect (Express, with Custom available for edge cases) for provider onboarding and payouts; Stripe Payments for collection; Stripe Tax for indirect tax; Stripe Billing for memberships and instalments; Stripe Radar for fraud.
  - Retain a thin internal payment-orchestration interface so a second provider can be added later without touching booking logic. Single implementation for v1.
- **PAY-2.** Payment methods, all via Stripe: cards, Apple Pay, Google Pay, Link, ACH (US), SEPA Direct Debit, iDEAL, Bancontact, Sofort, Klarna, BECS Direct Debit (Australia), Bacs (UK). Method availability driven by buyer geo and currency.
- **PAY-3.** Multi-currency pricing: provider sets price in their settlement currency; buyer sees a clearly-labelled converted estimate or is charged in local currency via Stripe. FX margin, if any, must be disclosed.
- **PAY-4.** Split payments via Stripe Connect: platform commission (`application_fee`) deducted at capture; configurable per vertical and per provider tier.
- **PAY-5.** **Payout management:** Stripe Connect KYC/AML onboarding, payout schedules (daily/weekly/monthly), minimum thresholds, statement descriptors, failed-payout retry, and a provider-facing ledger.
- **PAY-6.** **Escrow/hold for retreats and trainings** — implemented via delayed transfers / separate charges and transfers. Funds held until a configurable point (e.g. X days after retreat start) to fund refunds if the event is cancelled. This materially reduces chargeback exposure on high-AOV bookings.
- **PAY-7.** Refunds (full/partial), credits, and platform-funded goodwill refunds, each with distinct accounting treatment.
- **PAY-8.** **Chargeback and dispute handling:** evidence auto-assembly (waiver, booking terms, check-in record, messages) submitted through Stripe's dispute API, provider notification, and liability assignment rules.
- **PAY-9.** **Tax engine** (Stripe Tax):
  - US sales tax under **marketplace facilitator** rules — platform is the collector in most states
  - EU **VAT + OSS**, including place-of-supply rules for online vs in-person supply
  - UK VAT
  - Australia GST
  - *(India GST/TCS and Latin American indirect tax removed in v1.1 — out of market scope.)*
- **PAY-10.** **Provider tax reporting:** US 1099-K (via Stripe), EU **DAC7**, UK and Australian equivalents. Collect TINs/ABNs at onboarding; annual reporting exports.
- **PAY-11.** Provider-facing invoices/receipts, VAT/GST-compliant, in local language and currency; buyer receipts likewise.
- **PAY-12.** Full double-entry ledger, independent of Stripe's reporting. Every cent traceable: booking → charge → commission → tax → payout → refund. Finance-grade reconciliation exports and automated Stripe balance reconciliation.
- **PAY-13.** PCI-DSS SAQ-A scope only. Stripe Elements / Checkout; no card data touches our servers. Tokenised card-on-file for instalments and memberships.
- **PAY-14.** SCA / 3-D Secure 2 support with off-session exemptions for recurring charges (mandatory for EU/UK).
- **PAY-15.** **NEW in v1.1 — Stripe Connect country coverage.** Provider onboarding must gate on Stripe Connect availability in the provider's country. For providers in unsupported countries (notably several major retreat destinations), the system must support an **enquiry-only listing mode**: the retreat is discoverable and indexed, the user submits an enquiry, and the transaction happens off-platform. These listings are visually distinguished, generate a lead rather than a booking, and are excluded from GMV. See Open Decision #11.

### 7.9 Waivers, Health Intake & Liability (WVR)

- **WVR-1.** **Digital liability waiver signed at booking**, before the session. Legally distinct templates per jurisdiction (US state-level variation, EU member states, UK, Australia); provider may add their own clauses.
- **WVR-2.** Waivers are immutable, versioned, timestamped, IP-logged, and retrievable as PDF by both parties. Re-signature required when a provider's waiver version changes.
- **WVR-3.** Optional **health intake / PAR-Q** per listing, mandatory for prenatal, therapeutic, hot, aerial, breathwork, and ice exposure.
- **WVR-4.** Health data is special-category personal data under GDPR/UK GDPR. Encrypt at rest with separate key scope, restrict access to the specific provider for the specific booking, audit every read, and apply short retention.
- **WVR-5.** Minor bookings require guardian consent; under-16 accounts prohibited (COMP-6).
- **WVR-6.** Emergency contact capture for retreats and trainings.
- **WVR-7.** Contraindication warnings surfaced pre-booking for high-risk formats (breathwork/hyperventilation protocols, ice exposure, hot yoga, inversions, aerial).

### 7.10 Reviews & Ratings (REV)

- **REV-1.** **Verified-booking reviews only.** A review requires a booking in `attended` state. This is a hard constraint, not a setting.
- **REV-2.** Review window opens 24 h after the occurrence, closes at 30 days.
- **REV-3.** **Multi-dimensional ratings by listing type:**
  - *Class:* teaching quality, atmosphere, facilities, value, accuracy of description
  - *Retreat:* accommodation, food, teaching, location, group experience, value, accuracy
  - *Training:* curriculum quality, lead teacher contact hours, organisation, support, career value, accuracy
- **REV-4.** Free-text with minimum length, photo upload (moderated), and structured tags.
- **REV-5.** **Attribution:** reviews attach to the teacher, the studio, and the listing independently, and reflect substitutions (SCH-3). A teacher's rating travels with them across studios.
- **REV-6.** Provider right of reply (one public response per review).
- **REV-7.** Reviews are immutable after a 24-hour edit window; deletion only via T&S process with reason logged.
- **REV-8.** Aggregate ratings display count and distribution, never a bare star. Suppress aggregates below a minimum sample (n=3) to avoid misleading `AggregateRating` markup.
- **REV-9.** Fraud controls: velocity limits, device/IP clustering, review-for-discount detection, sentiment/text-reuse analysis, provider-linked account detection.
- **REV-10.** Recency weighting in ranking; decay old reviews.
- **REV-11.** Post-booking prompt via email and web push, one reminder maximum.
- **REV-12.** Reviews are translated for display (MT labelled) with the original always accessible.

### 7.11 Messaging & Notifications (MSG)

- **MSG-1.** In-platform messaging between practitioner and provider, threaded per booking or enquiry.
- **MSG-2.** Contact-information masking pre-booking, with post-booking release. Anti-circumvention detection on phone numbers, emails, and external URLs — **log and rate-limit, do not hard-block** (over-blocking damages provider trust).
- **MSG-3.** Enquiry flow for retreats, trainings, venues, private sessions, and PAY-15 enquiry-only listings; provider response-time SLA displayed publicly.
- **MSG-4.** Notification channels: email, **web push** (desktop and mobile browsers), SMS (transactional only, opt-in).
- **MSG-5.** Transactional notifications: booking confirmed, reminder (24 h and 2 h configurable), cancellation, substitution, waitlist promotion, payment due/failed, balance due, review request, refund issued.
- **MSG-6.** Marketing notifications: strictly opt-in, granular preference centre, one-click unsubscribe, per-channel and per-topic. GDPR/PECR/CAN-SPAM compliant.
- **MSG-7.** Provider-to-student broadcast (to their own students only) with rate limits and abuse monitoring.
- **MSG-8.** All templates localised into the seven launch languages.

### 7.12 Provider Dashboard (DASH)

- **DASH-1.** Onboarding wizard: claim or create → verify identity → connect Stripe → import schedule → publish. Target: **live in under 15 minutes**, resumable.
- **DASH-2.** Schedule manager: calendar and list views, drag-to-reschedule, bulk edit, conflict warnings.
- **DASH-3.** Bookings manager: roster per occurrence, check-in, no-show marking, manual booking entry (for walk-ins/cash), comp/free-place issuance.
- **DASH-4.** **Student CRM:** contact list, booking history, packs/memberships held, notes (private), injuries flagged from intake, tags, segments, export.
- **DASH-5.** Financials: upcoming and historical payouts, commission breakdown, refunds, tax documents, downloadable statements.
- ~~**DASH-6.** Provider performance analytics.~~ **Removed in v1.1.** See changelog flag. Underlying instrumentation (ANL-1) is still required.
- **DASH-7.** **Public-page performance panel** — impressions and views on their profile, including *before* they claim it. **Retained.** This is the primary claim-conversion lever (ING-6) and requires view/impression tracking to be built regardless of the DASH-6 removal.
- **DASH-8.** Marketing tools: promo code creation, intro offer configuration, shareable social cards (auto-generated for next class/retreat), link-in-bio configuration.
- **DASH-9.** Team management: invite staff, assign roles, manage teacher roster and affiliations.
- **DASH-10.** Policy management: cancellation policies, waiver customisation, house rules, booking windows.
- **DASH-11.** Full dashboard functionality on mobile web, with check-in and roster optimised for phone use (WEB-4).

### 7.13 Data Ingestion, Seeding & Claim (ING)

The index is seeded by automated agents. This module governs how that data becomes safe, legal, and useful.

- **ING-1.** Ingestion pipeline: source connectors → normalisation → **entity resolution** → confidence scoring → staging → publish gate.
- **ING-2.** **Entity resolution is the hard problem**, not crawling. Must handle one person across multiple studios, name variants, accented/diacritic variants, shared studio names across cities, and social handle matching. Human-in-the-loop review queue for low-confidence merges. Every merge reversible.
- **ING-3.** **Only durable facts may be auto-published:** name, location, contact, website, social links, styles, stated credentials, opening hours.
- **ING-4.** **Schedules and prices are never auto-published from ingestion.** They come only from provider claim, direct entry, or authorised sync. A stale schedule is worse than no schedule.
- **ING-5.** No third-party images may be copied. Use licensed map/place imagery under its terms, or leave media empty until claim.
- **ING-6.** **Claim flow:** verification by email domain, phone, social handle ownership, or Google Business Profile. Target under 60 seconds. Claim page leads with the profile's traffic stats (DASH-7), not with a sales pitch.
- **ING-7.** **Pre-claim notification and opt-out.** Before or at publication, attempt notification to the listed party with a one-click "remove me" that works without an account. Under GDPR/UK GDPR Art. 14 this is an obligation for indirectly-collected personal data, not a courtesy. Removal must complete within 72 hours and be permanent (suppression list prevents re-ingestion).
- **ING-8.** Full provenance and audit trail per field: source URL, method, timestamp, agent version.
- **ING-9.** **Freshness enforcement:** `last_verified_at` per record; scheduled liveness checks (website reachable, business open, social active); decay score; automatic demotion then unpublication of stale records. Target: no published record older than 90 days without re-verification.
- **ING-10.** Respect `robots.txt`, rate limits, and source ToS. Maintain a per-source legal register. Do not ingest from sources where prohibition is explicit.
- **ING-11.** User- and provider-facing "suggest an edit" and "report incorrect/closed" flows feeding the Ops queue.
- **ING-12.** Ingestion cost control: crawlers and deterministic parsers do the volume work; model inference is reserved for extraction, normalisation, and disambiguation.

### 7.14 SEO & AEO Architecture (SEO)

The directory — not the blog — is the primary organic asset. These are engineering requirements, not marketing preferences. **With native apps removed, the web experience carries 100% of both acquisition and retention. Every requirement in this section is now higher-stakes than in v1.0.**

- **SEO-1.** **Server-side rendering for every indexable page.** AI crawlers largely do not execute JavaScript; a client-rendered marketplace is invisible to them. This is a launch blocker.
- **SEO-2.** Page architecture:

  | Page type | URL | Primary schema |
  |---|---|---|
  | City hub | `/{country}/{city}/yoga` | `ItemList`, `BreadcrumbList` |
  | City × style | `/{country}/{city}/{style}-yoga` | `ItemList`, `FAQPage` |
  | City × modality | `/{country}/{city}/meditation` | `ItemList` |
  | Neighbourhood | `/{country}/{city}/{neighbourhood}` | `ItemList` |
  | Studio | `/studios/{country}/{city}/{slug}` | `LocalBusiness`, `AggregateRating` |
  | Teacher | `/teachers/{slug}` | `Person`, `AggregateRating` |
  | Class/event | `/classes/{slug}` | `Event`, `Offer` |
  | Retreat | `/yoga-retreats/{country}/{slug}` | `Event` / `TouristTrip`, `Offer` |
  | Training | `/yoga-teacher-training/{country}/{city}` | `Course`, `CourseInstance`, `Offer` |
  | Blog | `/blog/{slug}` | `Article`, `FAQPage` |

- **SEO-3.** `AggregateRating` markup only where a genuine minimum sample exists (REV-8). Fabricated or thin rating markup is a manual-action risk.
- **SEO-4.** **Thin-page suppression.** A generated page is `noindex` until it meets a quality threshold (minimum live listings, verified provider present, or unique content). Plan for strong pages, not many pages. Google's scaled-content-abuse policy targets exactly the opposite pattern.
- **SEO-5.** `robots.txt` **explicitly allows** AI crawlers: `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `CCBot`, `Bingbot`. Provide `/llms.txt` at root pointing to hub pages and canonical definitions.
- **SEO-6.** AEO content structure on all hub pages: a 40–60 word direct answer near the top, question-shaped H2s, comparison tables, and an FAQ block with `FAQPage` markup.
- **SEO-7.** Full `hreflang` implementation across all supported languages with `x-default`; self-referencing canonicals; no cross-language duplicate cannibalisation.
- **SEO-8.** XML sitemap index, segmented by page type, auto-regenerating, under 50k URLs per file, with `lastmod` reflecting real content change.
- **SEO-9.** **Core Web Vitals budget: LCP < 2.5 s, INP < 200 ms, CLS < 0.1** at p75 on 4G mobile, enforced in CI with automatic build failure on regression.
- **SEO-10.** Redirect discipline: permanent 301s on slug change, no chains longer than one hop, 410 for permanently removed listings.
- **SEO-11.** Internal linking engine: city ↔ style ↔ neighbourhood ↔ provider ↔ blog, with varied anchor text, generated from the taxonomy rather than hand-maintained.
- **SEO-12.** Programmatic meta titles and descriptions from templates, with per-page override capability in the CMS.
- **SEO-13.** Blog CMS with author profiles (E-E-A-T), review/update dates, editorial workflow, and structured data.
- **SEO-14.** Analytics: Search Console API ingestion, rank tracking, and **AI-citation monitoring** (whether we are cited by AI Overviews, Perplexity, ChatGPT Search) as a tracked KPI.

### 7.15 Trust, Safety & Moderation (TSF)

- **TSF-1.** Report flows on every profile, listing, review, and message, with categories including **safeguarding and professional misconduct**.
- **TSF-2.** Documented escalation path for misconduct allegations, with legal review, defamation-aware handling, and a defined suspension standard. This is a **launch blocker**, not a fast-follow. A platform that indexes named individuals inherits this exposure.
- **TSF-3.** Automated content moderation on user-generated text and images, with human review queue and SLA.
- **TSF-4.** Provider suspension and delisting workflow with appeal rights and full audit trail.
- **TSF-5.** Fraud detection: fake listings, payment fraud (Stripe Radar plus platform rules), review manipulation, account takeover, provider impersonation.
- **TSF-6.** Duplicate/impersonation detection at claim time — a claim contest process with evidence submission.
- **TSF-7.** Safeguarding: enhanced verification requirements for providers listing kids' or minors' classes, including DBS (UK) and Working With Children Check (Australia) where applicable.
- **TSF-8.** Public Trust & Safety policy, community guidelines, and transparency reporting.

### 7.16 Admin & Ops Console (ADM)

- **ADM-1.** Record management: search, edit, merge, split, unpublish any entity, with full audit log and rollback.
- **ADM-2.** Verification queues (credentials, insurance, claims, disputed claims) with assignment and SLA tracking.
- **ADM-3.** Moderation queues (reports, reviews, images, messages).
- **ADM-4.** Taxonomy management with translations and synonyms.
- **ADM-5.** Feature flags and per-market configuration (payment methods, tax rules, languages, commission rates, live/dark status per city).
- **ADM-6.** Financial operations: manual refunds, payout adjustments, commission overrides, Stripe reconciliation tooling.
- **ADM-7.** Impersonation ("view as provider") for support, consent-gated and audit-logged.
- **ADM-8.** GDPR request handling console: access, rectification, erasure, portability, with SLA timers.
- **ADM-9.** Bulk city launch tooling: activate a city, generate its pages, set its payment/tax config, from configuration only.

### 7.17 Analytics & Reporting (ANL)

- **ANL-1.** Event pipeline with a governed schema; every funnel step instrumented from search impression to review submission. **Required regardless of the DASH-6 removal** — DASH-7 and internal reporting both depend on it.
- **ANL-2.** Core marketplace KPIs: GMV, take rate, bookings, conversion by step, liquidity (% of listings with ≥1 booking in 30 days), supply coverage per city, provider activation rate, claim rate, repeat booking rate, cancellation/no-show rate, CAC/LTV by cohort.
- **ANL-3.** Data quality dashboard: coverage, freshness, verification rate, duplicate rate per city.
- **ANL-4.** Experimentation platform with server-side assignment; ranking and pricing changes must be A/B testable.
- **ANL-5.** Consent-aware tracking (GDPR/ePrivacy) — no non-essential tracking before consent in EU/UK.

### 7.18 Integrations (INT)

- **INT-1.** **Schedule import/sync is the highest-leverage supply feature in this document.** Most target providers already run an incumbent system and will not re-key schedules.
  - Read integrations: Mindbody, Momence, WellnessLiving, Arketa, Glofox, Eversports, Punchpass, Acuity, Google Calendar, iCal/ICS feed
  - Generic CSV importer and ICS subscription as universal fallbacks
  - Conflict resolution rules where we hold both synced and native inventory
- **INT-2.** Video conferencing for online classes: Zoom, Google Meet, and a native WebRTC option with auto-generated per-occurrence links.
- **INT-3.** Google Business Profile connection for studios (hours, NAP consistency, review signals).
- **INT-4.** Maps and geocoding (Google Places + a fallback provider); transit and travel-time data.
- **INT-5.** Credential registry lookups (CRD-2).
- **INT-6.** Email and SMS providers; **web push** (VAPID / Web Push Protocol) — no APNs/FCM native integration required.
- **INT-7.** Media pipeline: image and video upload, transcode, adaptive streaming, CDN, WebP/AVIF delivery.
- **INT-8.** **Public API and webhooks** for providers and partners: listings, availability, bookings, webhooks on booking lifecycle. Rate-limited, key-managed, documented.
- **INT-9.** Affiliate tracking system with per-partner attribution and commission — retreat marketplaces are heavily affiliate-driven and this is a real distribution channel.
- **INT-10.** Travel insurance partner referral on retreat checkout.
- **INT-11.** Stripe (PAY-1) — the only payments integration.

### 7.19 Responsive Web (WEB)

*Replaces §7.19 Mobile Applications. MOB-1 … MOB-5 removed in v1.1.*

- **WEB-1.** Single responsive web application serving desktop, tablet, and mobile browsers. **No native apps, no app install prompts, no interstitials.**
- **WEB-2.** Mobile-first design. Assume 70%+ of traffic is mobile browser, arriving from search and from Instagram/TikTok in-app browsers. **In-app browser compatibility (Instagram, TikTok, Facebook webviews) must be explicitly tested** — these webviews have known issues with payment sheets, OAuth redirects, and cookie handling that will silently break checkout if untested.
- **WEB-3.** Browser support: last two major versions of Chrome, Safari, Firefox, Edge; iOS Safari 16+; Android Chrome. Apple Pay requires Safari; Google Pay requires Chrome — both must degrade gracefully to card entry.
- **WEB-4.** **Provider mobile web must support QR check-in via the device camera** (`getUserMedia` + a JS QR decoder), with a manual code-entry fallback for camera-permission denial. This replaces the removed native scanner (MOB-3) and is a launch requirement for in-studio use.
- **WEB-5.** **Progressive Web App baseline:** installable manifest, service worker for offline access to upcoming bookings and check-in rosters, and **web push notifications** (Safari 16.4+ supports web push on iOS only for installed PWAs — the notification strategy must account for this limitation and degrade to email).
- **WEB-6.** Add-to-calendar (.ics), Web Share API, and deep-linkable URLs for every bookable entity so that links shared from social bios land on the correct page with no interstitial.

---

## 8. Non-Functional Requirements

- **NFR-1.** Availability 99.9% for booking and payment paths; 99.5% for search.
- **NFR-2.** Search p95 < 400 ms; page TTFB p95 < 300 ms; booking confirmation p95 < 2 s.
- **NFR-3.** Scale targets at launch: 350k providers, 1.5M listings, 8M occurrences, 4M monthly visitors. Architecture headroom to 10×.
- **NFR-4.** Multi-region deployment (US, EU, APAC/Australia) with data residency controls (COMP-2).
- **NFR-5.** Accessibility: **WCAG 2.2 AA**. Non-negotiable — we market accessibility filters and must meet the standard ourselves. Also an EAA requirement in the EU.
- **NFR-6.** Mobile-first design; the web app is the only client.
- **NFR-7.** Security: OWASP ASVS L2, SSO/2FA for internal tools, secrets management, dependency scanning, annual pen test, bug bounty at launch+3 months.
- **NFR-8.** Encryption in transit and at rest; separate key scope for special-category data (WVR-4).
- **NFR-9.** Observability: distributed tracing, structured logging, RUM, synthetic monitoring of booking and payment paths per region.
- **NFR-10.** Disaster recovery: RPO 15 min, RTO 4 h; quarterly restore drills.
- **NFR-11.** Idempotency keys on all payment and booking mutations (Stripe idempotency keys plus internal).
- **NFR-12.** Backwards-compatible API versioning.

---

## 9. Compliance & Legal

- **COMP-1.** **GDPR / UK GDPR** — lawful basis register, DPIA for the ingestion pipeline and health-intake data, Article 14 notification for indirectly-collected data (ING-7), designated privacy lead, records of processing, EU representative if no EU establishment.
- **COMP-2.** **Australia Privacy Act / Australian Privacy Principles** — notifiable data breach scheme, cross-border disclosure disclosure.
- **COMP-3.** **CCPA / CPRA** and other US state privacy laws (Virginia, Colorado, Connecticut, Texas) — opt-out of sale/sharing, Global Privacy Control honouring.
- **COMP-4.** Data subject rights: access, rectification, erasure, portability, objection — self-serve where possible, with SLA-tracked manual fallback (ADM-8).
- **COMP-5.** Cookie/consent management platform, geo-aware, blocking non-essential tags pre-consent (EU/UK PECR).
- **COMP-6.** Minimum age 16 (18 in some jurisdictions); guardian consent for minor bookings; no under-age accounts.
- **COMP-7.** Marketplace terms: separate practitioner ToS, provider agreement, and platform liability position. We are an intermediary, not the service provider — this must be explicit and consistently reflected in UX copy.
- **COMP-8.** **EU DSA** obligations: notice-and-action mechanism, trader traceability (KYC for providers), transparency reporting, statement of reasons for suspensions.
- **COMP-9.** **EU P2B Regulation** — ranking transparency disclosure (we must publish the main parameters determining ranking, per SRCH-14) and provider dispute mechanism.
- **COMP-10.** Consumer protection: EU/UK cancellation rights, UK CMA price-transparency rules, Australian Consumer Law, US FTC rules on negative-option billing (memberships) and on drip pricing. All-in pricing display where mandated.
- **COMP-11.** Advertising/paid-placement labelling (SRCH-14).
- **COMP-12.** Accessibility legislation: **EAA (EU, in force)**, ADA (US), Equality Act (UK), DDA (Australia).
- **COMP-13.** Insurance: platform E&O/cyber; clear position that providers must carry their own professional liability insurance (CRD-5).

*(India DPDP and Brazil LGPD removed in v1.1 — out of market scope.)*

---

## 10. Localisation

- **LOC-1.** Launch languages: **English, Spanish, Portuguese, German, French, Italian, Dutch.** Architecture must support additional languages without code change.
- **LOC-2.** Full i18n: no hardcoded strings, ICU message format, locale-aware dates/times/numbers/currencies, per-locale address formats.
- **LOC-3.** Machine translation for user-generated content, clearly labelled, original always accessible. Human translation for all product surfaces and legal text.
- **LOC-4.** Locale detection from geo + browser, always user-overridable, persisted per account.
- **LOC-5.** Culturally aware defaults: 12/24 h clocks, week start day, name ordering, phone formats, imperial vs metric.
- **LOC-6.** English variants: en-US, en-GB, en-AU must differ where it matters (spelling, currency, date format, "studio" vs "centre" conventions).

---

## 11. Release Phasing

Feature-complete at public launch, but built in this order. Coverage without transactions is the failure mode to avoid.

**Phase 0 — Foundations (weeks 1–8)**
Domain model, auth, RBAC, Stripe integration core, Stripe Tax, ingestion pipeline, SSR framework, observability, taxonomy, admin console skeleton, legal/compliance groundwork.

**Phase 1 — Index & organic surface (weeks 6–16)**
Ingestion at scale, entity resolution, provider profiles, claim flow, city/style/retreat page generation, full schema markup, sitemaps, hreflang, CWV budget enforcement. **Internal-only until ING-7 opt-out and TSF-2 escalation path are signed off by Legal.**

**Phase 2 — High-ticket transactions (weeks 12–24)**
Retreat and training listings, deposits, instalments, applications, escrow, enquiry messaging, PAY-15 enquiry-only mode, retreat-specific search and comparison, reviews for these types, affiliate tracking. This is the revenue engine — it ships first because it needs no schedule integration.

**Phase 3 — High-frequency transactions (weeks 18–30)**
Scheduling engine, class/workshop/course/private listings, packs and memberships, waitlists, QR check-in (WEB-4), substitutions, schedule integrations (INT-1), provider dashboard, on-demand content.

**Phase 4 — Scale & polish (weeks 24–32)**
Natural-language search, saved searches and alerts, corporate booking, venue listings, public API, experimentation platform, PWA hardening (WEB-5).

*Note: removing native apps takes roughly 4 weeks out of the critical path versus v1.0.*

**Phase 5 — Launch (week 32+)**
City-by-city activation. **Do not open all 50 cities simultaneously.** Activate a city only when it passes the coverage gate (Section 12). Target 8–12 cities at public launch, remainder over the following two quarters. Note the seasonal pattern: January is the strongest signup month globally, followed by September — time public launch accordingly.

---

## 12. Launch Gates

**Per-city gate — a city page goes live only when:**
- ≥ 60 published providers with verified-live status
- ≥ 15 claimed providers with bookable inventory
- ≥ 200 bookable occurrences in the next 14 days
- ≥ 1 provider bookable in each of the top 5 styles for that market
- Stripe payment methods live and tax configuration validated
- City page passes CWV budget and thin-page threshold (SEO-4)

**Global launch gate:**
- Booking-to-payout flow verified end to end in every launch currency
- Refund, cancellation, chargeback, and dispute paths tested per region
- Waiver templates approved by counsel per jurisdiction
- T&S escalation path (TSF-2) staffed and documented
- GDPR Art. 14 notification and opt-out (ING-7) operating with < 72 h resolution
- Accessibility audit passed at WCAG 2.2 AA
- **Checkout verified inside Instagram and TikTok in-app browsers (WEB-2)**
- Pen test completed, criticals and highs remediated
- DR restore drill passed

---

## 13. Open Business Decisions

| # | Decision | Blocks |
|---|---|---|
| ~~1~~ | ~~UK/Australia city count~~ | **Resolved v1.1 — 5 each.** |
| 2 | Commission rates per vertical and per tier | PAY-4, provider agreement |
| 3 | Is there a provider SaaS subscription tier at launch, or commission only? | Billing, DASH gating |
| 4 | Paid placement / featured listings at launch, yes or no? | SRCH-14, COMP-9, COMP-11 |
| 5 | Escrow release timing for retreats (PAY-6) | Payment architecture, provider agreement |
| 6 | Position on providers linking to their own site and price from the profile | Disintermediation policy, MSG-2 |
| 7 | Legal sign-off on the ingestion basis per jurisdiction | Phase 1 publication |
| ~~8~~ | ~~Apple IAP ruling on on-demand content~~ | **Removed v1.1 — no native apps.** |
| 9 | Brand name, domain, and trademark clearance in all launch markets | Everything user-facing |
| 10 | Which 8–12 cities open at public launch | Phase 5 sequencing |
| **11** | **Stripe-only + "retreats anywhere": accept enquiry-only listings for organisers outside Stripe Connect coverage, restrict retreat supply to Stripe countries, or add a second payout rail later?** | **PAY-15, Phase 2 scope, retreat GMV forecast** |

---

## Appendix A — Launch Cities (50)

**United States (20):** New York, Los Angeles, San Francisco Bay Area, Chicago, Austin, Denver, Boulder, Seattle, Portland, Boston, Miami, San Diego, Washington DC, Atlanta, Philadelphia, Dallas, Houston, Nashville, Phoenix–Scottsdale, Minneapolis–St Paul

**Continental Europe (20):** Berlin, Munich, Hamburg, Amsterdam, Paris, Lyon, Barcelona, Madrid, Valencia, Lisbon, Porto, Milan, Rome, Copenhagen, Stockholm, Zurich, Vienna, Dublin, Prague, Warsaw

**United Kingdom (5):** London, Manchester, Bristol, Edinburgh, Brighton

**Australia (5):** Sydney, Melbourne, Byron Bay, Brisbane, Perth

*Note: Byron Bay is a major retreat and teacher-training destination as well as a local market. Its city page must surface both local classes and global-audience training inventory. Lisbon, Barcelona, and Boulder have similar dual character.*

**Global, non-city inventory:** online/live-streamed (all timezones), retreats (worldwide, subject to PAY-15), teacher trainings (worldwide, subject to PAY-15).

---

## Appendix B — Currencies & Payment Methods

All via Stripe.

| Region | Currencies | Methods |
|---|---|---|
| US | USD | Cards, Apple Pay, Google Pay, Link, ACH Direct Debit |
| Continental Europe | EUR, CHF, SEK, DKK, CZK, PLN | Cards, Apple Pay, Google Pay, Link, SEPA Direct Debit, iDEAL, Bancontact, Sofort, Klarna |
| UK | GBP | Cards, Apple Pay, Google Pay, Link, Bacs Direct Debit, Klarna |
| Australia | AUD | Cards, Apple Pay, Google Pay, Link, BECS Direct Debit |

*Stripe availability must be re-verified per market during Phase 0; method support changes.*

---

## Appendix C — Definitions

- **Occurrence** — a single dated instance of a Listing.
- **Liquidity** — proportion of published listings receiving at least one booking in a 30-day window. The primary health metric.
- **Provenance** — how a record entered the system: seeded, claimed, or natively created.
- **RYT / RYS** — Registered Yoga Teacher / Registered Yoga School. A voluntary registry designation, **not** a licence or state certification. Product copy must never imply otherwise.
- **Take rate** — platform commission as a percentage of GMV.
- **AEO** — Answer Engine Optimization: being retrieved and cited by LLM-powered search surfaces.
- **Enquiry-only listing** — an indexed, discoverable listing that generates a lead rather than a booking, used where the provider cannot be paid via Stripe Connect (PAY-15).
