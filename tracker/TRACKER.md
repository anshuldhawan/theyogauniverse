# Tracker rollup — requirements v1.2

Baseline: [`docs/requirements/yoga-platform-requirements-v1.2.md`](../docs/requirements/yoga-platform-requirements-v1.2.md)
(pinned in [BASELINE.md](BASELINE.md)). Regenerate this table with
`node tracker/scripts/generate.mjs`.

## Progress by section

<!-- ROLLUP:START -->
| Section | Total | Done | In progress | Blocked | Deferred | N/A | Todo |
|---|---|---|---|---|---|---|---|
| [DM](sections/DM.md) | 8 | 7 | 1 | 0 | 0 | 0 | 0 |
| [NG](sections/NG.md) | 9 | 7 | 2 | 0 | 0 | 0 | 0 |
| [ACC](sections/ACC.md) | 13 | 3 | 10 | 0 | 0 | 0 | 0 |
| [PRO](sections/PRO.md) | 13 | 7 | 5 | 0 | 0 | 1 | 0 |
| [CRD](sections/CRD.md) | 7 | 3 | 4 | 0 | 0 | 0 | 0 |
| [LST](sections/LST.md) | 14 | 3 | 11 | 0 | 0 | 0 | 0 |
| [SCH](sections/SCH.md) | 10 | 4 | 6 | 0 | 0 | 0 | 0 |
| [SRCH](sections/SRCH.md) | 16 | 2 | 14 | 0 | 0 | 0 | 0 |
| [BKG](sections/BKG.md) | 21 | 2 | 19 | 0 | 0 | 0 | 0 |
| [PAY](sections/PAY.md) | 22 | 18 | 4 | 0 | 0 | 0 | 0 |
| [WVR](sections/WVR.md) | 8 | 1 | 6 | 1 | 0 | 0 | 0 |
| [REV](sections/REV.md) | 12 | 6 | 6 | 0 | 0 | 0 | 0 |
| [MSG](sections/MSG.md) | 8 | 3 | 5 | 0 | 0 | 0 | 0 |
| [DASH](sections/DASH.md) | 11 | 3 | 7 | 0 | 0 | 1 | 0 |
| [ING](sections/ING.md) | 12 | 7 | 5 | 0 | 0 | 0 | 0 |
| [SEO](sections/SEO.md) | 16 | 9 | 7 | 0 | 0 | 0 | 0 |
| [TSF](sections/TSF.md) | 9 | 0 | 8 | 1 | 0 | 0 | 0 |
| [ADM](sections/ADM.md) | 10 | 3 | 7 | 0 | 0 | 0 | 0 |
| [ANL](sections/ANL.md) | 5 | 2 | 3 | 0 | 0 | 0 | 0 |
| [INT](sections/INT.md) | 11 | 7 | 4 | 0 | 0 | 0 | 0 |
| [WEB](sections/WEB.md) | 6 | 3 | 3 | 0 | 0 | 0 | 0 |
| [NFR](sections/NFR.md) | 12 | 3 | 8 | 0 | 0 | 1 | 0 |
| [COMP](sections/COMP.md) | 16 | 1 | 15 | 0 | 0 | 0 | 0 |
| [LOC](sections/LOC.md) | 7 | 0 | 7 | 0 | 0 | 0 | 0 |
| [BLG](sections/BLG.md) | 69 | 59 | 7 | 1 | 1 | 1 | 0 |
| **All** | **345** | **163** | **174** | **3** | **1** | **4** | **0** |
<!-- ROLLUP:END -->

## Unmapped implementation changes

Record material implementation work here only when no existing requirement ID
applies. Include the date, affected paths, what changed, verification, and any
remaining gap. Prefer updating requirement rows whenever a mapping exists.

- None.

## Phases

