# ACC — Identity & Accounts (§7.1)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 13 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| ACC-1 | in-progress | 1 | Clerk wrapper (src/lib/auth.ts) covers Google/Apple/Facebook/magic-link/OTP; keys not yet provisioned |
| ACC-2 | in-progress | 1 | Guest booking/payment path accepts nullable userAccountId and is covered by booking tests; post-purchase pre-populated account offer pending |
| ACC-3 | in-progress | 1 | Apple Sign-In via Clerk provider config; pending keys |
| ACC-4 | in-progress | 1 | Verified-action guard for reviews/claims implemented and tested; route/action integration pending |
| ACC-5 | in-progress | 1 | Local policy allows listing pre-KYC, gates US payout on KYC, and models lighter non-US traceability; vendor verification flow pending |
| ACC-6 | in-progress | 1 | account_identities schema + verified-email merge logic/tests; Clerk account-linking integration pending |
| ACC-7 | in-progress | 1 | Device sessions/TOTP remain Clerk-dependent; mandatory owner/admin second-factor policy implemented and tested locally |
| ACC-8 | in-progress | 1 | Privacy request queue + redacted portable export envelope implemented; self-serve UI and erasure worker pending |
| ACC-9 | in-progress | 1 | follows schema and deduplicating teacher/studio/city follow domain logic implemented; UI/notifications pending |
| ACC-10 | in-progress | 1 | Saved collections schema, idempotent saves and opt-in public links implemented; routes/UI pending |
| ACC-11 | done | 1 | All required practitioner fields represented in user_accounts + validated domain schema; injuries stored only as ciphertext and excluded from export |
| ACC-12 | done | 1 | organisation_members table + org-scoped role helpers; permissions per organisation not per user |
| ACC-13 | done | 1 | PayoutEligibility on Organisation (schema + types); transactability engine consumes it, never profile country |
