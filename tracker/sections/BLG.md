# BLG — Editorial & Blog Module (module v1.0)

Baseline: **v1.0** (`docs/requirements/yoga-platform-blog-module-requirements-v1.0.md`). 69 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| BLG-1 | done | B | Article base type with format property (src/lib/editorial/types.ts); 8 formats incl. pillar/comparison/how-to |
| BLG-2 | done | B | clusterId required on Article; gate check 1 blocks publish without a live cluster (gate.ts) |
| BLG-3 | done | B | authorSlug/reviewerSlug separated; reviewer tier modelled (types.ts); rendered in TrustBlock |
| BLG-4 | done | B | datePublished/dateModified/dateReviewed/nextReviewDue on Article + article_revisions table with substantive flag (schema.ts) |
| BLG-5 | done | B | ArticleSource: url/publication/author/year/dateAccessed/claim/archiveUrl; rendered as References; gate requires >=3 |
| BLG-6 | done | B | English-only: self-canonicals on all blog routes, no hreflang; RelatedEditorial suppressed on non-en locales |
| BLG-7 | done | B | /blog rebuilt as pillar-and-cluster library, no chronological feed (blog/page.tsx) |
| BLG-8 | done | B | 7 launch clusters (clusters.ts) each with a published pillar; gate.corpus.test asserts pillar presence |
| BLG-9 | done | B | Volume subordinated to gate: corpus-similarity check + full publish gate block in CI on every published article |
| BLG-10 | done | B | Formats expressed via Article.format on shared base type; comparison/how-to/explainer live in launch corpus |
| BLG-11 | done | B | /blog/topics/[topic] bound to taxonomy TopicEntity slugs via Article.topics (articlesByTopic) |
| BLG-11a | done | B | Single flat /blog/{slug} namespace, one uniqueness pool, topics reserved; gate slug checks (gate.ts item 8) |
| BLG-12 | done | B | Author profiles at /authors/{slug} (authors/[slug]/page.tsx) |
| BLG-13 | done | B | Slug pattern enforced by gate (lowercase-hyphen, keyword-bearing); no dates in URLs |
| BLG-14 | in-progress | B | Slugs of 6 pre-module posts preserved verbatim in migration (posts.ts); redirect map exists for providers (slugRedirects) - blog rename tooling not yet wired to it |
| BLG-15 | done | B | Topic archives are noindex,follow via metadata robots (topics/[topic]/page.tsx); verified in smoke test |
| BLG-16 | done | B | Blog home groups by cluster with pillar hero; no date-based pagination as primary nav |
| BLG-17 | done | B | Sitemap segment with lastmod=dateModified (substantive-change definition BLG-63); decayed noindex articles omitted (sitemap.ts) |
| BLG-18 | in-progress | B | 11 workflow states modelled (ArticleState) + article_transitions audit table; workflow tooling/UI not built in v1 - states are data |
| BLG-19 | in-progress | B | AI-assisted drafting flagged per-article (aiAssisted) and disclosed in footer + policy; production pipeline itself is an ops process |
| BLG-20 | done | B | 3 named authors with public profiles, credentials, sameAs (authors.ts); no personas - gate blocks unknown authors |
| BLG-21 | done | B | 13-check machine gate as pure functions (gate.ts), enforced in CI via pnpm editorial:gate; no manual override; CWV/a11y items run as Lighthouse CI at build level |
| BLG-22 | done | B | Two-tier reviewer standard: practice (Koji Yamada RYT-500) vs clinical (Dr. Leila Haddad DPT); gate blocks practice-tier sign-off on clinical phrases |
| BLG-23 | blocked | B | Volume cap needs Decision B1 (real expert-review capacity); gate architecture ready - cap is config |
| BLG-24 | done | B | nextReviewDue on every article (6mo fast-moving/12mo evergreen); overdue demoted in RelatedEditorial ordering, 6mo overdue -> noindex + sitemap omission (store.ts reviewStatus) |
| BLG-25 | done | B | proposeEntityLinks detects taxonomy terms + city names, proposals editor-approved only, never auto-inserted (linking.ts) |
| BLG-26 | done | B | Gate item 6 blocks publish without >=3 internal links incl >=1 commercial; launch corpus links city hubs/directory/profiles |
| BLG-27 | done | B | RelatedEditorial module on city hubs (editorialForCity) and style-filtered directory (editorialForStyles); suppressed on non-en locales |
| BLG-28 | done | B | anchorDistributionWarnings: per-destination anchor share tracking, warn-only per Appendix B item 13 (linking.ts + test) |
| BLG-29 | done | B | Author.teacherSlug links byline to /teachers/{slug}; teacher profiles surface authored/reviewed guides (provider-page.tsx) |
| BLG-30 | done | B | /authors/[slug]: indexable, Person+ProfilePage+EducationalOccupationalCredential schema, CRD-style credential display, authored+reviewed lists |
| BLG-31 | done | B | Author archives = authored/reviewed lists on the author profile page |
| BLG-32 | done | B | TrustBlock under H1: author link+credentials, reviewer link+credentials+review date, published/updated dates (editorial.tsx) |
| BLG-33 | done | B | References block renders structured citations with claim + accessed date + archive link (ReferenceList) |
| BLG-34 | done | B | Verifiable-source rule enforced editorially + gate requires all source fields; policy states no-source-no-publish |
| BLG-35 | done | B | AnswerBlock 40-60 words rendered first after H1 (template guarantees BLG-64); gate blocks out-of-range counts |
| BLG-36 | done | B | Article + BreadcrumbList + extraction-only FAQPage JSON-LD with author/reviewedBy Persons and Organization publisher; never described as rich-result mechanisms |
| BLG-37 | done | B | Question-shaped H2s across corpus; gate warns on non-question headings |
| BLG-38 | done | B | ComparisonTable in section model; YTT hours table, retreat-type table, income-stream table in launch corpus |
| BLG-39 | done | B | FAQ blocks with fragment-addressable ids (scroll-mt anchors), self-contained 40-80w answers; pillars carry 4-5 Qs; FAQPage Question urls carry #fragment |
| BLG-40 | in-progress | B | Citation-monitoring is external ops tooling; event taxonomy + reported-metric ordering defined; panel not built in v1 |
| BLG-41 | done | B | llms.txt lists all 7 pillars with one-line summaries + editorial policy (llms.txt/route.ts) |
| BLG-42 | done | B | article_view (server) + article_commercial_click (beacon via /api/analytics) events; blog session touch cookie for path attribution |
| BLG-43 | done | B | booking_confirmed carries blogAssisted/blogArticle from 7-day first-party touch (attribution.ts + actions/booking.ts); assisted bookings are the reported number, not last-click |
| BLG-44 | in-progress | B | Decay inputs modelled (nextReviewDue, reviewStatus current/overdue/noindex); dashboard itself is ops tooling, not built in v1 |
| BLG-45 | done | B | No affiliate links, no sponsored posts anywhere in corpus; prohibition stated in editorial policy (NG-8/COMP-11 rationale) |
| BLG-46 | done | B | AI-assistance disclosure at /legal/editorial-policy, linked from every article footer with per-article provenance line |
| BLG-47 | done | B | High-risk phrase list (disclaimers.ts) flags claims for legal check; sources required on all health claims; evidence framed honestly (Goyal 2014 etc.) |
| BLG-47a | done | B | Approved copy in DISCLAIMER_COPY (standard/high-risk/inline/footer); adjacency enforced - gate requires inline qualifier in flagged section, not just footer |
| BLG-48 | done | B | Breathwork post carries WVR-7-mirroring warnings; prenatal warning language written by editorial under clinical review (styles/safety pillar) |
| BLG-48a | done | B | Corrections policy + public log section at /legal/editorial-policy#corrections, linked from every article footer; corrections never silent |
| BLG-49 | done | B | No newsletter signup or non-essential tracking on blog; analytics inherit ANL governance (first-party, no pre-consent trackers) |
| BLG-49a | deferred | B | Newsletter inherits MSG-6 in full; lands with the notification/marketing build-out, not v1 blog |
| BLG-50 | done | B | Comments deliberately absent in v1 per spec (moderation load + UGC spam surface); revisit with TSF-3 capacity |
| BLG-51 | done | B | Blog routes inherit the SEO-9 Lighthouse CI budget (LCP<2.5s/INP<200ms/CLS<0.1); static SSG output, no client body |
| BLG-52 | done | B | Articles statically generated via generateStaticParams; body is server-rendered RSC, zero client-side article rendering |
| BLG-53 | done | B | Article in <main> (site layout), single h1, strict h1>h2 order, no skipped levels, no styling headings |
| BLG-54 | done | B | No interstitials, popups or newsletter modals anywhere on blog routes |
| BLG-55 | n-a | B | Launch corpus is deliberately text-first: no editorial images shipped in v1; licence metadata rules recorded in BLG-58 for when images arrive |
| BLG-56 | done | B | Semantic templates in src/components/site/editorial.tsx (dl for FAQ, scoped th, aria-labelled disclaimer); independent WCAG 2.2 AA audit dissolved per owner decision 29 Jul 2026 (NFR-5 memo) |
| BLG-57 | in-progress | B | Revision model (article_revisions with substantive flag + transitions audit) in schema; CMS UI (scheduled publish, preview, diff, rollback) not built - content is in-repo typed data in v1 |
| BLG-58 | done | B | Licence metadata rule recorded; AI imagery constraints (no real persons, no anatomical illustration) in policy; zero images shipped so constraint holds by construction |
| BLG-59 | done | B | Outbound links default followed rel, target=_blank+noopener in References; archiveUrl snapshots on key sources; link-rot monitoring rides BLG-24 review queue |
| BLG-60 | done | B | OG type=article with published/modified time + author profile URL + twitter card on every article (generateMetadata); share-image generation deferred with WEB-2 |
| BLG-61 | done | B | Author.state former keeps bylines with former-contributor display; COMP-4 erasure path documented on editorial_authors (profileConsentAt, soft delete) |
| BLG-62 | done | B | Article.topics bind to LST-12 slugs; topic archives resolve labels via allStyleTerms so term renames re-resolve rather than break |
| BLG-63 | done | B | Substantive-change definition encoded: dateModified moves by editor declaration (substantive flag on article_revisions), validated against diff not inferred |
| BLG-64 | done | B | Deterministic first-screen proxy: template renders AnswerBlock immediately after H1 (only breadcrumb+label precede); gate asserts block presence/length |
| BLG-65 | in-progress | B | aiAssisted provenance recorded per article + no-personal-data-in-models rule in policy; approved-tools register + DPIA entry are legal-ops artefacts |
