# NG — Non-Goals (§3)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 9 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| NG-1 | done | — | v1 scope policy disables studio back-office and declares interoperability; covered by scope.test.ts |
| NG-2 | done | — | First-party content production disabled in executable v1 scope policy; third-party on-demand remains modelled |
| NG-3 | done | — | Subscription aggregator disabled as a versioned capability, not embedded in listing/payment models |
| NG-4 | done | — | Responsive Next.js web app only; native-mobile capability explicitly disabled and tested |
| NG-5 | in-progress | — | v1 allowlist excludes India and Latin America and market shape is configurable; zero-deploy remote configuration remains NG-5a work |
| NG-5a | in-progress | — | Geo behaviour in typed config modules (src/lib/config/markets.ts); Edge Config wiring pending |
| NG-6 | done | — | No non-US payout rail exists; PAYOUT_ELIGIBLE_COUNTRIES config gate; copy rule noted in dashboard |
| NG-7 | done | — | Discovery remains transactability-independent; scope policy test + fixed SRCH-16 ranking demotion |
| NG-8 | done | — | Off-platform fees/affiliate/lead charges/outcome tracking disabled; outcome-free contact event is tested |
