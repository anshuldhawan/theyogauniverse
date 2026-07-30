# Agent guide — The Yoga Universe

Onboarding doc for AI agents working in this repo. Read this first, then the architecture reference.

## Start here

| Doc | Purpose |
|---|---|
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | System design, directory map, data flows, domain rules, and where to look for common tasks |
| [README.md](README.md) | Human-oriented quick start, stack summary, deployment |
| [docs/requirements/yoga-platform-requirements-v1.2.md](docs/requirements/yoga-platform-requirements-v1.2.md) | Active PRD baseline (v1.2) — source of truth for product behaviour |
| [tracker/TRACKER.md](tracker/TRACKER.md) | Requirement-level build progress (345 IDs across 25 sections) |
| [.env.example](.env.example) | All environment variables and dev fallbacks |

## What this project is

A **global yoga & meditation index** (50 cities) plus a **US-domestic transactional marketplace** (Stripe Connect). The index is worldwide; only US providers with active Connect accounts can transact. Transactability is **derived at request time**, never stored as a column.

## Working rules

### 1. Think ahead — surface blindspots

On every non-trivial task, proactively tell the user:

- **What is missing** — gaps in implementation, untested paths, env vars not set, tracker rows still `todo`/`in-progress`
- **What they may not have considered** — legal/compliance constraints (PAY-17a, Decision #7), buyer-region scoping for Track B tax, seed-vs-DB divergence, requirement IDs the change touches
- **Risks and trade-offs** — before implementing, not after

Do not wait to be asked. A short "Blindspots" or "Before you ship" section at the end of substantive work is expected.

### 2. Keep the codebase token-efficient

Agents read more code than humans. Minimize noise:

- **Do not** add markdown files, comments, or abstractions the user did not ask for
- **Do not** duplicate logic — extend existing modules in `src/lib/` and `src/lib/repo/`
- **Do not** expand seed data or generated files unless the task requires it
- **Prefer** targeted reads: check `docs/ARCHITECTURE.md` and the relevant `src/lib/*.ts` module before globbing the whole tree
- **Prefer** small, focused diffs over drive-by refactors
- **Never** casually edit `docs/requirements/*.md` — the checksum gate in `tracker/scripts/validate.mjs` will fail

### 3. Keep the tracker synchronized with every change

The tracker must always describe the current implementation. **No implementation, behavior change, fix, refactor, integration, security update, SEO/AEO update, or completed task is done until its tracker entry is updated in the same change.**

- Before editing code, identify every affected requirement ID in the active PRD and `tracker/sections/*.md`
- After editing, update each affected row's status and concise note to state what now exists, what changed, how it was verified, and what remains
- Use `in-progress` whenever any part of the written requirement is still missing; use `done` only when the complete requirement is implemented and verified
- If a change affects multiple requirement families, update every relevant section—not only the primary one
- Fixes and refactors that preserve status must still update the relevant row note when they materially change implementation or verification
- If work has no matching requirement ID, add a concise entry under an **Unmapped implementation changes** section in `tracker/TRACKER.md`; do not invent a requirement ID
- Regenerate the rollup when statuses change, then run `pnpm tracker:validate`
- Never mark work complete while code and tracker disagree
- Never edit generated rollup counts by hand; use the tracker scripts

Pure formatting, typo-only documentation edits, and generated artifacts do not need tracker entries unless they change documented behavior or requirement status.

### 4. Every page must be SEO and AEO optimized

**This is non-negotiable for all indexable surfaces** — public pages, profiles, city hubs, blog articles, help guides, and directory listings. Dashboard, admin, and transactional flows (`/book/`, `/booking/`) are excluded from indexing but still need clean metadata where rendered.

SEO = traditional search (Google, Bing). AEO = Answer Engine Optimization — structuring content so AI assistants (ChatGPT, Perplexity, Google AI Overviews) can cite and summarise it accurately.

When adding or changing any public page:

1. **SSR only** — indexable routes must be Server Components with `generateMetadata()` (SEO-1). No client-only rendering for content crawlers need.
2. **Metadata** — unique `title`, `description` (≤160 chars), self-referencing `canonical`, and `robots` when the page should be `noindex`.
3. **AEO content structure** (SEO-6) — hub and content pages need:
   - A 40–60 word direct answer near the top (before other content)
   - Question-shaped H2s
   - Visible FAQ block (fragment-addressable ids on blog articles)
   - Comparison tables or lists where they aid comprehension
4. **Structured data** — emit honest schema.org JSON-LD via `<JsonLd>` (SEO-2/3/15):
   - `Person` / `LocalBusiness` / `Organization` on profiles
   - `ItemList` + `BreadcrumbList` on city/directory pages
   - `Article` on blog posts with author, dates, and reviewer
   - `Offer` **only** on bookable listings — never on enquiry-only pages (SEO-15)
   - `AggregateRating` only with genuine minimum sample (REV-8)
5. **Thin-page suppression** — city hubs below the quality threshold get automatic `noindex` via `cityPageIndexable()` in `src/lib/seo.ts` (SEO-4). Threshold measures content quality, **not** transactability (SEO-4a).
6. **Sitemap honesty** — only indexable pages appear in `src/app/sitemap.ts` (SEO-8). If a page is `noindex`, omit it.
7. **AI crawler access** — `robots.ts` allows AI bots by default (SEO-11). `/llms.txt` is the curated site map for AI ingestion (SEO-13) — update it when adding major new page types.
8. **Performance** — respect Core Web Vitals budget: LCP < 2.5 s, CLS < 0.1 (SEO-9). No layout shift from late-loading fonts or images.
9. **Internal linking** — link to related city pages, profiles, blog pillars, and directory filters with varied anchor text (SEO-11). Blog articles use `RelatedEditorial` and `CommercialLinks` patterns.

See [docs/ARCHITECTURE.md § SEO & AEO](docs/ARCHITECTURE.md#seo--aeo) for implementation patterns and file references. Tracker rows live in `tracker/sections/SEO.md`.

### 5. Security and secret protection are non-negotiable

Treat security as part of every task, not a later audit. Preserve least privilege and secure defaults across code, infrastructure, data, logs, and agent operations.

- **Never** hardcode, commit, print, paste into chat, or expose secrets in diffs, logs, screenshots, test fixtures, URLs, or client bundles
- Secrets belong in **Vercel encrypted environment variables**; local copies belong only in gitignored `.env.local` / `.env.*.local` files
- Only variables intentionally safe for browsers may use `NEXT_PUBLIC_`; database URLs, API keys, webhook secrets, Redis tokens, and service credentials must remain server-only
- Keep `.env.example` limited to empty placeholders and documentation—never real or realistic credentials
- Use separate, least-privilege credentials and data resources for development, preview, and production; preview deployments must never use the production database or production Redis
- Prefer Vercel Marketplace integrations for **Neon Postgres** and **Upstash Redis** so credentials are provisioned and injected automatically
- Verify authentication **and authorization** at every protected Server Action and API boundary; never trust client-supplied identity, price, role, ownership, transactability, or redirect URLs
- Validate untrusted input with strict schemas; use parameterized Drizzle/Neon queries; encode output; defend against injection, XSS, CSRF, SSRF, open redirects, path traversal, and unsafe file uploads
- Verify Stripe and other webhook signatures against the raw request body; preserve idempotency and reject stale/replayed events where supported
- Rate-limit public and sensitive endpoints with Upstash; fail closed for authentication, payments, admin operations, and authorization checks
- Never log card data, passwords, session tokens, auth headers, full webhook payloads, personal data, or connection strings; redact sensitive fields from errors and analytics
- Do not return internal stack traces, provider errors, database details, or secret-bearing objects to clients
- Apply schema changes through reviewed Drizzle migrations; use isolated Neon branches for development/preview and protect production from destructive commands
- Keep dependencies current and avoid adding packages when platform or existing code already provides the capability
- If a secret is discovered in source, history, logs, or chat: stop using it, report the exposure without repeating the value, rotate/revoke it, remove it from reachable history/logs, and verify replacement credentials

Before completing security-sensitive work, review the changed trust boundaries, data exposure, authorization, abuse controls, logging, error handling, and environment separation. Surface unresolved risks under **Security blindspots**.

### 6. Agent-operated infrastructure and delivery

The user expects Cursor agents to complete requested work end-to-end without handing back routine setup steps.

- Hosting, Next.js backend/functions, deployments, and environment configuration run on **Vercel**
- The relational database is **Neon Postgres via the Vercel Marketplace**, accessed through Drizzle
- Cache and rate limiting use **Upstash Redis via the Vercel Marketplace**
- Analytics is **PostHog via the Vercel Marketplace** plus Vercel Web Analytics / Speed Insights (rule 9); error monitoring is **Sentry via the Vercel Marketplace** (inert until provisioned)
- Prefer Vercel MCP/CLI and provider MCP/CLI/API automation over dashboard instructions
- When a task requires setup, the agent should install required tooling, link the correct project, provision integrations, configure environment variables, run migrations, deploy, and verify the result when authorized by the task
- Use non-interactive commands and safe defaults. Never ask the user to copy secrets into chat
- Pull secrets securely from the linked platform; do not display their values. Prefer runtime injection where available
- Use isolated Vercel preview deployments and Neon branches for validation before production changes
- Continue through safe, reversible steps automatically. Ask only when blocked by authentication/authorization, billing or domain purchase, CAPTCHA/passkey/manual approval, an irreversible production operation, or a missing product decision that materially changes the result
- A request to implement code does **not** silently authorize a production deployment, paid purchase, destructive migration, or data deletion; explain the blocker and request the narrow approval needed
- After automation, verify the complete path (browser → Vercel function → Neon/Upstash → response) and report outcomes, not a checklist of work for the user

See [docs/ARCHITECTURE.md § Deployment, infrastructure & secrets](docs/ARCHITECTURE.md#deployment-infrastructure--secrets).

### 7. Follow existing conventions

- Domain logic lives in `src/lib/` (pure functions, heavily unit-tested)
- UI in `src/components/` (`site/` for public, `dashboard/` for provider, `ui.tsx` for primitives)
- Routes in `src/app/` (App Router); Server Actions in `src/app/actions/`
- Requirement IDs in code comments (e.g. `BKG-18`, `PAY-2`, `SEO-6`) map to PRD sections — use them when tracing behaviour
- Geo-specific behaviour is **configuration** in `src/lib/config/markets.ts`, not hard-coded (NG-5a)

### 8. Dev without external services

`pnpm dev` runs fully offline: in-memory seed repo, mock payments, guest auth, in-memory rate limiter. No `.env` required for basic work.

```bash
pnpm install
pnpm dev          # seed data, no DB/Clerk/Stripe needed
pnpm test         # domain unit tests
pnpm typecheck
pnpm lint
pnpm tracker:validate
```

### 9. Before marking work done

- [ ] Run `pnpm test` and `pnpm typecheck` for touched areas
- [ ] Update every affected tracker row with implementation, verification, and remaining gaps; record unmapped work in `tracker/TRACKER.md`
- [ ] Regenerate tracker rollup when statuses changed and run `pnpm tracker:validate`
- [ ] Confirm the change respects DM-7 (no `transactability` column), PAY-17a (no buyer PII in outbound-contact counters), and the "never render a Book button we can't honour" rule
- [ ] Review security: authorization, validation, secret exposure, logs/errors, rate limits, webhook verification, and environment separation
- [ ] Confirm no secret or production credential appears in source, diffs, output, screenshots, or client-visible variables
- [ ] **SEO/AEO checklist** (for any public page or content change):
  - [ ] `generateMetadata()` with title, description, canonical
  - [ ] Server-rendered content (no client-only indexable body)
  - [ ] Direct-answer paragraph on hub/content pages
  - [ ] Honest JSON-LD (no `Offer` on enquiry-only listings)
  - [ ] Page included in or excluded from sitemap matching its `robots` state
  - [ ] `/llms.txt` updated if adding a new top-level content type
- [ ] **Analytics coverage** (rule 9): new functionality emits governed events via `track()`; new personal-data UI carries `data-ph-mask` / `data-ph-block`
- [ ] List blindspots for the user (see rule 1)

### 9. Every new feature ships analytics events (ANL-1)

Stack: **PostHog via Vercel Marketplace** (product analytics, web analytics, session replay, feature flags/experiments) + **Vercel Web Analytics & Speed Insights** (traffic baseline, Core Web Vitals) + **Google Search Console** (search visibility; verification via `GOOGLE_SITE_VERIFICATION`). **No GA4** — do not add it without a stated marketing requirement.

**When adding or changing any user-facing functionality, analytics coverage is part of the change, not a follow-up:**

- **Extend the taxonomy in `src/lib/analytics.ts`** — add the event name to `TRANSACTABLE_EVENTS` (advertising-only surfaces stay within `ADVERTISING_ONLY_EVENTS`) and call `track()` from **server code** (Server Components, Server Actions, Route Handlers). `track()` streams to PostHog in production and is a console sink in dev.
- **PAY-17a stays structural**: advertising-only subjects emit only `impression`, `profile_view`, `outbound_contact`. No event may extend that funnel; proposals to do so go to Legal (PAY-12), not Analytics.
- **Browser-originated governed events** go through the `/api/analytics` beacon only — extend its zod enum. Never call `posthog.capture()` directly from components (posthog-js autocapture already covers generic pageviews/clicks).
- **Payload hygiene**: flat `string | number | boolean | null`; IDs, slugs, enums, counts, amounts only. Never PII, health notes, message text, or free-form input.
- **Replay masking**: UI rendering personal data, health notes, messages, or payment fields must carry `data-ph-mask` (mask text) or `data-ph-block` (exclude). Inputs are masked globally by default.
- **Feature flags & experiments**: create the flag/experiment in PostHog, then gate server-side with `featureFlagValue()` / `featureEnabled()` in `src/lib/flags.ts`. Both return `false` offline — `false` must always be the safe/control path.
- **UTM conventions** for inbound links: lowercase `utm_source` (newsletter, google, instagram), `utm_medium` (email, cpc, social, referral), `utm_campaign` (snake_case initiative). PostHog ingests UTMs automatically — consistency is the whole job.
- Env vars are provisioned by the Vercel integrations and pulled with `vercel env pull`. Never hardcode keys; never put secrets in `NEXT_PUBLIC_*`.

## Quick navigation

```
agents.md          ← you are here
docs/ARCHITECTURE.md   ← full system map
src/lib/           ← domain engines (booking, payments, transactability, …)
src/lib/repo/      ← data access (seed in dev; Drizzle/Neon in prod — migration in progress)
src/app/(site)/    ← public pages (profiles, directory, blog, booking)
src/app/dashboard/ ← provider dashboard
src/app/admin/     ← internal admin
src/app/api/       ← webhooks, public API, analytics
src/db/schema.ts   ← Drizzle schema (DM-1 through DM-8)
tracker/sections/  ← per-requirement status rows
```

## Common pitfalls

| Pitfall | Reality |
|---|---|
| "Just add a `bookable` flag to listings" | Violates DM-7. Use `evaluateListing()` in `src/lib/transactability.ts` |
| "Transactability is the same for all viewers" | Track B (online/on-demand) is **buyer-scoped** — depends on viewer country |
| "The DB is the source of truth in dev" | Dev uses `src/lib/repo/` over in-memory seed unless `DATABASE_URL` is set |
| "Stripe is required to test booking" | Mock payment provider activates when Stripe keys are unset |
| "All 50 cities transact" | Only US cities are transactional; EU/UK/AU are advertising-only index pages |
| "Enquiry-only pages should be noindex" | Violates SEO-4a. Advertising-only city pages with good inventory are fully indexable |
| "Add Offer schema to every profile" | Violates SEO-15. `Offer` only on bookable listings; omit on enquiry-only |
| "FAQPage markup gets rich results" | Google removed FAQ rich results (June 2026). Keep FAQ content visible for AEO; markup is extraction-only |
| "Client-render the page for speed" | Violates SEO-1. AI crawlers don't execute JS — indexable content must SSR |
| "Put this key in `NEXT_PUBLIC_*` so the browser can use it" | `NEXT_PUBLIC_*` is public. Keep secrets server-side and expose a narrow authenticated endpoint |
| "Preview can use production data temporarily" | Preview must use isolated Neon/Upstash resources and scoped credentials |
| "The user can finish setup in the dashboard" | Agents own routine provisioning, configuration, migration, deployment, and verification through MCP/CLI |
