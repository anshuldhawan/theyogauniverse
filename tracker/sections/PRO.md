# PRO — Provider Profiles (§7.2)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 13 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| PRO-1 | done | 2 | PRO-1 URL patterns live: /teachers/{slug}, /studios/{cc}/{city}/{slug}, /schools/…, /organisers/{slug}; online segment for online-only |
| PRO-2 | done | 2 | Deterministic name/name-city/numeric collision handling, permanent redirect store/schema, and permanentRedirect route fallback; covered by profiles tests |
| PRO-3 | in-progress | 2 | provider_domains ownership/TLS state schema + strict domain normalisation implemented; DNS verification and auto-TLS vendor wiring pending |
| PRO-4 | done | 2 | Unique title + meta description from name/tagline; canonical set (provider-page.tsx) |
| PRO-5 | in-progress | 2 | Typed studio details validate hours, rooms/capacity, amenities, accessibility, hot yoga, rules, policy and transport; editor/persistence pending |
| PRO-6 | in-progress | 2 | Typed school details validate registry, catalogue, teachers, contact hours, curriculum, accommodation, outcomes and cohorts; editor pending |
| PRO-7 | done | 2 | Link-in-bio variant at /{slug}: single column, CTA, links, next sessions; canonical to full profile |
| PRO-8 | n-a | 2 | Struck through in the PRD (removed in v1.1). |
| PRO-9 | done | 2 | Weighted completeness engine + ordered next actions + accessible dashboard progress UI implemented and tested |
| PRO-10 | in-progress | 2 | Dashboard visitor-preview link implemented; previewing unpublished draft state remains pending |
| PRO-11 | done | 2 | Organisation→N providers/listings schema supports independent location schedules; payout eligibility inherited only from Organisation |
| PRO-12 | in-progress | 2 | Dual-confirmation/history schema + active/end affiliation domain controls tested; invitation/confirmation UI pending |
| PRO-13 | done | 2 | Book vs Enquire CTA + neutral one-liner is the ONLY difference (ProviderCard/ProviderProfile); help page live |