| Phase | Scope | State |
|---|---|---|
| 0 | Repo, tracker, CI, design system | **complete** |
| 1 | Domain model, auth, taxonomy, transactability engine, seed data | **complete** |
| 2 | Global index: profiles, listings, city pages, search + ranking, SEO/AEO, direct-contact flow, i18n, claim | **complete** (foundation; remaining rows tracked per section) |
| 3 | US transaction layer: scheduling, booking, Stripe Connect, tax, ledger, waivers, reviews, messaging | **complete** (domain engines + booking flow live on mock rail; live Stripe keys pending) |
| 4 | Dashboards, admin, ingestion, integrations, T&S, analytics, compliance/NFR | **complete** (dashboard, admin console, ingestion/moderation libs, public API, PWA baseline; per-row gaps tracked per section) |

## Open business decisions (blockers, owned outside engineering)

| # | Decision | Status | Blocks |
|---|---|---|---|
| 7 | Legal sign-off on the ingestion basis per jurisdiction | **RESOLVED — owner, 29 Jul 2026.** Advertising-only listings send referral traffic to listed professionals; publication approved for all 30 non-US cities. Control: ING-7 removal flow shipped end-to-end (`/legal/removal`, instant verified removal, one-click admin honour, permanent tombstone, 72h SLA). Memo: [`docs/decisions/decision-7-non-us-ingestion.md`](../docs/decisions/decision-7-non-us-ingestion.md) | No longer blocks. |
| 9 | Brand name, domain, trademark clearance (US, EUTM, UK, AU) | **RESOLVED — owner, 29 Jul 2026.** Launch proceeds under The Yoga Universe; US filing recommended as follow-up, international filings deferred. Memo: [`docs/decisions/decision-9-trademark.md`](../docs/decisions/decision-9-trademark.md) | No longer blocks. |
| 17 | Stripe Managed Payments (merchant of record) as alternative architecture | **RESOLVED — not viable** (excludes Connect platforms and human-delivered services). Connect architecture confirmed. Memo: [`docs/decisions/decision-17-stripe-managed-payments.md`](../docs/decisions/decision-17-stripe-managed-payments.md) | Nothing — Phase 3 unblocked. |

### Blog module (BLG v1.0) open decisions

| # | Decision | Owner | Status / Blocks |
|---|---|---|---|
| B1 | Monthly volume cap under BLG-23 (derived from real expert-review capacity) | Editorial + Finance | **OPEN.** Blocks scaling content production, not the build. Gate config ships with a conservative placeholder cap. |
| B2 | Expert reviewers: paid contractors vs platform teachers compensated in kind | Editorial + Growth | **OPEN.** Determines reviewer cost line feeding B1. |
| B3 | Root domain vs subdomain | SEO + Engineering | **RESOLVED — root domain `/blog`** (module's strong recommendation; already implemented). |
| B4 | Original data studies from the platform's own index | Data + Editorial | **OPEN.** Needs privacy + competitive review before publishing aggregate provider insight. |
| B5 | When to add blog languages beyond English | Growth | **OPEN.** BLG-6 architecture keeps this a content operation, not a schema migration. |
| B6 | Editorial independence policy (line between BLG-26 linking and funnel capture) | Editorial + Legal | **OPEN.** Written policy wanted before the first partner-pressure conversation. |
| B7 | Extend medical disclaimer (BLG-47a) to listing descriptions and provider bios | Legal + Product | **OPEN.** Recommend raising against the parent spec as a new requirement — provider therapeutic claims sit in the purchase path. |

## Standing counsel items (recommended, not launch blockers unless noted)

- Advertising carve-out confirming memo (PAY-12) — recommended, not a blocker (Decision #15).
- Bundled US retreat sold to EU/UK consumers: tour-operator/margin-scheme analysis (PAY-10, COMP-15) — **required before the first bundled retreat is sold cross-border**.
- Waiver templates approved per US state before that state's inventory is bookable (WVR-1) — standing launch requirement.
- ~~WCAG 2.2 AA independent audit before public launch (NFR-5)~~ — **removed by owner decision, 29 Jul 2026** ([memo](../docs/decisions/decision-nfr5-wcag-audit.md)): no accessibility filters are marketed or shipped; semantic-HTML best efforts remain.
