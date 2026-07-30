# NFR control plan

This document records controls encoded in the repository. It is not evidence that a vendor SLA, regional deployment, restore drill, accessibility audit, penetration test, or production performance target has been achieved.

## Service levels and capacity (NFR-1–NFR-3)

The contractual values are machine-readable in `src/lib/config/platform.ts`. Lighthouse enforces browser performance budgets in CI. Production p95 latency and availability require telemetry over a representative window; alerts should use:

- booking/payment availability: 99.9%;
- search/contact availability: 99.5%;
- search p95: 400 ms; page TTFB p95: 300 ms; confirmation p95: 2 s.

Capacity tests must seed production-shaped indexes and test 3.5M providers, 15M listings, and 80M occurrences (10× launch headroom) before launch. Unit tests only verify that these targets cannot silently drift.

## Regions and residency (NFR-4)

`dataRegionFor` maps EU/EEA/UK subjects to `eu`, Australia/New Zealand to `au`, and other/unknown subjects to `us`. Persistence callers must invoke `assertDataRegion` before writing personal data. A production deployment still needs independent databases and encryption keys in each region and routing evidence from the hosting/database vendors.

## Security and encryption (NFR-7–NFR-8)

- HTTP security and camera/payment permissions are defined in `next.config.ts`.
- Dependabot monitors package and GitHub Action updates.
- CI runs lint, type checking, tests, and a production build.
- `src/lib/sensitive-data.ts` uses AES-256-GCM and a dedicated `SPECIAL_CATEGORY_DATA_KEY`; special-category records must not use the general application key.
- Provider transport and disk encryption, SSO/2FA enforcement, OWASP ASVS L2 review, penetration testing, and the launch+3-month bug bounty require external evidence.

## Observability (NFR-9)

Sentry owns server/browser exceptions and distributed request tracing; Vercel Speed Insights and PostHog provide RUM. PII is disabled in Sentry configuration. Production monitors must exercise search, direct contact, booking, and payment from US, EU, and APAC points of presence. Synthetic payment probes must use the payment provider's test mode and a dedicated synthetic listing.

## Disaster recovery (NFR-10)

Target: RPO 15 minutes, RTO 4 hours. Production must enable point-in-time recovery with a retention window longer than the quarterly drill interval and replicate encrypted backups outside the primary failure domain.

Quarterly restore drill:

1. Create an isolated recovery database and restore to a timestamp no more than 15 minutes before the declared incident.
2. Run migrations without changing the source backup.
3. Compare provider, listing, occurrence, booking, ledger, and audit-log counts and verify a sample of checksums.
4. Start the application against the isolated database and execute search, checkout in test mode, confirmation, and provider roster flows.
5. Record timestamps, actual RPO/RTO, discrepancies, owner, and remediation ticket outside this repository.
6. Destroy the isolated environment after evidence is retained.

No drill is considered passed merely because this runbook exists.
