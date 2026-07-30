# SEO — SEO & AEO Architecture (§7.14)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 16 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| SEO-1 | done | 2 | All indexable routes SSR (force-dynamic via request headers); verified in build output |
| SEO-2 | in-progress | 2 | City hubs have visible linked breadcrumbs plus complete Breadcrumb/ItemList schema; canonical pagination helper tested. City-style + neighbourhood pages pending. FAQPage retained extraction-only after rich-result removal |
| SEO-3 | in-progress | 2 | Person/LocalBusiness/Organization/Article/FAQPage/ItemList/BreadcrumbList emitted; Event/Course pending |
| SEO-4 | done | 2 | Render-time noindex below quality threshold, automatic, non-overridable (src/lib/seo.ts); verified: /us/austin/yoga noindex |
| SEO-4a | done | 2 | Threshold = provider count/verification only; transactability excluded by construction (see cityPageIndexable) |
| SEO-5 | done | 2 | robots explicitly allows named AI crawlers and root llms.txt curates canonical hubs (src/app/robots.ts, src/app/llms.txt/route.ts) |
| SEO-6 | done | 2 | City pages: 40-60 word direct answer, question-shaped H2s, visible FAQ. DEFECT flagged by blog module v1.0: FAQPage markup produces no SERP feature since June 2026 - retained extraction-only, correct wording in parent v1.3 |
| SEO-7 | in-progress | 2 | self-canonical pages plus hreflang/x-default helper implemented/tested; localised route emission pending |
| SEO-8 | done | 2 | Segmented sitemap omits noindexed city hubs; robots links it |
| SEO-9 | in-progress | 2 | exact LCP 2.5s/INP 200ms/CLS 0.1 regression evaluator tested; real-deploy p75 CI enforcement remains external |
| SEO-10 | in-progress | 2 | chain-collapsing permanent redirect and 410 resolver implemented/tested; request routing/persistent slug registry integration pending |
| SEO-11 | done | 2 | robots.ts allows all crawlers incl AI agents; only private surfaces disallowed |
| SEO-12 | in-progress | 2 | programmatic city/provider/style/article templates with override contract implemented/tested; CMS override persistence pending |
| SEO-13 | done | 2 | llms.txt route with curated directory/cities/guides map |
| SEO-14 | in-progress | 2 | GSC/Bing/AI-citation provider adapter contract + authenticated HTTP adapter, normalized observation schema, CTR/position/citation/share-of-voice KPIs and graceful disabled mode implemented/tested; credentials, provider endpoint wiring and production citation evidence remain |
| SEO-15 | done | 2 | schema.org Offer only emitted for bookable listings; advertising-only pages omit Offer (verified in HTML) |
