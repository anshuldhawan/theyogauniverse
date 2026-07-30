# Product Requirements — Global Yoga & Meditation Platform

**Version:** 1.2 (supersedes v1.1)
**Date:** 28 July 2026
**Status:** Approved for build
**Audience:** Engineering, Product, Design, Data, Trust & Safety, Growth, Finance

---

## Changelog — v1.1 → v1.2

Requirement IDs in Section 7.8 are **renumbered** in this version — the section was restructured, not amended. All other section IDs are stable. Removed items are listed here rather than renumbered.

> ⚠️ **PAY renumbering warning for existing tickets.** **Four** IDs have been *reused with different meanings*, which is more dangerous than a dangling reference. Any ticket citing a v1.1 PAY number must be re-read against this version:
> | ID | Meant in v1.1 | Means in v1.2 | v1.1 content now lives at |
> |---|---|---|---|
> | PAY-2 | Payment methods | US-only payout eligibility gate | **PAY-19** |
> | PAY-6 | Escrow for retreats | No provider subscription tier | **PAY-8** |
> | PAY-8 | Chargeback and dispute handling | Escrow / delayed release | **PAY-20** |
> | PAY-15 | Enquiry-only listing mode | PCI-DSS scope | **PAY-17** |

| Change | Detail |
|---|---|
| **Payouts restricted to the US** | A provider can receive money only if they can onboard a **US** Stripe Connect account. All non-US providers become advertising-only. Section 7.8 rewritten; PAY-1 … PAY-15 replaced by **PAY-1 … PAY-20**. |
| **Buyer geography, by inventory type** | Buyers in **any country** may purchase US-held in-person inventory — retreats, trainings, classes, workshops. **Online and on-demand are US-buyers-only** (Decision #12), because those are taxed at the buyer's location. Supply side and demand side are decoupled and must be reasoned about separately. |
| **Two-tier city model** | The 50-city index is retained in full. **20 US cities are transactional**; the 30 Continental Europe / UK / Australia cities are **index-and-enquiry only**. Section 4 rewritten. |
| **Tax split into two tracks** | Track A (in-person, taxed where physically performed) — see **PAY-10**. Track B (online live and on-demand, taxed at buyer location) — see **PAY-11**, with the per-region kill switch at **PAY-11a**. |
| **Provider tax reporting narrowed** | 1099-K is the only reporting obligation we build. **DAC7, the UK digital-platform rules and the Australian SERR are designed out of scope** rather than complied with — advertising-only mode (PAY-17a) places non-US listings inside the advertising carve-out common to all three, and Decisions #12 and #16 remove the supply limbs. Recorded at PAY-12. A confirming counsel memo is recommended but is **not a launch blocker** (Decision #15, resolved). |
| **Payment methods reduced** | SEPA Direct Debit, Bacs Direct Debit and BECS Direct Debit removed — all require local settlement, which a USD-settling account cannot provide. Appendix B rewritten. |
| **Settlement currency single** | USD only. Multi-currency *presentment* to buyers retained. |
| **Terminology change** | What v1.1 called an **"enquiry-only listing"** is now an **"advertising-only listing."** Same records, deliberately renamed: "enquiry" implied a managed pipeline we can no longer operate. Global find-and-replace in tickets is safe. |
| **Advertising-only mode** | **PAY-17a, new.** Non-transactable listings are classified advertising, not a managed enquiry pipeline. No fee, no affiliate revenue, no contact masking, no conversion tracking, indicative price ranges only. This is what keeps us outside DAC7, the UK digital-platform rules and the Australian SERR. Cascades into BKG-20, MSG-2, MSG-3, LST-14, INT-9, ANL-1/2/3, DASH-7, NG-8. |
| **No foreign tax registrations** | Decision #12 declined and #16 deferred: online inventory is sold to **US buyers only**, and retreats must be **US-held**. Net effect — one indirect-tax programme (US marketplace facilitator), zero foreign registrations. COMP-15 rewritten. |
| **Release Phasing removed** | Former Section 11 deleted. **The product launches feature-complete, all sections of 7 simultaneously.** |
| **Launch Gates removed** | Former Section 12 deleted. Per-city coverage gates and the global launch gate no longer govern release. |
| **Section renumbering** | Former Section 13 (Open Business Decisions) becomes **Section 11**. |
| **Resolved** | Decisions #2 (commission 12%/5%), #3 (no SaaS tier), #4 (no paid placement), #5 (escrow at event start), #6 (no competing-checkout links), #11 (US-only payouts), #12 (no Track B abroad), #13 (15–20% demotion), #14 (authenticity-led claim pitch), #15 (designed out of reporting scope). |
| **Deferred** | Decision #16 (retreat destination registrations) — revisit in six months on demand data. |
| **Retired** | Decision #10 (which cities open at launch) — moot without phasing. |
| **New and open** | Decisions #7 (ingestion legal basis) and #9 (trademark clearance) remain open with recommendations on file. **#17 is new:** investigate Stripe Managed Payments as a merchant-of-record alternative before building Section 7.8. |

> ⚠️ **Flag on the removal of Launch Gates.** The gates were the mechanism that prevented a city page going live with thin inventory. Removing them does not remove **SEO-4** (thin-page suppression), which is now the *only* thing standing between the index and Google's scaled-content-abuse policy. SEO-4 is therefore promoted to a hard, non-configurable rule in v1.2. A city page with insufficient live inventory must return `noindex` automatically. Recommend Ops retains the gate thresholds as an internal dashboard even though they no longer block release.

> ⚠️ **Flag on buyer geography.** Unrestricted buyer geography is correct for **in-person US inventory** and costs nothing — a service performed in the US is taxed in the US whoever buys it. For **online and on-demand inventory it would re-import the entire foreign indirect tax stack**, because those are taxed at the buyer's location. Decision #12 therefore restricts online and on-demand sales to **US buyers only**, and PAY-11a ships with every non-US region disabled.
>
> Net position: **a buyer anywhere can book a US retreat, class or training; only a US buyer can book an online class.** That asymmetry looks arbitrary from the outside and will generate support questions. It is not arbitrary — it is the place-of-supply rule — but the product copy must handle it gracefully rather than expose the reasoning.

> ⚠️ **Flag on the advertising-only decision (PAY-17a).** Designing out of DAC7, the UK rules and the SERR is a sound trade, but it has one uncomfortable consequence worth surfacing to the board: **the 30 non-US cities become permanently unmeasurable.** We can report impressions, views and outbound clicks, and nothing else. Their value must be argued rather than proven. If that argument is not convincing at the twelve-month mark, the honest options are to fund them as brand, or to cut them — not to instrument them.

> ⚠️ **Flag on Decision #6 (no outbound links on transactable listings).** This directly conflicts with **PRO-7 (link-in-bio mode)**, which the document identifies as a primary supply-acquisition feature. A provider cannot use their profile as an Instagram bio link if it strips their own website link. v1.2 resolves the conflict by scoping the restriction to outbound links *to competing booking paths*, not all outbound links — see MSG-2. Recommend explicit sign-off on that reading.

---

## 1. Purpose & Scope

Build a two-sided global platform that is (a) the definitive **index** of yoga, meditation, and breathwork providers and offerings across the launch markets, and (b) a **transactional marketplace** where users discover, compare, book, and pay for those offerings.

The platform serves two distinct commercial motions that share one data layer:

| Motion | Inventory | Typical AOV | Take rate | Primary acquisition |
|---|---|---|---|---|
| **High-ticket** | Retreats, teacher trainings, immersions, continuing education | $150–$7,000 | **12% commission** | Organic search, AI answer engines |
| **High-frequency** | Drop-in classes, courses, workshops, online live, on-demand | $10–$60 | **5% commission** | Local search, map pack, teacher-led referral |

Both must be feature-complete at launch. The high-ticket motion funds the business; the high-frequency motion creates retention and defensibility.

### 1.1 The index/transaction asymmetry (new in v1.2)

v1.2 deliberately separates the two halves of the product:

- **The index is global.** 50 cities, worldwide retreats, worldwide trainings, all languages. Unchanged from v1.1.
- **The transaction layer is entirely domestic.** After the decisions recorded in Section 11, v1 transacts **only** where the supply is US-domiciled, US-performed, and US-consumed:
  1. **Payability** — the Organisation must be **US-domiciled** (PAY-2).
  2. **Tax tractability** — we hold exactly **one** indirect-tax registration programme, US marketplace facilitator (PAY-10). **No foreign indirect-tax registrations are taken in v1** (Decision #12, #16).

In practice this resolves to three bookable categories and nothing else:

| Bookable in v1 | Not bookable in v1 |
|---|---|
| In-person inventory in the 20 US cities, from US-domiciled providers | Anything from a non-US-domiciled Organisation, anywhere |
| Retreats and trainings physically held in the US, from US-domiciled organisers | Retreats and trainings held outside the US, whoever owns them (Decision #16, deferred) |
| Online and on-demand from US-domiciled providers, **sold to US buyers** | Online and on-demand sold to non-US buyers (Decision #12, declined) |

- **Everything else is advertising.** Non-transactable listings run in **advertising-only mode** (PAY-17, constrained by **PAY-17a**): fully indexed, searchable, ranked and discoverable, with the provider's own contact details shown and the user leaving the platform to transact. We take no fee, track no conversion, and do not intervene in the connection. This is a deliberate legal posture, not a product compromise — see PAY-12 and Decision #15.

The consequence to internalise: **the index is global, the business is domestic.** 30 of 50 cities, all non-US retreat destinations, and every non-US buyer of online inventory are reach and brand, not revenue. If that reach cannot be converted into US-side demand or into a later market entry, it is a cost centre. Growth owns that argument (Decision #14).

### 1.2 Scope boundaries

**In scope for v1:** everything in Section 7.

**Explicitly out of scope for v1 (Section 3):** wearable integration, nutrition/ayurveda booking, physical goods commerce, franchise/multi-brand hierarchy management, white-label studio websites, in-house video production, native mobile applications, non-US payouts.

---

## 2. Product Summary

A user **in any country** can:

1. Search by location, date/time, modality, style, language, price, accessibility, and teacher attributes across all 50 cities and all global retreat/training inventory.
2. View verified provider profiles at stable, unique, indexable URLs.
3. **Book and pay** for any listing that is both payable and tax-tractable (§4.3) — in-person classes in the 20 US cities from US-domiciled providers, and retreats and trainings held in the US by US-domiciled organisers. **Buyers in any country may book these.**
4. **Book online and on-demand sessions from US-domiciled providers — US buyers only** (Decision #12, PAY-11a).
5. **Contact the provider directly** on everything else. The listing is advertising; we are not party to what follows (PAY-17a, BKG-20).
6. Leave verified reviews tied to completed bookings.

> **Growth note, carried forward from v1.1 §11.** January is the strongest signup month globally, followed by September. With phased launch removed, this no longer sequences the release — but it should still time marketing spend, PR and supply-acquisition pushes.

A teacher, studio, school, or retreat organiser can:

1. Claim a pre-seeded profile or create one from scratch in under 5 minutes — **anywhere in the world**.
2. Import or sync an existing schedule from their incumbent booking system.
3. Publish inventory across all six listing types.
4. **If US-domiciled:** take payment with flexible pricing (drop-in, packs, memberships, deposits, instalments) and receive payouts.
5. **If not US-domiciled:** receive and respond to enquiries, manage their profile and public presence, and access their traffic statistics.

---

## 3. Non-Goals for v1

- **NG-1.** We are not replacing Mindbody/Momence as a studio's system of record. We interoperate with it. Full studio back-office (payroll, POS, inventory, staff scheduling) is out of scope.
- **NG-2.** We do not produce first-party content (video classes, courses). We host third-party on-demand only.
- **NG-3.** No subscription aggregator model (ClassPass-style credit pool) in v1. Architecture must not preclude it.
- **NG-4.** **No native mobile applications.** Responsive web only.
- **NG-5.** No Latin America or India market entry in v1. Architecture must not preclude it — see NG-5a.
- **NG-5a.** All geo-specific behaviour (payment methods, tax rules, languages, currencies, legal templates, payout eligibility) is configuration, never code. Adding a market must not require a deploy.
- **NG-6. NEW — We do not pay providers outside the United States in v1.** No second payout rail, no PayPal/Wise/Payoneer fallback, no manual bank transfer process, no "we'll invoice you" workaround. Non-US providers are advertising-only, full stop.
  - **This is a v1 scope decision, not a permanent strategy.** The intent recorded at Decision #14 is to extend payouts to other markets in a later version. Architecture must not preclude it (PAY-1 orchestration interface, NG-5a), and provider-facing copy may state that payments are not available in their country *yet* — but must not promise a date.
- **NG-7. NEW — We do not gate discovery on transactability.** A non-payable provider ranks on merit and appears in results alongside payable ones, subject to the fixed SRCH-16 demotion. We are an index first.
- **NG-8. NEW — We do not facilitate, monetise or measure off-platform transactions.** For any advertising-only listing we take no fee, no affiliate revenue and no lead charge, and we do not track what happens after the user leaves. This is what keeps us outside DAC7, the UK digital-platform rules and the Australian SERR (PAY-12, PAY-17a). It is a legal boundary, not a product roadmap gap.

---

## 4. Geographic Scope

### 4.1 Index scope — 50 cities (unchanged)

- **United States** — 20 cities
- **Continental Europe** — 20 cities
- **United Kingdom** — 5 cities
- **Australia** — 5 cities

Full list in **Appendix A**. All 50 receive full local inventory, localised city landing pages, complete schema markup, and hreflang coverage.

### 4.2 Transaction scope — two-tier city model (new in v1.2)

| Tier | Cities | Provider capability | User capability |
|---|---|---|---|
| **Transactional** | US 20 | Claim, list, set prices, take payment, receive USD payouts, run packs/memberships/instalments, use the full dashboard | Search, compare, **book and pay**, review |
| **Advertising-only** | Continental Europe 20, UK 5, Australia 5 | Claim, list, manage profile and media, publish schedules, **publish their own contact details**, see traffic stats (DASH-7) | Search, compare, **contact the provider directly**, follow, save |

> **The tier describes the city, not a guarantee about every listing in it.** Transactability is always evaluated per listing under §4.3. Two consequences that the table above does not capture:
> - A **non-US-domiciled Organisation operating in a US city** — a German studio group with an Austin location, an Australian organiser running a Denver retreat — is **advertising-only**, because it fails the payability condition. US cities are not uniformly transactional.
> - A **US-domiciled provider in a non-US city** is payable, but its in-person classes there are still advertising-only on tax tractability. Non-US cities are uniformly non-transactional for in-person supply, for that reason rather than the payability one.
>
> Expect the first case to be a small but visible minority in the 20 US cities. Ops must not "fix" it by manual override; there is none (PAY-2).

### 4.3 The transactability rule, and global non-city-bound inventory

**The rule below governs every listing on the platform**, city-bound or not. It is stated here because the non-city-bound cases are where it bites hardest.

Transactability requires **two independent conditions, both of which must hold**:

1. **Payability** — can we move money to this Organisation? Follows **organiser domicile** (PAY-2). Stripe Connect eligibility attaches to the legal entity, not the venue, and not the city the listing appears in.
2. **Tax tractability** — do we have a **live, registered indirect-tax treatment** for this supply? Determined by place of supply: **where the service is physically performed** for in-person inventory (Track A, PAY-10), or **where the buyer is** for online and on-demand inventory (Track B, PAY-11).
   - Condition 2 is **not** "the place of supply is the US." It is "a treatment exists and is switched on." **In v1 the only live treatment is the US one** (Decision #12 declined foreign registration; Decision #16 deferred destination registration), so the two conditions currently collapse to the same answer. They remain modelled separately because that will stop being true the moment a single registration is added.

Applying both to non-city-bound inventory:

| Inventory | Organiser domicile | Physical location | v1 state |
|---|---|---|---|
| Retreat / training | US | US | **Bookable** — Track A, US place of supply |
| Retreat / training | US | Non-US (Bali, Portugal, Costa Rica…) | **Enquiry-only** — payable, but foreign place of supply with no registered treatment. See PAY-10 edge case. |
| Retreat / training | Non-US | Anywhere | **Enquiry-only** — not payable |
| Online / live-streamed | US | n/a | **Bookable to US buyers only.** Advertising-only to every non-US buyer — Decision #12 declined foreign registration (PAY-11a) |
| Online / live-streamed | Non-US | n/a | **Advertising-only** — not payable |
| On-demand | As online | n/a | As online |

> **This is the single most misread rule in the document.** A US-domiciled LLC running a retreat in Bali *is* payable — and is still **advertising-only in v1**, because we have no Indonesian place-of-supply treatment. Payability is necessary but not sufficient. Do not build supply-acquisition messaging that promises the contrary.
>
> **Commercial consequence worth escalating:** this materially shrinks the payable retreat pool to US-held retreats only, which is the narrowest reading of the v1.2 change. Widening it means registering for local indirect tax in each destination country — the same trade-off as Track B, in a longer tail. If retreat GMV forecasts assume non-US venues, that assumption fails here, not at PAY-2. Owned by Finance and Legal jointly; see Open Decision #16.

**Architectural requirement:** city coverage and payout eligibility are both data/content concerns, never code concerns. Adding city 51, or enabling payouts in country N, must require zero deploys.

---

## 5. Users & Roles

| Role | Description | Key capability |
|---|---|---|
| **Guest** | Unauthenticated visitor, any country | Search, view, guest checkout, enquire |
| **Practitioner** | Registered consumer, any country | Book, review, save, follow, manage bookings, enquire |
| **Teacher (US)** | Individual instructor, US-domiciled | Own a profile, list inventory, **take payment**, may be affiliated to N studios |
| **Teacher (non-US)** | Individual instructor, elsewhere | Own a profile, list inventory, **receive enquiries only** |
| **Studio Owner / Manager** | Operates a physical venue | Own a studio profile, manage roster, schedule, staff permissions. Payment capability per domicile. |
| **School (RYS)** | Runs teacher trainings | List YTT/CE programmes, manage cohorts. Instalments and applications available to US schools only. |
| **Retreat Organiser** | Runs retreats | List retreats worldwide. Deposits/balances/rooming payments available to US-domiciled organisers only. |
| **Venue Owner** | Rents space to organisers | List venue, receive enquiries (B2B, non-transactional for all domiciles) |
| **Internal: Ops** | Content/data operations | Merge, moderate, verify, correct records |
| **Internal: T&S** | Trust & Safety | Handle reports, suspensions, disputes |
| **Internal: Finance** | **NEW** | Ledger reconciliation, tax filing exports, payout adjustments, 1099-K oversight |
| **Internal: Admin** | Superuser | Full access, audit-logged |

**RBAC requirement (ACC-12):** A single human may hold multiple roles across multiple organisations simultaneously. Permissions are scoped per organisation, not per user.

**Domicile requirement (ACC-13, new):** Payout eligibility is an attribute of the **Organisation**, not the Person. A single Person may therefore hold payable and non-payable capabilities simultaneously — for example a US-domiciled teacher who also appears on the roster of a German studio: their own US-held listings are bookable, the German studio's listings are not. This must be modelled explicitly, not inferred from the user's profile country.

Note that ACC-13 governs *payability* only. A payable teacher's listing is still advertising-only if it is performed outside the US, per §4.3 — payability is necessary but not sufficient for transactability (DM-7).

---

## 6. Domain Model

```
Person ──┬── TeacherProfile ──┬── TeachesAt ──> StudioProfile   (many-to-many, time-bounded)
         │                    ├── Credential (verified | self-declared)
         │                    └── Lineage ──> Teacher/Tradition  (graph edge)
         └── UserAccount ─────┬─ Booking ──> Listing ──> Session/Occurrence
                              │     │
                              │     ├── Payment ──> Payout
                              │     ├── Waiver (signed, immutable)
                              │     └── Review (verified)
                              └─ Enquiry ──> Listing            (non-transactional path)

Organisation ──┬── StudioProfile
               ├── SchoolProfile (RYS)
               ├── RetreatOrganiserProfile
               ├── VenueProfile
               └── PayoutEligibility (domicile, Connect account, status)   ← NEW

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
- **DM-4.** Money is stored as integer minor units plus ISO-4217 currency. Never floats. Never a single implicit currency. **This holds even though settlement is USD-only** — presentment currency varies.
- **DM-5.** All timestamps stored UTC. Every Occurrence additionally stores its **IANA timezone identifier**, not an offset. Display converts to viewer-local.
- **DM-6.** Soft-delete everywhere; hard-delete only via GDPR erasure workflow (COMP-4).
- **DM-7. NEW.** Every Listing carries a derived `transactability` state (`bookable` | `enquiry_only`), computed per §4.3 from (a) the owning Organisation's `PayoutEligibility`, (b) the listing's tax track and `performance_country`, and (c) **for Track B listings, the viewing buyer's region** and whether its PAY-11a flag is enabled.
  - It is **derived, never hand-set**, and recomputed on any change to Connect account status or region flag.
  - Because of (c), transactability for online and on-demand listings is **request-scoped, not a cacheable property of the row**. Cache the Organisation- and listing-level components; resolve the buyer-region component at render. Modelling this as a single static column is the predictable mistake here and will show Book buttons to buyers who cannot check out.
  - A listing must never present a Book button it cannot honour.
- **DM-8. NEW.** Every Listing carries a `supply_type` (`in_person` | `online_live` | `on_demand`) and, for in-person, a `performance_country`. These two fields determine the tax track (PAY-10/PAY-11) and cannot be null on a published listing.

---

## 7. Functional Requirements

### 7.1 Identity & Accounts (ACC)

- **ACC-1.** Sign-in via Google, Apple, Facebook, email magic link, and phone OTP.
- **ACC-2.** **Guest checkout must work end to end.** Account creation is offered post-purchase, pre-populated. Forcing registration before payment is a launch blocker.
- **ACC-3.** Apple Sign-In supported alongside other SSO providers.
- **ACC-4.** Email verification required before a user may post a review or claim a profile.
- **ACC-5.** Provider identity verification (KYC) required before first payout, not before listing. Non-US providers complete a **lighter identity check** sufficient for DSA trader traceability (COMP-8) but do not enter Connect onboarding.
- **ACC-6.** Account merge flow for users who sign in with different providers on the same verified email.
- **ACC-7.** Session management: device list, remote revoke, 2FA (TOTP) available; mandatory for Organisation Admin roles.
- **ACC-8.** Self-serve data export and account deletion (see COMP-4).
- **ACC-9.** Users may follow teachers, studios, and cities; follows drive notification eligibility.
- **ACC-10.** Saved/wishlist collections for listings, shareable via public link.
- **ACC-11.** Practitioner profile stores: preferred styles, experience level, injuries/limitations (optional, encrypted), preferred languages, home city, timezone, **billing country**.
- **ACC-12.** RBAC scoped per organisation (see Section 5).
- **ACC-13.** Payout eligibility modelled per Organisation, not per Person (see Section 5).

### 7.2 Provider Profiles (PRO)

Every provider has a **unique, permanent, human-readable URL**, regardless of transactability.

- **PRO-1.** URL patterns:
  - `/teachers/{slug}`
  - `/studios/{country}/{city}/{slug}`
  - `/schools/{country}/{city}/{slug}`
  - `/organisers/{slug}`
  - `/venues/{country}/{region}/{slug}`
- **PRO-2.** Slug generation with deterministic collision handling (`jane-doe`, `jane-doe-lisbon`, `jane-doe-2`). Slugs are immutable once indexed; renames issue 301s and retain the old slug permanently.
- **PRO-3.** Optional custom domain / vanity domain mapping (CNAME + auto-TLS). **Available to all claimed providers** — with no paid tier (Decision #3), this is no longer a tier gate.
- **PRO-4.** **Teacher profile fields:** display name, pronouns, photo, cover media, short bio (≤160 chars, used for meta description), long bio (rich text), teaching philosophy, years teaching, **lineage** (trained under whom; tradition; links to other profiles), styles taught (controlled vocabulary), modalities, languages of instruction, cities/venues taught at, credentials (7.3), insurance status, hands-on adjustment policy + consent approach, specialisms (prenatal, trauma-informed, adaptive/chair, kids, seniors, plus-size-affirming, LGBTQ+-affirming), social links (Instagram, TikTok, YouTube, Spotify, website), **video introduction**, photo gallery, upcoming schedule, on-demand library, retreats/trainings, reviews, contact/enquiry.
- **PRO-5.** **Studio/venue-specific fields:** address + geocode, opening hours, room list with capacities, amenities (showers, changing rooms, mat/prop hire, parking, bike storage, café, lockers), **accessibility** (step-free access, accessible WC, hearing loop, lift, gender-neutral facilities), heated/hot yoga capability, teacher roster, photos, house rules, cancellation policy, transport directions.
- **PRO-6.** **School (RYS) fields:** registry ID, programme catalogue, lead teachers, contact hours breakdown, curriculum outline, accommodation options, graduate outcomes, cohort calendar.
- **PRO-7.** **Link-in-bio mode:** every provider profile renders a mobile-optimised, single-column "link in bio" variant at `/{slug}` suitable for use as their Instagram/TikTok bio link, with prominent book-or-enquire CTA, links, and next sessions. This is a primary supply-acquisition feature. **See MSG-2 for the outbound-link policy that constrains it.**
- ~~**PRO-8.** Embeddable schedule widget.~~ **Removed in v1.1.**
- **PRO-9.** Profile completeness score with guided next actions; drives search ranking (SRCH-14).
- **PRO-10.** Profile preview-as-visitor mode.
- **PRO-11.** Multi-location support: one Organisation, N StudioProfiles, shared roster and policies, independent schedules. **Payout eligibility is inherited from the Organisation across all its locations.**
- **PRO-12.** Teacher↔studio affiliation requires **mutual confirmation**; either party may end it. Ended affiliations retain history for past bookings and reviews.
- **PRO-13. NEW.** **Transactability is never a badge.** An advertising-only profile must not display anything resembling a downgrade, warning, or "unverified" treatment. The difference is expressed solely through the CTA ("Enquire" vs "Book") and a neutral one-line explanation of how booking works with that provider. Ops and Design to jointly own this copy. Getting it wrong makes 30 cities look broken.

### 7.3 Credential Verification (CRD)

Trust is the primary differentiator against an open directory. Verification must be visibly tiered — and is **independent of transactability**. A registry-verified Berlin teacher outranks an unverified Denver teacher.

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

All six types share a common Listing base (title, description, media, provider, pricing, policies, taxonomy, `supply_type`, `performance_country`) with type-specific extensions.

- **LST-1. Recurring Class** — repeats on a rule (RRULE), generates Occurrences, per-occurrence capacity, teacher assignment, room assignment, in-person / online / hybrid.
- **LST-2. Workshop / Event** — one-off or short series; includes sound baths, kirtan, satsang, breathwork journeys, ice baths, cacao ceremonies, masterclasses.
- **LST-3. Course** — fixed multi-session programme with an enrolled cohort, start/end dates, attendance tracking, optional make-up policy.
- **LST-4. Retreat** — location (may be a Venue or free-text), date ranges with multiple departures, **room/occupancy types with independent inventory and pricing** (shared, private, single supplement), inclusions/exclusions, itinerary, what-to-bring, arrival/transfer info, deposit + balance schedule, min/max participants, cancellation ladder, travel insurance prompt.
- **LST-5. Teacher Training & Continuing Education** — hours (200/300/500/CE), registry accreditation, modules, contact hours with lead teacher, prerequisites, application/screening step, cohort caps, instalment plans, accommodation add-ons, online/in-person/hybrid delivery.
- **LST-6. Private Session (1:1)** — availability calendar, duration options, in-person at venue / at client's location / online, travel radius and surcharge.
- **LST-7. On-Demand Content** — video/audio upload, chaptering, duration, level, style, free or paid, pack/subscription bundling, DRM-lite (signed URLs, no public CDN paths).
- **LST-8. Venue listing** (B2B, advertising-only for all domiciles including US) — capacity, rooms, accommodation, catering, dates available, day-rate range. The organiser contacts the venue directly (BKG-20); we take no fee and observe no outcome (PAY-17a).
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
- **LST-14. NEW.** **Indicative pricing on advertising-only listings.** A non-payable provider publishes a price **range**, not a price — it drives SRCH-4 filtering, SRCH-10 comparison and the retreat discovery experience. Stored in the provider's own currency per DM-4, displayed converted to the viewer's locale per LOC-7, and **labelled as an indicative range set by the provider, subject to change, confirmed directly with them**.
  - Per PAY-17a we must never present it as a transaction value, confirm it, reconcile it against what the provider actually charged, or treat it as consideration we know. A range rather than an exact figure is the deliberate expression of that.
  - **Never denominated in USD by default** — a Berlin studio's price is in EUR whether or not we can settle it.

### 7.5 Scheduling Engine (SCH)

- **SCH-1.** RRULE-based recurrence with exceptions (EXDATE), holiday calendars per country, and seasonal schedule swaps.
- **SCH-2.** Occurrence-level override of teacher, room, capacity, price, and status without touching the parent Listing.
- **SCH-3.** **Substitute teacher flow:** assign a sub, notify booked students, update the Occurrence, and reflect the substitution in reviews attribution.
- **SCH-4.** Room/resource conflict detection across a studio's schedule.
- **SCH-5.** Timezone correctness across DST boundaries. Automated test suite covering DST transitions in every indexed country, including Australia's Southern Hemisphere schedule and its state-by-state DST variation.
- **SCH-6.** Capacity, waitlist size limits, and optional **spot/mat selection** with a room map.
- **SCH-7.** Booking windows: open X days ahead, close Y minutes before start, late-booking cutoff, early-bird windows.
- **SCH-8.** Bulk schedule publishing for a term/season.
- **SCH-9.** Occurrence lifecycle: scheduled → in-progress → completed → (cancelled | no-show-resolved). Completion triggers review eligibility (REV-1).
- **SCH-10. NEW.** Capacity on advertising-only occurrences is **advisory, not enforced** — we do not hold the source of truth. Display "limited availability" style language, never a hard seat count, and never decrement.

### 7.6 Search & Discovery (SRCH)

- **SRCH-1.** Unified search across all listing types and providers, with type filters.
- **SRCH-2.** **Three search modes, all first-class:**
  - **Near me / city** — map + list, radius, travel-time isochrone (walk/transit/drive). Default radius tuned to ~15 minutes travel.
  - **Online** — timezone-aware, "starting soon," language of instruction, platform.
  - **Destination** — retreats and trainings by country/region/theme/date range/budget, independent of the 50 cities.
- **SRCH-3.** **Time-first search:** "tonight," "tomorrow morning," "this weekend," "available now," plus explicit date/time-range pickers.
- **SRCH-4.** Filters: modality, style, level, price range, currency-aware; language; in-person/online/hybrid; heated/non-heated; duration; teacher gender (where legal); women-only / men-only / LGBTQ+ specific sessions; accessibility (step-free, chair, adaptive); trauma-informed; prenatal/postnatal; kids/family; drop-in available; first-class-free; pack/membership accepted; verified-credential-only; rating threshold; distance; amenities.
  - Two **distinct** booking-mode filters, which must not be conflated in copy or in code:
    - **"Bookable on site"** — excludes advertising-only listings (PAY-17). Includes request-to-book.
    - **"Instant book"** — excludes both advertising-only *and* request-to-book listings (BKG-1). A strict subset of the above.
- **SRCH-5.** Retreat/YTT-specific filters: date range, duration (nights), total price, accommodation type, food (vegan/vegetarian/gluten-free), registry accreditation, hours (200/300/500), solo-traveller-friendly, alcohol-free, silent, family-friendly, deposit amount, instalments available.
- **SRCH-6.** **Natural-language search.** Free-text queries resolved to structured filters. Must degrade gracefully to keyword search. Query→filter mapping logged for evaluation.
- **SRCH-7.** Map view with clustering, draw-to-search, and synchronised list.
- **SRCH-8.** Autosuggest across cities, neighbourhoods, studios, teachers, styles, and retreat destinations, with typo tolerance and accent/diacritic-insensitive matching.
- **SRCH-9.** Saved searches with email/web-push alerts.
- **SRCH-10.** Comparison view: up to 4 retreats or trainings side by side on price, duration, inclusions, accreditation, rating. **Mixed bookable/advertising-only comparison must work** — this is a common real query.
- **SRCH-11.** Multilingual search: query in any supported language returns results across languages, with translated listing content (MT clearly labelled).
- **SRCH-12.** Zero-result handling: always return an actionable fallback (widen radius, nearest cities, online alternatives, notify-me).
- **SRCH-13.** Search performance: p95 < 400 ms server-side for filtered queries at 500k listings.
- **SRCH-14.** **Ranking signals:** relevance, distance, availability, verification tier, review quality and recency, profile completeness, booking conversion, freshness/`last_verified_at`, response rate, cancellation rate. Ranking is a versioned, testable service with offline evaluation.
  - **Behavioural signals are unavailable for advertising-only listings.** Booking conversion, response rate and cancellation rate do not exist for them (MSG-3, ANL-2). The ranker must degrade to the static signals — verification tier, profile completeness, freshness, historical reviews — rather than scoring a missing signal as zero, which would silently compound the SRCH-16 demotion into a much harsher one than the stated 15–20%. **Test for this explicitly.**
  - **Paid placement is not implemented in v1** (Decision #4 resolved: no). The ranking service must nonetheless expose the disclosure surface required by COMP-9, and the architecture must not preclude adding a labelled, rank-capped paid slot later.
- **SRCH-15.** Stale-suppression: any provider or occurrence failing liveness checks is demoted, then unpublished (ING-9).
- **SRCH-16. NEW.** **Transactability as a ranking signal, not a filter (resolves Open Decision #13).** Advertising-only listings are eligible for every result set and are never hard-excluded except by the two explicit booking-mode filters in SRCH-4 ("Bookable on site" and "Instant book"), both of which the user must opt into.
  - **Demotion factor: a fixed 15–20% score multiplier**, applied uniformly. Set as a single config value (ADM-5), versioned, and A/B tested from launch within that band (ANL-4).
  - It is deliberately modest. Over-demoting empties 30 city pages and destroys the index thesis; under-demoting depresses GMV in mixed result sets.
  - **Disclosure obligation.** This is a commercial ranking parameter applied to EU and UK providers and **must be published in the ranking-parameters statement required by EU P2B (COMP-9)**, in plain language, before launch. A fixed, stated percentage is far easier to disclose defensibly than a learned factor — which is part of why it was chosen.
  - **Note the measurement constraint.** With conversion tracking removed from advertising-only listings (PAY-17a, ANL-2), the A/B test can only measure the effect on *transactable* GMV and on click-through, not on whether demoted listings would have converted. Tune within the band on those signals; do not wait for data that will never arrive.

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
- **BKG-15.** **Corporate / group booking** enquiry and checkout, **transactable listings only**: multi-seat, invoice payment (net terms), purchase order reference, consolidated billing.
- **BKG-16.** Booking confirmation with calendar file (.ics), map, arrival instructions, what-to-bring, and cancellation terms.
- **BKG-17.** **Check-in:** QR code on the booking, scannable from the provider's mobile browser (WEB-4); manual check-in list; attendance marking that drives no-show handling and review eligibility.
- **BKG-18.** Booking states: `pending → confirmed → attended | no_show | cancelled_by_user | cancelled_by_provider | refunded | disputed`. All transitions audit-logged and idempotent.
- **BKG-19.** Overbooking protection under concurrency: capacity decrements must be transactional. Load-test to 500 concurrent bookings on a 20-capacity occurrence.
- **BKG-20. NEW — Direct-contact flow for advertising-only listings.** Constrained by PAY-17a. The listing displays the provider's own contact details and booking link directly. Optionally the user may send a message that is **forwarded** to the provider — a contact form, not a managed thread:
  - No acknowledgement implying we are handling the request, no expected-response-time promise, no SLA.
  - **No conversion tracking.** We record that an outbound contact occurred (for DASH-7 and ANL-2 impression reporting) and nothing about what happened next. We do not ask, do not follow up, and do not reconcile.
  - No structured booking fields that imply we are taking a reservation — dates and party size may be included as free text in the user's message, but nothing is held, reserved or confirmed.
  - Copy must make unambiguous that the user is contacting the provider and the platform is not party to whatever follows (WVR-8, COMP-7).
  - **Do not "improve" this into a managed enquiry pipeline.** Response SLAs, conversion tracking and lead scoring are all facilitation signals that re-open DAC7, the UK rules and the SERR (PAY-12).
- **BKG-21. NEW — Non-US buyer checkout parity.** A buyer in any country must complete checkout with no additional friction: local presentment currency, 3DS2 where their issuer requires it (PAY-16), locale-correct address and phone formats, and no US-centric field validation (no mandatory ZIP-code format, no state dropdown). Test explicitly with non-US cards from each of the top 10 buyer countries.

### 7.8 Payments, Payouts & Tax (PAY)

> **Structural position for v1.2.** The two sides of the marketplace are decoupled.
> **Supply side (who we can pay): United States only.** Money moves only to US-domiciled Connect accounts (PAY-2).
> **Demand side (who can buy): depends on the inventory type, not on the buyer.** Anyone anywhere may buy **US-held in-person** inventory. Only **US buyers** may buy **online or on-demand** inventory (PAY-11a).
> Tax follows neither the payee nor the buyer's nationality — it follows **place of supply**, which differs by `supply_type`. That single fact produces the asymmetry above. See PAY-10 and PAY-11; this is the most commonly misread part of the document and those two requirements should be read before anything else here is designed.

#### Provider and payout

- **PAY-1.** **Stripe is the sole payment provider.** Stripe Connect (Express, with Custom available for edge cases) for onboarding and payouts; Stripe Payments for collection; Stripe Tax for indirect tax; Stripe Billing for instalments and memberships; Stripe Radar for fraud.
  - Retain a thin internal payment-orchestration interface so a second provider — or a non-US payout rail — can be added later without touching booking logic. Single implementation for v1 (NG-6).
- **PAY-2.** **US-only payout eligibility — hard gate.** An Organisation may receive funds only with a **US Stripe Connect account**: US legal entity or US-resident individual, US bank account, and US TIN (SSN or EIN). Onboarding validates all three before any listing becomes `bookable` (DM-7). There is no manual override, no exception queue, and no alternative rail (NG-6).
- **PAY-3.** **Payout management:** Connect KYC/AML onboarding, payout schedules (daily/weekly/monthly), minimum thresholds, statement descriptors, failed-payout retry, and a provider-facing ledger. Single country and single currency throughout.
- **PAY-4.** **Connect account health monitoring.** A Connect account can be restricted or disabled by Stripe after onboarding (verification lapse, risk review, document expiry). On any such webhook, the Organisation's listings must transition to `enquiry_only` within minutes, existing confirmed bookings must be honoured, and the provider must be notified with a specific remediation path. A silent failure here charges buyers for services that cannot be paid out.

#### Commission

- **PAY-5.** **Commission rates (resolves Open Decision #2).** Deducted as Stripe `application_fee` at capture:
  - **High-ticket — 12%.** Retreats, teacher trainings, continuing education, immersions.
  - **High-frequency — 5%.** Drop-in classes, workshops, courses, private sessions, online live, on-demand, packs, memberships.
  - Rate is resolved from the listing type at time of purchase and **stored immutably on the booking**. Later rate changes never retroactively alter a settled transaction.
  - Per-Organisation override available in the admin console (ADM-6), audit-logged, with a documented approval path. Overrides are for commercial negotiation, not for fixing bugs.
- **PAY-6.** **No provider subscription tier in v1 (resolves Open Decision #3).** Commission is the sole provider-side revenue line. Stripe Billing is used for *buyer-facing* recurring charges (memberships, instalments) only. No provider feature gating, no provider dunning, no free-vs-paid product surface. Architecture must not preclude adding a tier (NG-5a).

#### Money movement

- **PAY-7.** **Split payments** via Connect. Platform commission deducted at capture; provider net settled to their USD balance.
- **PAY-8.** **Escrow / delayed release for retreats and trainings (resolves Open Decision #5).** Implemented via separate charges and transfers. Funds from a retreat or training booking are held on the platform balance from capture and **released in full on the event start date**.
  - Applies to all high-ticket inventory regardless of AOV.
  - Deposits (BKG-8) and instalments (BKG-9) are each held to the same release point, not released as collected.
  - Provider-facing ledger must show held vs available balance with the scheduled release date, from the moment of first capture. Organisers plan cash flow around this; hiding it will cost supply.
  - On provider cancellation before release, held funds fund the refund directly with no clawback exposure. This is the entire point of the mechanism.
- **PAY-9.** **Refunds** (full/partial), credits, and platform-funded goodwill refunds, each with distinct accounting treatment. Commission is refunded proportionally on provider-fault cancellations and retained on buyer-fault cancellations, per the provider agreement.

#### Tax — two tracks

> Indirect tax is determined by **place of supply**, not by where the provider is domiciled and not by where the money settles. Because every *payable* provider is US-domiciled while buyers are global, `supply_type` (DM-8) plus `performance_country` are the determinants. Every bookable listing falls into exactly one track.

- **PAY-10.** **Track A — in-person supply. Taxed where the service is physically performed.**
  - Covers: in-person classes, workshops, courses, private sessions, retreats and teacher trainings held at a physical location.
  - **For services performed in the United States — all in-person inventory in the 20 transactional cities, plus US-held retreats and trainings — the place of supply is the US regardless of buyer country.** A buyer in London, Munich or Sydney purchasing a Brooklyn workshop or a Denver training creates **no** foreign VAT or GST obligation.
  - **The unqualified claim above holds for instruction.** For a retreat bundling accommodation, meals and transport it is very likely but not confirmed — see the counsel note below. Do not use a bundled retreat as the worked example when explaining this rule internally.
  - Applicable tax: **US sales tax under marketplace facilitator rules**, where the platform is the deemed collector in most states. Registration and threshold monitoring via Stripe Tax across ~45 states plus DC. Note that many states do not tax instruction or fitness services at all; the engine must handle the exempt case cleanly rather than defaulting to a rate.
  - Retreats bundling accommodation and food may attract **state and local occupancy or lodging taxes** distinct from sales tax. Flag for Finance; treat as a bundled-supply question per state.
  - **Edge case — US provider, non-US retreat venue.** A US-domiciled organiser running a retreat physically held in, for example, Portugal has a place of supply in Portugal and a potential local VAT registration obligation. This is **out of scope for v1**: such listings are forced to `enquiry_only` by configuration pending legal sign-off, notwithstanding the organiser's payability (§4.3, Open Decision #16).
  - **Counsel note on the "no foreign tax" claim.** "In-person supply performed in the US creates no foreign VAT/GST obligation" is correct for the *instruction* service. It is a weaker claim for a retreat that bundles accommodation, transport and meals, which can engage tour-operator or margin-scheme treatment in the buyer's jurisdiction in some countries. The doc flags US lodging tax; the foreign-side analysis for bundled US-held retreats sold to EU/UK consumers should be confirmed rather than assumed.
- **PAY-11.** **Track B — online live and on-demand supply. Taxed at the buyer's location.**
  - Covers: live-streamed classes, courses and privates delivered online, and all on-demand content (`supply_type` = `online_live` or `on_demand`).
  - **Build scope in v1: US buyers only.** Treatment follows Track A — US marketplace facilitator rules, with the additional complexity that digital-goods taxability varies by state. **Non-US buyers cannot purchase Track B inventory at all** (PAY-11a); they see it as advertising-only.
  - **Customer location determination is still required**, because it is what enforces the restriction. Capture billing address, IP geolocation, card issuer country and SIM country code where available; store with the transaction. Where evidence conflicts or indicates a non-US buyer, **block the purchase** and fall back to the advertising-only presentation. Do not guess.
  - **Reference only — not build scope in v1.** The following applies if and when a region is enabled under PAY-11a, and is recorded so that the eventual work is scoped correctly rather than rediscovered:
    - **EU** — registration under the **non-Union OSS** scheme. **No threshold** for a non-EU established seller; liability begins at the first sale. Quarterly OSS returns, per-member-state rate tables, and the Art. 24b **two-non-contradictory-pieces** customer-location presumption. Note that presumption applies squarely to *electronically supplied* services (on-demand video); a live human-taught streamed class is generally **not** electronically supplied and falls under the virtual-events rule, which does not carry it.
    - **UK** — UK VAT registration. Threshold for a **non-established taxable person is zero**; liability begins at the first sale. Quarterly MTD-compliant returns.
    - **Australia** — GST on imported services, A$75,000 registration threshold, with electronic distribution platform rules making the platform the deemed supplier.
  - **PAY-11a. Per-region enablement flag.** Non-US sale of Track B inventory is governed by a per-region configuration flag (ADM-5), toggleable with no deploy (NG-5a). Track B is the **only** part of the platform that creates a foreign tax registration obligation, while representing roughly 5% of forecast GMV.
    - **Resolved for v1 (Open Decision #12): the US is the only enabled region. Every other region ships disabled and stays disabled.** We take **no** foreign indirect-tax registration in v1. A non-US buyer sees online and on-demand inventory as **advertising-only** (PAY-17), exactly as they would a non-payable provider — the fallback path already exists and no new UX is required.
    - Rationale: Stripe Tax Complete can perform the registrations and filings operationally, but **the legal liability, the registration number and the audit exposure remain ours**. Stripe is not a merchant of record under Connect. For roughly 5% of forecast GMV that trade is not worth taking. (See Decision #17 — Stripe Managed Payments would change this analysis.)
    - **Track B is the largest remaining source of foreign tax registration obligation, but not the only one** — PAY-10's non-US retreat venue case carries a destination-country VAT obligation independently, deferred rather than eliminated by Decision #16.
    - **The flag must still be built.** It is the mechanism by which a region is later switched on without a deploy (NG-5a), and it is per-region rather than binary because the eventual sequence will be one jurisdiction at a time.
    - **"Region" is not just EU/UK/AU.** Non-resident digital-services VAT/GST regimes with nil or very low thresholds also exist in Canada, Norway, Switzerland, Japan, South Korea, Singapore, New Zealand, Türkiye, India (OIDAR) and many others. Any future enablement is a per-jurisdiction decision, never a bulk one.
    - Enabling a region without a completed registration is a compliance failure, not a growth experiment.
- **PAY-12.** **Provider tax reporting — 1099-K only.** Form **1099-K** via Stripe, with W-9 collection at Connect onboarding and TIN matching. No other reporting regime is implemented.
  - **The position (Decision #15): DAC7, UK digital-platform reporting and the Australian SERR do not apply, because for every non-US provider we are an advertiser rather than a platform through which the transaction is made.** The naive rationale — "there are no non-US payees" — is **wrong** and must not be used: DAC7 turns on *seller residence* and knowability of consideration, and the SERR turns on *supplies connected with Australia through an EDP*. Neither test asks who receives the payout.
  - The position rests entirely on **PAY-17a** and on the two v1 scope decisions that support it:
    - **PAY-17a advertising-only constraints** — no fee, no affiliate revenue, no contact masking, no conversion tracking, no held consideration. This is what puts us inside the advertising carve-out that all three regimes share.
    - **Decision #12 (no Track B abroad)** — we make **no online or on-demand sales** to EU, UK or Australian consumers. This closes the SERR's "supplies connected with Australia" limb, which turns on inbound intangible consumer supplies. This was the weakest of the three exclusions and is now closed by scope rather than argument. *Note the limit of the claim:* non-US consumers **do** still buy US-held in-person inventory, which is a supply performed in the US and connected with the US, not with their own jurisdiction.
    - **Decision #16 (no non-US retreat venues)** — no supply is performed in a reporting jurisdiction.
  - **Standing rule:** any proposal that breaches a PAY-17a constraint, enables a Track B region, or adds a non-US payout rail (NG-6) **re-opens all three regimes simultaneously** and must go to Legal before it goes to a sprint. Record it against this requirement.
  - Recommended regardless: a one-off written memo from international indirect-tax counsel confirming the advertising carve-out reading, held on file. Cheaper than three jurisdiction-specific opinions and materially better than an undocumented internal view.
- **PAY-13.** **Invoices and receipts.** US buyers receive US sales-tax-compliant receipts. **Non-US buyers of Track A inventory** — the only foreign purchases possible in v1 — receive a US receipt, localised per LOC-2, with a plain-language note that no local VAT or GST applies because the service is performed in the United States. This note will generate support questions and should be written once, well, with a linked help-centre explanation. Provider-facing statements in USD. *(Track B foreign receipts are out of scope; see PAY-11a.)*

#### Ledger, risk and compliance

- **PAY-14.** **Full double-entry ledger**, independent of Stripe's reporting. Every cent traceable: booking → charge → commission → tax (by track and jurisdiction) → held balance → release → payout → refund. Finance-grade reconciliation exports and automated Stripe balance reconciliation. Held-vs-released balances from PAY-8 are first-class ledger states, not a reporting overlay.
- **PAY-15.** **PCI-DSS SAQ-A scope only.** Stripe Elements / Checkout; no card data touches our servers. Tokenised card-on-file for instalments and memberships.
- **PAY-16.** **SCA / 3-D Secure 2 — support required, not legally mandated.**
  - **Correction of a common misreading:** PSD2/UK SCA applies to transactions where **both** the payer's and the payee's payment service providers are in the EEA/UK. With a US acquirer these are **one-leg-out transactions and are outside the scope of the SCA mandate.** We are not legally obliged to apply SCA to EU/UK cardholders.
  - **This changes nothing operationally.** EEA and UK issuers make their own risk assessment on one-leg transactions and routinely decline or soft-decline unauthenticated ones, bearing Art. 73 liability if they do not. In practice a material share of EU/UK cards will require authentication regardless.
  - **Requirement:** full 3DS2 support, with request strategy configured per issuer-country performance rather than as a blanket mandate. Off-session exemptions configured for recurring charges (BKG-9, BKG-11).
  - Expect materially higher 3DS challenge rates and step-up abandonment on non-US cards than on US ones. Instrument authorisation rate and 3DS failure rate **by issuer country** (ANL-2) from day one; this is the leading indicator of whether unrestricted buyer geography is actually converting.
  - Getting the legal framing wrong in either direction is expensive: treating SCA as mandatory over-challenges and depresses conversion; treating it as irrelevant produces avoidable declines.
- **PAY-17.** **Advertising-only listing mode** *(this was "enquiry-only listing mode" in v1.1, as PAY-15; the rename is deliberate — see PAY-17a)*. A listing is advertising-only if it fails **either** condition in §4.3 — it is not payable (fails the PAY-2 gate), **or** we have no live registered tax treatment for that supply (PAY-10, PAY-11a). In practice this covers:
  - all listings owned by non-US-domiciled Organisations, wherever they appear — **including in the 20 US cities**;
  - all in-person retreats and trainings held outside the US, whoever owns them;
  - online and on-demand listings shown to buyers in a region where the Track B flag is off (PAY-11a) — note this is **per buyer**, so the same listing may be bookable to one visitor and advertising-only to another;
  - all venue listings, regardless of domicile (LST-8).

  The listing is fully indexed, discoverable, ranked (SRCH-16) and comparable (SRCH-10). The user contacts the provider directly (BKG-20); the transaction happens entirely off-platform.

- **PAY-17a. NEW — Advertising-only constraints (resolves Open Decision #15). Non-negotiable.**

  > **Why this exists.** DAC7 (EU), the UK digital-platform reporting rules and the Australian SERR all turn on whether we are a **platform through which the transaction is made** rather than a service that **advertises** a supply. All three carve out operators that only list, advertise or create awareness without intervening. DAC7 adds a second limb: the consideration must be *known or reasonably knowable* by us. The business decision (Decision #15) is that we will not build seller due diligence, TIN collection and annual structured filings for providers we have no commercial relationship with. That decision is only defensible if advertising-only listings are genuinely classified advertising. **Every constraint below is load-bearing for that position. Adding any one of these features back re-opens all three reporting regimes.**

  On an advertising-only listing the platform must **not**:
  - **Charge any fee of any kind.** No commission, no referral fee, no per-lead charge, no featured placement, no subscription. Ever. This permanently closes the paid-lead-gen option.
  - **Take affiliate or referral revenue.** INT-9 affiliate tracking is scoped to transactable listings only. Being paid on an off-platform booking is the single clearest way to become a facilitator.
  - **Mask or broker contact details.** MSG-2 masking does not apply. The provider's own email, phone and website are shown directly on the listing. Masking is intervention.
  - **Know or record the consideration.** No conversion tracking, no "did this convert and for how much", no reconciliation against the provider's bookings, no post-contact outcome survey that captures a value.
  - **Hold availability, capacity, or a booking record.** Schedules are advertised (SCH-10, advisory only); nothing is reserved, decremented or confirmed.
  - **Present prices as transactable.** LST-14 prices are a provider-supplied **indicative range** for search filtering, clearly labelled as such, never confirmed and never treated as a transaction value.

  **Accepted cost, stated plainly:** removing conversion tracking means **we cannot measure whether the 30 non-US cities work.** Impressions, profile views and outbound contact clicks are the only available signals (DASH-7, ANL-2). There is no funnel to the other side. Anyone proposing to close that measurement gap is proposing to re-enter DAC7 — route it to Legal, not to Analytics.

  Enquiry-only listings additionally:
  - are excluded from GMV, commission and the payments ledger;
  - are visually distinguished only by their CTA, never by a warning or downgrade treatment (PRO-13);
  - retain full review history where bookings previously existed, but generate no new verified reviews (REV-1 is unchanged and non-negotiable).
- **PAY-18. NEW — Sanctions and export screening.** With a US merchant of record and unrestricted global buyers, OFAC and sanctions screening applies to the buyer. Screen at checkout, block sanctioned jurisdictions and denied parties, and log every decision. Stripe Radar covers part of this; the gap between Radar's fraud rules and an actual sanctions obligation must be closed explicitly and reviewed by counsel. Also block enquiry submission from sanctioned jurisdictions.

#### Buyer-side methods and disputes

*Both requirements below were present in v1.1 (as PAY-2 and PAY-8) and are restored here with new IDs after the section restructure.*

- **PAY-19. Buyer payment methods** *(was v1.1 PAY-2).* All via Stripe. Availability is driven by **buyer geo and presentment currency**, resolved server-side and reflected in the checkout UI before the user commits.
  - Universal: cards, Apple Pay, Google Pay, Link.
  - US buyers: ACH Direct Debit.
  - Klarna where supported for the buyer's market.
  - **SEPA Direct Debit, Bacs Direct Debit and BECS Direct Debit are removed in v1.2** — all three are local bank-debit schemes requiring local settlement, which a USD-settling US account cannot provide. iDEAL and Bancontact to be verified against a USD-settling US account during build; treat as optional, never as assumed (Appendix B).
  - Method availability is configuration (ADM-5, NG-5a), not code. Stripe method support changes; re-verify before launch and on a scheduled cadence after.
- **PAY-20. Chargeback and dispute handling** *(was v1.1 PAY-8).*
  - **Evidence auto-assembly** on dispute notification: signed waiver (WVR-2), booking terms and cancellation policy as shown at purchase (BKG-6), check-in / attendance record (BKG-17), message thread (MSG-1), and the listing snapshot at time of booking. Assembled automatically, reviewable by Ops before submission.
  - Submitted through the Stripe dispute API within the response window, with escalation if the window is at risk.
  - Provider notified on receipt, on submission, and on outcome.
  - **Liability assignment rules** encoded in the provider agreement and enforced in the ledger: provider-fault disputes are recovered against the provider balance; platform-fault and goodwill outcomes are absorbed by the platform. Every assignment is audit-logged and reconcilable (PAY-14).
  - Interaction with escrow: for high-ticket bookings still in the PAY-8 hold, a dispute is funded from held balance with no clawback exposure. **After** release, normal recovery rules apply. The gap between escrow release and the end of the card-network dispute window is a real, quantifiable exposure — Finance to model it and set reserve policy accordingly.
  - Dispute rate by issuer country and by listing type is a tracked KPI (ANL-2). Non-US cards and high-AOV retreats are the two expected concentrations.
  - **Refund, cancellation, chargeback and dispute paths must be tested per buyer region before launch**, with non-US cards. Carried forward from the former §12 global launch gate.

### 7.9 Waivers, Health Intake & Liability (WVR)

- **WVR-1.** **Digital liability waiver signed at booking**, before the session. Legally distinct templates per **US state** — with all bookable inventory US-held and US-sold, state-level variation is now the *only* case, and the EU/UK/AU template set required in v1.1 is out of scope. Note that non-US *consumers* still book US inventory, so waiver enforceability against a foreign consumer, and the interaction with their non-waivable consumer rights (COMP-10), needs counsel input. Provider may add their own clauses.
  - **Every waiver template must be approved by counsel for its jurisdiction before that jurisdiction's inventory becomes bookable.** Carried forward from the former §12 global launch gate; with gates removed this is now a standing requirement rather than a release checkpoint, and is not satisfied by a template that has merely been drafted.
- **WVR-2.** Waivers are immutable, versioned, timestamped, IP-logged, and retrievable as PDF by both parties. Re-signature required when a provider's waiver version changes.
- **WVR-3.** Optional **health intake / PAR-Q** per listing, mandatory for prenatal, therapeutic, hot, aerial, breathwork, and ice exposure.
- **WVR-4.** Health data is special-category personal data under GDPR/UK GDPR. **This applies to EU/UK residents booking US inventory** — extraterritorial reach follows the data subject, not the service location. Encrypt at rest with separate key scope, restrict access to the specific provider for the specific booking, audit every read, and apply short retention.
- **WVR-5.** Minor bookings require guardian consent; under-16 accounts prohibited (COMP-6).
- **WVR-6.** Emergency contact capture for retreats and trainings.
- **WVR-7.** Contraindication warnings surfaced pre-booking for high-risk formats (breathwork/hyperventilation protocols, ice exposure, hot yoga, inversions, aerial).
- **WVR-8. NEW.** No waiver is collected on an enquiry (BKG-20) — there is no booking and we are not party to the eventual contract. The enquiry confirmation must state this plainly so a user does not believe they are covered by platform terms they never agreed to.

### 7.10 Reviews & Ratings (REV)

- **REV-1.** **Verified-booking reviews only.** A review requires a booking in `attended` state. This is a hard constraint, not a setting — and it is **not relaxed for advertising-only listings**. Accepting unverified reviews to fill the gap in 30 cities would destroy the trust differentiator that justifies the entire index.
- **REV-2.** Review window opens 24 h after the occurrence, closes at 30 days.
- **REV-3.** **Multi-dimensional ratings by listing type:**
  - *Class:* teaching quality, atmosphere, facilities, value, accuracy of description
  - *Retreat:* accommodation, food, teaching, location, group experience, value, accuracy
  - *Training:* curriculum quality, lead teacher contact hours, organisation, support, career value, accuracy
- **REV-4.** Free-text with minimum length, photo upload (moderated), and structured tags.
- **REV-5.** **Attribution:** reviews attach to the teacher, the studio, and the listing independently, and reflect substitutions (SCH-3). A teacher's rating travels with them across studios — **and across the transactability boundary**. A US-payable teacher's rating follows them if they later teach at an advertising-only European studio.
- **REV-6.** Provider right of reply (one public response per review), **available to advertising-only providers** on their historical reviews.
- **REV-7.** Reviews are immutable after a 24-hour edit window; deletion only via T&S process with reason logged.
- **REV-8.** Aggregate ratings display count and distribution, never a bare star. Suppress aggregates below a minimum sample (n=3) to avoid misleading `AggregateRating` markup.
- **REV-9.** Fraud controls: velocity limits, device/IP clustering, review-for-discount detection, sentiment/text-reuse analysis, provider-linked account detection.
- **REV-10.** Recency weighting in ranking; decay old reviews.
- **REV-11.** Post-booking prompt via email and web push, one reminder maximum.
- **REV-12.** Reviews are translated for display (MT labelled) with the original always accessible.

### 7.11 Messaging & Notifications (MSG)

- **MSG-1.** In-platform messaging between practitioner and provider, threaded per booking. **Transactable listings only** — advertising-only listings use BKG-20 forwarding, not a thread (PAY-17a).
- **MSG-2.** **Contact-information and outbound-link policy (resolves Open Decision #6).**
  - Contact-information masking pre-booking, with post-booking release.
  - **On transactable listings, no outbound link to a competing booking path is rendered** — no "book on our site," no third-party booking URL, no price shown alongside an external link. This is a term of the provider agreement, not merely a UI rule.
  - **A provider's own website, social profiles and PRO-7 link-in-bio links remain permitted**, because stripping them would destroy the primary supply-acquisition feature. The restriction targets competing *checkout*, not presence. Design and Legal to agree the precise boundary; the rule must be stated plainly in the provider agreement rather than enforced by surprise.
  - **Enquiry-only listings are exempt entirely, and contact masking does not apply to them at all.** Their own email, phone, website and booking link are displayed directly. Off-platform booking is the intended and only outcome, and non-intervention is a legal requirement, not a UX preference (PAY-17a).
  - Anti-circumvention detection on phone numbers, emails and external URLs in messages applies **only to transactable listings**: **log and rate-limit, do not hard-block.** Over-blocking damages provider trust.
- **MSG-3.** Enquiry flow **for transactable listings only** — retreats, trainings and private sessions owned by US providers, where request-to-book or a pre-purchase question applies. **Venue listings are excluded**: LST-8 makes them non-transactional for every domicile, so they run under BKG-20 advertising-only rules with no SLA and no response-rate tracking. Provider response-time SLA displayed publicly, and response rate feeds ranking (SRCH-14).
  - **Advertising-only listings do not use this flow.** They use BKG-20 direct contact, with no SLA, no response-rate tracking and no managed thread (PAY-17a). Consequence: advertising-only providers generate **no behavioural quality signal at all** — ranking for them rests entirely on credentials (CRD-1), profile completeness (PRO-9), freshness (ING-9) and historical reviews. Accepted trade-off.
- **MSG-4.** Notification channels: email, **web push** (desktop and mobile browsers), SMS (transactional only, opt-in).
- **MSG-5.** Transactional notifications: booking confirmed, reminder (24 h and 2 h configurable), cancellation, substitution, waitlist promotion, payment due/failed, balance due, **escrow release**, review request, refund issued. On transactable listings only, plus enquiry received/answered where MSG-3 applies. **No notification on an advertising-only listing implies we are tracking the exchange** — the user receives a plain "your message was forwarded" and nothing further.
- **MSG-6.** Marketing notifications: strictly opt-in, granular preference centre, one-click unsubscribe, per-channel and per-topic. GDPR/PECR/CAN-SPAM compliant.
- **MSG-7.** Provider-to-student broadcast (to their own students only) with rate limits and abuse monitoring. **Transactable providers only** — the audience is derived from bookings (DASH-4), which advertising-only providers do not generate.
- **MSG-8.** All templates localised into the seven launch languages.

### 7.12 Provider Dashboard (DASH)

- **DASH-1.** Onboarding wizard: claim or create → verify identity → **connect Stripe (US only) or confirm advertising-only** → import schedule → publish. Target: **live in under 15 minutes**, resumable. The advertising-only branch must be a shorter, complete path — not a dead end with a "coming soon" message.
- **DASH-2.** Schedule manager: calendar and list views, drag-to-reschedule, bulk edit, conflict warnings.
- **DASH-3.** Bookings manager, **transactable providers only**: roster per occurrence, check-in, no-show marking, manual booking entry (for walk-ins/cash), comp/free-place issuance.
  - **Advertising-only providers get no bookings or enquiry manager.** No queue, no status tracking, no response templates, no SLA timer — all of those are the managed pipeline PAY-17a forbids. Messages sent via BKG-20 are forwarded to their own email and are theirs to handle off-platform.
- **DASH-4.** **Student CRM, transactable providers only:** contact list, booking history, packs/memberships held, notes (private), injuries flagged from intake, tags, segments, export. Built from bookings, which advertising-only providers do not have. Hidden, not empty, for them (DASH-8 pattern).
- **DASH-5.** Financials: **held vs available balance with scheduled release dates (PAY-8)**, upcoming and historical payouts, commission breakdown, refunds, 1099-K and tax documents, downloadable statements. US providers only; hidden entirely for advertising-only providers rather than shown empty.
- ~~**DASH-6.** Provider performance analytics.~~ **Removed in v1.1.** Underlying instrumentation (ANL-1) still required.
- **DASH-7.** **Public-page performance panel** — impressions, profile views and outbound contact clicks, including *before* they claim (PAY-17a permits these three metrics and no others). **Retained, and now load-bearing.** For the 30 advertising-only cities this is the *entire* measurable value proposition of claiming — there is no payout to motivate them. If DASH-7 is weak, non-US claim rate collapses and 60% of the index goes stale.
  - **The claim pitch outside the US (resolves Open Decision #14) is profile ownership and accuracy, not revenue:** this page about you already exists and is being seen; claim it so the details are yours, correct, and managed by you rather than inferred by us. Reach is the secondary argument, future payment support the tertiary one (NG-6). Authenticity is the primary one, and it is also what keeps the index fresh (ING-9) and defensible (ING-7).
- **DASH-8.** Marketing tools, **scoped by transactability**:
  - *All providers:* shareable social cards (auto-generated for next class/retreat), link-in-bio configuration (PRO-7), profile and listing media.
  - *Transactable providers only:* promo code creation (BKG-14), intro offer configuration (BKG-12), pack and membership setup (BKG-11), gift cards (BKG-13). These depend on checkout and must be **hidden, not disabled**, for advertising-only providers — a greyed-out feature list reads as a broken product.
  - **BKG-11 … BKG-15, DASH-3, DASH-4, DASH-5, MSG-1, MSG-7 and INT-9 are all transactable-only by construction** and should be read with this scoping. Where a feature is transactable-only, hide it rather than disabling it.
- **DASH-9.** Team management: invite staff, assign roles, manage teacher roster and affiliations.
- **DASH-10.** Policy management: cancellation policies, waiver customisation, house rules, booking windows.
- **DASH-11.** Full dashboard functionality on mobile web, with check-in and roster optimised for phone use (WEB-4).

### 7.13 Data Ingestion, Seeding & Claim (ING)

The index is seeded by automated agents. This module governs how that data becomes safe, legal, and useful. Under v1.2 it also carries more weight than in v1.1: for 30 of the 50 cities, seeded data *is* the product until a provider claims it, and there is no payout to motivate that claim.

- **ING-1.** Ingestion pipeline: source connectors → normalisation → **entity resolution** → confidence scoring → staging → publish gate.
- **ING-2.** **Entity resolution is the hard problem**, not crawling. Must handle one person across multiple studios, name variants, accented/diacritic variants, shared studio names across cities, and social handle matching. Human-in-the-loop review queue for low-confidence merges. Every merge reversible.
- **ING-3.** **Only durable facts may be auto-published:** name, location, contact, website, social links, styles, stated credentials, opening hours.
- **ING-4.** **Schedules and prices are never auto-published from ingestion.** They come only from provider claim, direct entry, or authorised sync. A stale schedule is worse than no schedule.
- **ING-5.** No third-party images may be copied. Use licensed map/place imagery under its terms, or leave media empty until claim.
- **ING-6.** **Claim flow:** verification by email domain, phone, social handle ownership, or Google Business Profile. Target under 60 seconds. Claim page leads with the profile's traffic stats (DASH-7), not with a sales pitch. **The non-US claim page leads with authenticity and ownership** (Decision #14): this page about you already exists and is being seen — claim it so the details are yours and correct. Reach is the secondary argument. It must not be pitched as lead generation, which is both inaccurate and inconsistent with NG-8.
- **ING-7.** **Pre-claim notification and opt-out.** Before or at publication, attempt notification to the listed party with a one-click "remove me" that works without an account. Under GDPR/UK GDPR Art. 14 this is an obligation for indirectly-collected personal data, not a courtesy — **and it applies in full to the 30 non-US cities, where we index people we cannot pay.** Removal must complete within 72 hours and be permanent (suppression list prevents re-ingestion).
- **ING-8.** Full provenance and audit trail per field: source URL, method, timestamp, agent version.
- **ING-9.** **Freshness enforcement:** `last_verified_at` per record; scheduled liveness checks (website reachable, business open, social active); decay score; automatic demotion then unpublication of stale records. Target: no published record older than 90 days without re-verification. **Non-US records will decay faster** — lower claim rate means fewer self-corrections — so liveness checking must be weighted toward, not away from, advertising-only records.
- **ING-10.** Respect `robots.txt`, rate limits, and source ToS. Maintain a per-source legal register. Do not ingest from sources where prohibition is explicit.
- **ING-11.** User- and provider-facing "suggest an edit" and "report incorrect/closed" flows feeding the Ops queue.
- **ING-12.** Ingestion cost control: crawlers and deterministic parsers do the volume work; model inference is reserved for extraction, normalisation, and disambiguation.

### 7.14 SEO & AEO Architecture (SEO)

The directory — not the blog — is the primary organic asset. These are engineering requirements, not marketing preferences. **With native apps removed and 30 of 50 cities non-transactional, organic search is both the sole acquisition channel and the sole justification for the non-US index. Every requirement in this section is load-bearing.**

- **SEO-1.** **Server-side rendering for every indexable page.** AI crawlers largely do not execute JavaScript; a client-rendered marketplace is invisible to them. Non-negotiable.
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
- **SEO-4.** **Thin-page suppression — promoted to a hard rule in v1.2.** A generated page is `noindex` until it meets a quality threshold (minimum live listings, verified provider present, or unique content). **With Launch Gates removed (former Section 12), this is now the only mechanism preventing thin city pages from being indexed.** It must be automatic, non-overridable by Ops, and enforced at render time — not a batch job. Google's scaled-content-abuse policy targets exactly the pattern this prevents.
- **SEO-4a. NEW.** **Enquiry-only pages must not be systematically thin.** A city page with 60 advertising-only providers and zero bookable ones is a legitimate, useful page and must be indexable on its own merits. The SEO-4 threshold is measured on **content and provider quality, not on transactability.** Do not conflate "we cannot take payment here" with "this page is low value" — that conflation would deindex 60% of the index.
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
- **SEO-15. NEW.** **`Offer` schema honesty.** Enquiry-only listings must not emit `Offer` markup implying a purchasable price with an `availability` of `InStock`. Use price range and appropriate `availability` values, or omit `Offer` and rely on `Event`/`Course` alone. Emitting buyable markup on a non-buyable page is both a structured-data violation and a conversion trap.

### 7.15 Trust, Safety & Moderation (TSF)

- **TSF-1.** Report flows on every profile, listing, review, and message, with categories including **safeguarding and professional misconduct**.
- **TSF-2.** Documented escalation path for misconduct allegations, with legal review, defamation-aware handling, and a defined suspension standard. **This applies identically to advertising-only providers** — we index named individuals in 30 cities where we have no commercial relationship and therefore no contractual leverage, which makes the exposure higher, not lower. Legal to confirm the position for non-contracted listed parties.
- **TSF-3.** Automated content moderation on user-generated text and images, with human review queue and SLA.
- **TSF-4.** Provider suspension and delisting workflow with appeal rights and full audit trail.
- **TSF-5.** Fraud detection: fake listings, payment fraud (Stripe Radar plus platform rules), review manipulation, account takeover, provider impersonation.
- **TSF-6.** Duplicate/impersonation detection at claim time — a claim contest process with evidence submission.
- **TSF-7.** Safeguarding: enhanced verification requirements for providers listing kids' or minors' classes, including DBS (UK) and Working With Children Check (Australia) where applicable.
- **TSF-8.** Public Trust & Safety policy, community guidelines, and transparency reporting.
- **TSF-9. NEW.** **Contact-channel abuse controls.** BKG-20 hands a contact route to an unvetted off-platform party at scale. Rate-limit message submission per user and per IP, screen outbound message content for scams and phishing, and give users a one-click report on the listing itself. On *transactable* listings, additionally monitor provider responses for off-platform payment solicitation.
  - **We do not read or retain provider replies on advertising-only listings** — they never pass through us (PAY-17a). Abuse reporting there is user-initiated against the listing, not against a message we hold. This is a real gap: a bad actor on an advertising-only listing is harder to detect than on a transactable one. Compensate through claim-time verification (ING-6, TSF-6) and freshness checks (ING-9), not through message surveillance.

### 7.16 Admin & Ops Console (ADM)

- **ADM-1.** Record management: search, edit, merge, split, unpublish any entity, with full audit log and rollback.
- **ADM-2.** Verification queues (credentials, insurance, claims, disputed claims) with assignment and SLA tracking.
- **ADM-3.** Moderation queues (reports, reviews, images, messages, enquiries).
- **ADM-4.** Taxonomy management with translations and synonyms.
- **ADM-5.** Feature flags and per-market configuration: payment methods, tax rules and track assignment, **Track B per-region kill switch (PAY-11a)**, languages, commission rates and overrides, live/dark status per city, **payout eligibility by country**.
- **ADM-6.** Financial operations: manual refunds, payout adjustments, **escrow release override with dual approval**, commission overrides, Stripe reconciliation tooling.
- **ADM-7.** Impersonation ("view as provider") for support, consent-gated and audit-logged.
- **ADM-8.** GDPR request handling console: access, rectification, erasure, portability, with SLA timers.
- **ADM-9.** Bulk city tooling: activate a city, generate its pages, set its tax and transactability config, from configuration only.
- **ADM-10. NEW.** **Transactability console.** A single view of every Organisation's payout eligibility, Connect account status, and derived listing state (DM-7), with the ability to force a recompute. When Stripe restricts an account, Ops needs to see the blast radius across that Organisation's listings and upcoming occurrences immediately.

### 7.17 Analytics & Reporting (ANL)

- **ANL-1.** Event pipeline with a governed schema; every funnel step instrumented from search impression to review submission. **For advertising-only listings the funnel ends at the outbound contact event** and must not be extended past it (PAY-17a).
- **ANL-2.** Core marketplace KPIs: GMV, take rate, bookings, conversion by step, liquidity, supply coverage per city, provider activation rate, claim rate, repeat booking rate, cancellation/no-show rate, CAC/LTV by cohort. **Added for v1.2:** **US vs non-US claim rate**, buyer-country distribution of GMV, authorisation rate by issuer country (PAY-16), 3DS challenge/failure rate for non-US cards, and dispute rate by issuer country and listing type (PAY-20).
  - **For advertising-only listings the only permitted metrics are impressions, profile views, and outbound contact clicks.** No conversion, no value, no outcome, no follow-up survey capturing a booking amount. This is a hard boundary set by PAY-17a, not an instrumentation gap to be closed later.
  - **Stated consequence:** there is no way to prove the 30 non-US cities convert. Their value must be argued from reach, brand and eventual market entry (Decision #14), not measured. Anyone who proposes closing this gap is proposing to re-enter DAC7 — route to Legal.
- **ANL-3.** Data quality dashboard: coverage, freshness, verification rate, duplicate rate per city. **Report transactional and advertising-only cities separately** — blending them hides decay in the 30, which is the more likely failure given the weaker claim incentive.
- **ANL-4.** Experimentation platform with server-side assignment. Ranking and pricing changes must be A/B testable, **including the SRCH-16 transactability demotion factor**, which should be under active experimentation from launch.
- **ANL-5.** Consent-aware tracking (GDPR/ePrivacy) — no non-essential tracking before consent in EU/UK.

### 7.18 Integrations (INT)

- **INT-1.** **Schedule import/sync is the highest-leverage supply feature in this document.** Most target providers already run an incumbent system and will not re-key schedules. **This is doubly true for advertising-only providers**, who have even less reason to maintain a second schedule by hand.
  - Read integrations: Mindbody, Momence, WellnessLiving, Arketa, Glofox, Eversports, Punchpass, Acuity, Google Calendar, iCal/ICS feed
  - Generic CSV importer and ICS subscription as universal fallbacks
  - Conflict resolution rules where we hold both synced and native inventory
- **INT-2.** Video conferencing for online classes: Zoom, Google Meet, and a native WebRTC option with auto-generated per-occurrence links.
- **INT-3.** Google Business Profile connection for studios (hours, NAP consistency, review signals).
- **INT-4.** Maps and geocoding (Google Places + a fallback provider); transit and travel-time data.
- **INT-5.** Credential registry lookups (CRD-2).
- **INT-6.** Email and SMS providers; **web push** (VAPID / Web Push Protocol) — no APNs/FCM native integration required.
- **INT-7.** Media pipeline: image and video upload, transcode, adaptive streaming, CDN, WebP/AVIF delivery.
- **INT-8.** **Public API and webhooks** for providers and partners: listings, availability, bookings, and webhooks on booking lifecycle. Rate-limited, key-managed, documented. **No enquiry-lifecycle events on advertising-only listings** — exposing tracked enquiry states through an API is the same facilitation signal PAY-17a removes from the product.
- **INT-9.** Affiliate tracking system with per-partner attribution and commission — retreat marketplaces are heavily affiliate-driven and this is a real distribution channel. **Scoped to transactable listings only (PAY-17a).** Affiliate revenue on an advertising-only listing would make us a paid facilitator of an off-platform transaction and re-open DAC7, the UK rules and the SERR. Enforce at the tracking layer, not by policy.
- **INT-10.** Travel insurance partner referral on retreat checkout.
- **INT-11.** Stripe (PAY-1) — the only payments integration.

### 7.19 Responsive Web (WEB)

- **WEB-1.** Single responsive web application serving desktop, tablet, and mobile browsers. **No native apps, no app install prompts, no interstitials.**
- **WEB-2.** Mobile-first design. Assume 70%+ of traffic is mobile browser, arriving from search and from Instagram/TikTok in-app browsers. **In-app browser compatibility (Instagram, TikTok, Facebook webviews) must be explicitly tested** — these webviews have known issues with payment sheets, OAuth redirects, and cookie handling that will silently break checkout if untested.
- **WEB-3.** Browser support: last two major versions of Chrome, Safari, Firefox, Edge; iOS Safari 16+; Android Chrome. Apple Pay requires Safari; Google Pay requires Chrome — both must degrade gracefully to card entry.
- **WEB-4.** **Provider mobile web must support QR check-in via the device camera** (`getUserMedia` + a JS QR decoder), with a manual code-entry fallback for camera-permission denial.
- **WEB-5.** **Progressive Web App baseline:** installable manifest, service worker for offline access to upcoming bookings and check-in rosters, and **web push notifications** (Safari 16.4+ supports web push on iOS only for installed PWAs — the notification strategy must account for this and degrade to email).
- **WEB-6.** Add-to-calendar (.ics), Web Share API, and deep-linkable URLs for every bookable **and enquirable** entity so that links shared from social bios land on the correct page with no interstitial.

---

## 8. Non-Functional Requirements

- **NFR-1.** Availability 99.9% for booking and payment paths; 99.5% for search and enquiry.
- **NFR-2.** Search p95 < 400 ms; page TTFB p95 < 300 ms; booking confirmation p95 < 2 s.
- **NFR-3.** Scale targets at launch: 350k providers, 1.5M listings, 8M occurrences, 4M monthly visitors. Architecture headroom to 10×.
- **NFR-4.** Multi-region deployment (US, EU, APAC/Australia) with data residency controls (COMP-1 for EU/UK data subjects, COMP-2 for Australian cross-border disclosure). **Retained despite US-only payouts** — this is driven by buyer latency, EU data residency for EU data subjects, and CWV budgets, none of which changed.
- **NFR-5.** Accessibility: **WCAG 2.2 AA**. Non-negotiable — we market accessibility filters and must meet the standard ourselves. Also an EAA requirement in the EU. **An independent accessibility audit must be passed before public launch**, and re-run annually. Carried forward from the former §12 global launch gate; stating the standard is not the same as verifying conformance.
- **NFR-6.** Mobile-first design; the web app is the only client.
- **NFR-7.** Security: OWASP ASVS L2, SSO/2FA for internal tools, secrets management, dependency scanning, annual pen test, bug bounty at launch+3 months.
- **NFR-8.** Encryption in transit and at rest; separate key scope for special-category data (WVR-4).
- **NFR-9.** Observability: distributed tracing, structured logging, RUM, synthetic monitoring of booking, enquiry and payment paths per region.
- **NFR-10.** Disaster recovery: RPO 15 min, RTO 4 h; quarterly restore drills.
- **NFR-11.** Idempotency keys on all payment and booking mutations (Stripe idempotency keys plus internal).
- **NFR-12.** Backwards-compatible API versioning.

---

## 9. Compliance & Legal

- **COMP-1.** **GDPR / UK GDPR** — applies in full. Extraterritorial reach follows the **data subject**, not the payee, so restricting payouts to the US changes nothing here. Lawful basis register, DPIA for the ingestion pipeline and health-intake data, Article 14 notification for indirectly-collected data (ING-7) across all 30 non-US cities, designated privacy lead, records of processing, EU representative.
- **COMP-2.** **Australia Privacy Act / Australian Privacy Principles** — notifiable data breach scheme, cross-border disclosure obligations.
- **COMP-3.** **CCPA / CPRA** and other US state privacy laws (Virginia, Colorado, Connecticut, Texas) — opt-out of sale/sharing, Global Privacy Control honouring.
- **COMP-4.** Data subject rights: access, rectification, erasure, portability, objection — self-serve where possible, with SLA-tracked manual fallback (ADM-8).
- **COMP-5.** Cookie/consent management platform, geo-aware, blocking non-essential tags pre-consent (EU/UK PECR).
- **COMP-6.** Minimum age 16 (18 in some jurisdictions); guardian consent for minor bookings; no under-age accounts.
- **COMP-7.** Marketplace terms: separate practitioner ToS, provider agreement, and platform liability position. We are an intermediary, not the service provider. **A distinct, lighter set of terms is required for advertising-only providers**, who receive no payment service and are not party to a commission agreement — but are still bound by content, conduct and data terms.
- **COMP-8.** **EU DSA** obligations: notice-and-action mechanism, trader traceability (KYC for providers — **including advertising-only EU providers**, which is why ACC-5 requires a lighter identity check rather than none), transparency reporting, statement of reasons for suspensions.
- **COMP-9.** **EU P2B Regulation** — ranking transparency disclosure. **The SRCH-16 transactability demotion factor is a ranking parameter and must be disclosed** in the published ranking-parameters statement. Demoting EU providers for a commercial reason without disclosure is precisely what P2B prohibits. Legal to review the disclosure wording before launch.
- **COMP-10.** Consumer protection: EU/UK cancellation rights, UK CMA price-transparency rules, Australian Consumer Law, US FTC rules on negative-option billing (memberships) and on drip pricing. All-in pricing display where mandated. **These apply to non-US consumers buying US inventory** — the consumer's law follows the consumer.
- **COMP-11.** Advertising/paid-placement labelling. **No paid placement in v1 (Decision #4), so no labelling obligation arises at launch.** The obligation is retained in the register as a precondition of ever enabling it.
- **COMP-12.** Accessibility legislation: **EAA (EU, in force)**, ADA (US), Equality Act (UK), DDA (Australia).
- **COMP-13.** Insurance: platform E&O/cyber; clear position that providers must carry their own professional liability insurance (CRD-5).
- **COMP-14. NEW.** **US indirect tax registration programme.** Marketplace facilitator registration and threshold monitoring across ~45 states plus DC, including nexus tracking, exemption handling for non-taxable instruction services, and lodging/occupancy tax analysis for bundled retreat supply (PAY-10). Finance to own; Stripe Tax to execute.
- **COMP-15. NEW.** **Foreign indirect tax — none registered in v1.** Resolved by Decisions #12 and #16: we take **no** EU, UK, Australian or destination-country indirect tax registration. This is achieved by scope, not by exemption:
  - Online and on-demand inventory is **not sold to non-US buyers** (PAY-11a). No supply, no registration.
  - No in-person inventory is performed outside the US (§4.3, PAY-10 edge case). No supply, no registration.
  - Non-US providers are advertised, not transacted (PAY-17a). No supply, no registration.
  - **One open item, not a settled zero.** Non-US consumers *do* buy US-held inventory, and PAY-10 records an unconfirmed question over whether a bundled US retreat (accommodation + meals + transport) sold to an EU or UK consumer can engage tour-operator or margin-scheme treatment in their jurisdiction. Confirm with counsel before the first bundled retreat is sold cross-border. Everything else in this requirement is closed by scope.
  - **Thresholds, recorded for when this is revisited.** EU non-Union OSS: no threshold for a non-EU-established seller, obligation on the first sale. UK VAT: nil threshold for a non-established taxable person, obligation on the first sale. Australian GST: A$75,000 with EDP deemed-supplier rules. Rest of world: comparable non-resident regimes in Canada, Norway, Switzerland, Japan, South Korea, Singapore, New Zealand, Türkiye, India and others, several with nil thresholds.
  - **Sequencing rule for any future enablement.** Registration must be complete **before** the Track B flag (PAY-11a) is switched on for a region. Enablement is a configuration event, not a release event, so this does not reintroduce phased launch.
  - **Monitoring obligation.** Even at zero foreign sales, Finance must confirm quarterly that the PAY-11a flags remain off and that no listing has been mis-tracked into a foreign place of supply. A single misconfigured region creates a first-sale obligation in the EU and UK with no threshold to hide behind.
- **COMP-16. NEW.** **OFAC / sanctions compliance** for a US merchant of record serving global buyers (PAY-18). Screening programme, blocked-jurisdiction list, denied-party checks, decision logging, and periodic review by counsel.

---

## 10. Localisation

- **LOC-1.** Launch languages: **English, Spanish, Portuguese, German, French, Italian, Dutch.** Architecture must support additional languages without code change.
- **LOC-2.** Full i18n: no hardcoded strings, ICU message format, locale-aware dates/times/numbers/currencies, per-locale address formats.
- **LOC-3.** Machine translation for user-generated content, clearly labelled, original always accessible. Human translation for all product surfaces and legal text.
- **LOC-4.** Locale detection from geo + browser, always user-overridable, persisted per account.
- **LOC-5.** Culturally aware defaults: 12/24 h clocks, week start day, name ordering, phone formats, imperial vs metric.
- **LOC-6.** English variants: en-US, en-GB, en-AU must differ where it matters (spelling, currency, date format, "studio" vs "centre" conventions).
- **LOC-7. NEW.** **Currency presentation is decoupled from settlement.** Buyers see prices in their local currency with the conversion basis and any FX margin clearly disclosed; settlement is always USD (PAY-3). Never show a bare USD price to a non-US buyer with no context, and never imply the local figure is the exact charge if the issuer applies its own rate. This applies equally to advertising-only listings, whose prices are not denominated in USD at all (LST-14).

---

## 11. Open Business Decisions

Decisions resolved in v1.2 are retained here with their resolution rather than deleted, so that existing tickets referencing them remain valid.

| # | Decision | Status |
|---|---|---|
| ~~1~~ | ~~UK/Australia city count~~ | **Resolved v1.1 — 5 each.** |
| ~~2~~ | ~~Commission rates per vertical and per tier~~ | **Resolved v1.2 — 12% high-ticket, 5% high-frequency. See PAY-5.** |
| ~~3~~ | ~~Provider SaaS subscription tier at launch~~ | **Resolved v1.2 — no subscription tier. Commission only. See PAY-6.** |
| ~~4~~ | ~~Paid placement / featured listings at launch~~ | **Resolved v1.2 — no paid placement in v1. See SRCH-14, COMP-11.** |
| ~~5~~ | ~~Escrow release timing for retreats~~ | **Resolved v1.2 — released in full on event start date. See PAY-8.** |
| ~~6~~ | ~~Providers linking to their own site and price from the profile~~ | **Resolved v1.2 — no outbound links to competing booking paths on transactable listings; own website and social links retained; advertising-only listings exempt. See MSG-2.** |
| **7** | **Legal sign-off on the ingestion basis per jurisdiction** | **OPEN, Legal-owned. Blocks publication of the non-US index.** Covers 30 cities where we index named individuals we have no commercial relationship with. Recommendation on file: publish on legitimate interests with a documented LIA and DPIA, Art. 14 notification at publication, and one-click removal honoured within 72 hours with a permanent suppression list (ING-7). Not yet decided. |
| ~~8~~ | ~~Apple IAP ruling on on-demand content~~ | **Removed v1.1 — no native apps.** |
| **9** | **Brand name, domain, and trademark clearance** | **OPEN.** Recommendation on file: clear and file in **US, EUTM, UK and Australia**. The brand is publicly visible and accruing SEO equity in all 50 cities from day one, so a conflict surfacing post-launch means rebranding a live index. Not yet decided. |
| ~~10~~ | ~~Which 8–12 cities open at public launch~~ | **Retired v1.2 — no phased launch. All 50 cities open at launch.** |
| ~~11~~ | ~~Stripe-only vs "retreats anywhere"~~ | **Resolved v1.2 — US-only payouts; all non-US supply is advertising-only. See PAY-2, PAY-17, NG-6.** |
| ~~12~~ | ~~Is the Track B foreign tax registration cost justified?~~ | **Resolved v1.2 — no. Online and on-demand inventory is sold to US buyers only.** No EU OSS, UK VAT or AU GST registration is taken. Stripe Tax Complete could perform the filings, but the legal liability, registration and audit exposure would remain ours; not worth it for ~5% of GMV. See PAY-11a, COMP-15. |
| ~~13~~ | ~~SRCH-16 demotion factor for advertising-only listings~~ | **Resolved v1.2 — fixed 15–20% score multiplier**, versioned, A/B tested within that band, and published under EU P2B. See SRCH-16, COMP-9. |
| ~~14~~ | ~~Supply-acquisition proposition for the 30 non-US cities~~ | **Resolved v1.2 — authenticity first.** The pitch is profile ownership and accuracy: this page about you exists and is being seen, claim it so it is yours and correct. Reach is secondary; eventual payment support is tertiary and must not be promised with a date. See DASH-7, ING-6, NG-6. |
| ~~15~~ | ~~DAC7, UK digital-platform reporting, Australian SERR~~ | **Resolved v1.2 — designed out of scope rather than complied with.** Advertising-only mode (PAY-17a) places non-US listings inside the advertising carve-out common to all three regimes; Decisions #12 and #16 remove the supply limbs entirely. See PAY-12. **A confirming counsel memo is still recommended and is not a blocker.** |
| ~~16~~ | ~~Indirect tax registration in retreat destination countries~~ | **Deferred v1.2 — launch US-held retreats only; revisit in six months.** Instrument outbound contact volume on non-US retreats by destination country (BKG-20, ANL-2, within PAY-17a limits) so the eventual decision is demand-led. Note the disclosed-agent restructure remains the unexplored high-upside option. |
| **17** | **NEW — Stripe Managed Payments (merchant of record) as an alternative architecture** | **OPEN, to investigate before Section 7.8 is built.** Under Managed Payments Stripe becomes the legal seller and carries VAT/GST/sales-tax liability in 80+ countries, which would collapse Decisions #12, #15 and much of #16 at once. Unverified: whether it can coexist with Connect payouts in a two-sided marketplace, and whether it covers in-person services at all. Worth a direct conversation with Stripe. If it works, much of PAY-10 through PAY-13 is rewritten. |

---

## Appendix A — Indexed Cities (50)

**United States (20) — transactional:** New York, Los Angeles, San Francisco Bay Area, Chicago, Austin, Denver, Boulder, Seattle, Portland, Boston, Miami, San Diego, Washington DC, Atlanta, Philadelphia, Dallas, Houston, Nashville, Phoenix–Scottsdale, Minneapolis–St Paul

**Continental Europe (20) — index and enquiry only:** Berlin, Munich, Hamburg, Amsterdam, Paris, Lyon, Barcelona, Madrid, Valencia, Lisbon, Porto, Milan, Rome, Copenhagen, Stockholm, Zurich, Vienna, Dublin, Prague, Warsaw

**United Kingdom (5) — index and enquiry only:** London, Manchester, Bristol, Edinburgh, Brighton

**Australia (5) — index and enquiry only:** Sydney, Melbourne, Byron Bay, Brisbane, Perth

*Note: Byron Bay is a major retreat and teacher-training destination as well as a local market. Under v1.2 **both** its local classes and its retreats are advertising-only — the retreats because they are physically performed in Australia, regardless of organiser domicile (§4.3). Its city page must surface both, and both are lead-generation. Lisbon and Barcelona have the same dual character with the same outcome. Boulder, being US, is the only one of the four that is fully transactional on both sides.*

**Global, non-city inventory:** online/live-streamed (all timezones), retreats (worldwide), teacher trainings (worldwide) — all **indexed** worldwide. Transactability requires **both** a US-domiciled organiser **and** a live registered tax treatment for the supply — see the table in §4.3. In v1 that means: retreats and trainings must be **US-held**, and online inventory is sellable to **US buyers only**. Everything else on this list is advertising.

---

## Appendix B — Currencies & Payment Methods

All via Stripe, governed by **PAY-19**. **Settlement is USD only** (PAY-3). The table below describes **buyer-facing** presentment and methods.

| Buyer region | Presentment currencies | Methods |
|---|---|---|
| US | USD | Cards, Apple Pay, Google Pay, Link, ACH Direct Debit |
| Continental Europe | EUR, CHF, SEK, DKK, CZK, PLN | Cards, Apple Pay, Google Pay, Link, Klarna. iDEAL / Bancontact to be verified against a USD-settling US account — treat as optional, not assumed. |
| UK | GBP | Cards, Apple Pay, Google Pay, Link, Klarna |
| Australia | AUD | Cards, Apple Pay, Google Pay, Link |
| Rest of world | USD, plus Stripe-supported presentment currencies | Cards, Apple Pay, Google Pay, Link |

**Removed in v1.2:** SEPA Direct Debit, Bacs Direct Debit, BECS Direct Debit. All three are local bank-debit schemes requiring local settlement, which a USD-settling US account cannot provide.

**Conversion risk to note:** European and Australian buyers lose their preferred local bank-debit rails and fall back to cards. Combined with higher 3DS challenge rates on non-US cards (PAY-16), expect measurably lower checkout conversion from non-US buyers than the v1.1 model assumed. Instrument from day one (ANL-2).

*Stripe availability must be re-verified per method during build; method support changes.*

---

## Appendix C — Definitions

- **Occurrence** — a single dated instance of a Listing.
- **Liquidity** — proportion of published listings receiving at least one booking in a 30-day window. The primary health metric, and it exists **only for transactional cities**. There is no liquidity metric for advertising-only cities, because we do not observe outcomes there (PAY-17a, ANL-2). The nearest available proxy is outbound contact clicks per published listing, which measures interest, not liquidity, and must not be reported as though it did.
- **Provenance** — how a record entered the system: seeded, claimed, or natively created.
- **RYT / RYS** — Registered Yoga Teacher / Registered Yoga School. A voluntary registry designation, **not** a licence or state certification. Product copy must never imply otherwise.
- **Take rate** — platform commission as a percentage of GMV. 12% high-ticket, 5% high-frequency (PAY-5).
- **AEO** — Answer Engine Optimization: being retrieved and cited by LLM-powered search surfaces.
- **Advertising-only listing** *(called an "enquiry-only listing" in v1.1 and in older ticket titles — same records, renamed and constrained in v1.2)* — an indexed, discoverable, ranked listing that **advertises** a provider without our facilitating, monetising or observing any resulting transaction. Applies wherever a listing fails **either** limb of §4.3: the provider cannot receive a US payout, **or** we have no live registered tax treatment for that supply (PAY-2, PAY-10, PAY-11a, PAY-17, PAY-17a). Deliberately **not** described as "lead generation" — see NG-8 and PAY-12 for why that framing is unavailable to us.
- **Transactability** — the derived state (`bookable` | `enquiry_only`) of a Listing, computed from its Organisation's payout eligibility, its tax track and performance country, and — for Track B — the viewing buyer's region (DM-7). Request-scoped for online inventory, not a static row property.
- **Tax tractability** — the second limb of §4.3: whether a live, registered indirect-tax treatment exists for a given supply. **Not** the same as "taxed in the US."
- **Track A / Track B** — the two indirect-tax treatments. Track A is in-person supply, taxed where performed. Track B is online and on-demand supply, taxed at the buyer's location (PAY-10, PAY-11).
- **Place of supply** — the jurisdiction whose indirect tax law governs a transaction. Determined by the nature of the service and where it is consumed, not by the seller's domicile and not by the settlement currency.
- **Domicile** — the country of an Organisation's legal entity and bank account, which determines payout eligibility. Independent of where its listings are physically held.
