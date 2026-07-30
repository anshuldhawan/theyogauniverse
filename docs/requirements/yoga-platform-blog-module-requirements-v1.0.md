# Product Requirements — Editorial & Blog Module

**Version:** 1.0
**Date:** 28 July 2026
**Status:** Draft for review
**Parent document:** Global Yoga & Meditation Platform, Requirements v1.2
**Audience:** Engineering, Content/Editorial, SEO, Design, Legal, Data
**Requirement prefix:** `BLG`

---

## 0. Relationship to the parent specification

This module expands **SEO-13** ("Blog CMS with author profiles (E-E-A-T), review/update dates, editorial workflow, and structured data") from a single line into a buildable specification. It inherits and does not restate:

| Inherited from v1.2 | Applies how |
|---|---|
| **SEO-1** server-side rendering | Every blog URL is SSR or SSG. Non-negotiable — AI crawlers largely do not execute JavaScript. |
| **SEO-2** page architecture | BLG-11 extends the blog rows. Note the FAQPage correction above. |
| **SEO-4** thin-page suppression | Extended to editorial content by **BLG-21**. This is the load-bearing control for the AI-assisted production model. |
| **SEO-5** AI crawler allow-list, `/llms.txt` | Blog paths explicitly allowed; hub pages listed in `/llms.txt`. |
| **SEO-6** AEO content structure | **BLG-35, BLG-37, BLG-38 and BLG-39 are SEO-6 applied to editorial pages**, at the same 40–60 word answer length. They add enforcement and structure; they do not introduce a new principle. |
| **SEO-7** hreflang | Blog is English-only in v1 (BLG-6). Emit self-referencing canonicals only — **`hreflang` and `x-default` annotations are meaningless in a single-language subtree** and must not be emitted until BLG-6 is lifted. |
| **SEO-9** Core Web Vitals budget | Applies unchanged. CI fails the build on regression, blog included. |
| **SEO-11** internal linking engine | The blog is a first-class node in it (BLG-25 … BLG-28). |
| **SEO-14** AI-citation monitoring | Extended into the primary success metric by **BLG-40**. |
| **NG-8** no facilitation of off-platform transactions | Constrains affiliate and sponsored content (BLG-45). |
| **COMP-1, COMP-5, ANL-5** GDPR, consent, tracking | Apply to blog readers identically. |
| **NFR-5 / COMP-12** WCAG 2.2 AA | Applies to all editorial templates and embedded media. |

**Scope decisions carried in from stakeholder review (28 July 2026):**

| Decision | Resolution |
|---|---|
| Authorship model | **AI-assisted, human-edited, high volume.** Target range 20–50 posts/month — **an aspiration, not a commitment.** The binding number is the review-capacity cap in BLG-23, which is undecided (Open Decision B1). Do not plan headcount or traffic forecasts against 20–50 until B1 is answered. |
| Languages | **English only at launch.** Architecture must not preclude more (NG-5a). |
| Marketplace integration | **Deep.** The blog is a hub in the internal link graph, not a satellite. |
| Primary success metric | **AI citation share + assisted bookings**, not sessions or last-click. |

> ⚠️ **Read BLG-18 through BLG-22 before anything else.** The chosen production model — high-volume AI-assisted content — is the single riskiest decision in this document. **Scaled content abuse** (large volumes of pages produced with little value) is among the most aggressively enforced of the three spam policies Google introduced in March 2024, and it is enforced algorithmically rather than by manual action. Google evaluates **usefulness, not production method**, so AI assistance is explicitly permitted — the violation is content produced primarily to manipulate rankings rather than help users. Unedited mass production invites demotion, and damage to the blog propagates to the directory that is the actual business. The editorial gate in BLG-18…BLG-22 is what makes this model survivable. It is not process overhead to be trimmed when velocity targets are missed.

> ⚠️ **FAQPage and HowTo rich results no longer exist.** This changes how several requirements below must be read, and it also invalidates two requirements in the parent document.
> - Google restricted FAQ rich results to government and health sites in August 2023, then **deprecated them entirely in May 2026 and removed the search appearance, the Search Console report and Rich Results Test support in June 2026.**
> - **HowTo** rich results were removed from mobile in August 2023 and desktop in September 2023.
>
> **Consequence:** `FAQPage` and `HowTo` markup produce **zero Google SERP features**. We still emit both — they remain useful for LLM extraction and for non-Google consumers — but they must never be described as rich-result mechanisms, must not be listed as *primary* schema (BLG-11), and **cannot be validated by the Rich Results Test**, which no longer accepts them (BLG-21 item 8).
>
> **Parent document defect:** v1.2 **SEO-2** lists `FAQPage` as primary schema for City × style and Blog pages, and **SEO-6** requires "an FAQ block with `FAQPage` markup" as an AEO mechanism. Both were written against the pre-deprecation position. Raise as a correction to v1.2; the visible FAQ content remains correct, the stated mechanism does not.

---

## 1. Purpose

The directory is the primary organic asset; the blog is its **authority engine**. It exists to do three things, in priority order:

1. **Win citations in AI answer engines.** Google AI Overviews, Perplexity, ChatGPT Search and Copilot increasingly answer informational yoga queries without a click. Being the cited source is the modern equivalent of ranking first, and it is a different optimisation problem from blue-link SEO.
2. **Pass authority to commercial pages.** City hubs, style pages, teacher profiles and retreat listings are what generate GMV. Editorial content that does not link into them is a cost centre.
3. **Establish topical authority for the domain.** LLMs weight topical authority across many pages more heavily than individual backlinks. Comprehensive coverage of yoga, meditation and breathwork is what makes the domain a default source.

**Explicit non-goal:** the blog is not a traffic vanity project. A post that ranks, earns zero citations and links to nothing is a failure under BLG-40 even if it draws sessions.

---

## 2. Content Model

### 2.1 Entities

```
Article ──┬── Author (Person)          ── AuthorProfile page
          ├── Reviewer (Person)        ── credentialed, may differ from Author
          ├── ContentCluster           ── pillar + supporting posts
          ├── TopicEntity[]            ── links to taxonomy terms (LST-12)
          ├── LinkedEntity[]           ── city / style / teacher / studio / retreat
          ├── FAQBlock[]               ── question + answer, individually addressable
          ├── AnswerBlock              ── the 40–60 word extractable definition
          ├── Source[]                 ── external citation, with date accessed
          └── Revision[]               ── immutable history, drives dateModified
```

- **BLG-1.** `Article` is the base type. Content **formats** are a property, not a subclass: `pillar`, `cluster`, `comparison`, `how-to`, `explainer`, `data-study`, `news`, `interview`.
- **BLG-2.** Every Article belongs to exactly one **ContentCluster** and links to its pillar. Orphan posts are not publishable — the publish gate (BLG-21) rejects them.
- **BLG-3.** `Author` and `Reviewer` are distinct roles on every Article and may be different people. This separation is what makes the AI-assisted model defensible: a staff editor may be the Author while a credentialed practitioner is the Reviewer.
- **BLG-4.** Every Article stores `datePublished`, `dateModified`, `dateReviewed`, and `nextReviewDue`. `dateModified` updates **only on substantive change** — never on a CSS deploy, a template change or a bulk re-render. Fake freshness signals are detectable and corrosive.
- **BLG-5.** `Source[]` is structured: URL, publication, author, publication date, date accessed, and the specific claim it supports. Sources render as a visible References block (BLG-33) and are not merely inline links.
- **BLG-6.** **English only in v1.** The content model, URL structure, hreflang emission and translation fields must all exist and be exercised for `en` alone, so that adding a language is a content operation rather than a schema migration (NG-5a).

### 2.2 Content clusters

- **BLG-7.** The blog is organised as **pillar-and-cluster**, not as a reverse-chronological feed. One comprehensive pillar page per major topic, 5–15 supporting posts beneath it, bidirectionally linked. This structure is what produces topical authority; a chronological blog produces none.
- **BLG-8.** Launch clusters, each with a pillar:
  - *Practice fundamentals* — styles explained, what to expect, how to start, props, etiquette
  - *Teacher training* — 200/300/500-hour, choosing a school, accreditation, cost, career outcomes
  - *Retreats* — choosing, budgeting, solo travel, what's included, destinations, first-timer guidance
  - *Meditation & breathwork* — techniques, evidence, safety, getting started
  - *Safety, injury & accessibility* — contraindications, adaptive practice, prenatal, trauma-informed
  - *Teaching as a business* — for the supply side; doubles as a claim-conversion surface (ING-6)
  - *City & destination guides* — the bridge between editorial and the 50 city hubs
- **BLG-9.** A cluster's pillar must exist and be published **before** any supporting post in that cluster. Enforced by the publish gate.
- **BLG-10.** Cluster membership drives automated internal linking (BLG-25) and the related-content modules on both blog and marketplace pages.

---

## 3. URL & Page Architecture

- **BLG-11.** URL patterns — flat, keyword-bearing, no dates, no category nesting:

  | Page type | URL | Primary schema |
  |---|---|---|
  | Blog home | `/blog` | `Blog`, `BreadcrumbList` |
  | Pillar page | `/blog/{slug}` | `Article`, `BreadcrumbList` (+ `FAQPage`, extraction-only) |
  | Standard post | `/blog/{slug}` | `Article`, `BreadcrumbList` (+ `FAQPage`, extraction-only) |
  | How-to post | `/blog/{slug}` | `Article` (+ `HowTo`, extraction-only) |
  | Data study | `/blog/{slug}` | `Article` + `Dataset` |
  | Author profile | `/authors/{slug}` | `Person`, `ProfilePage` |
  | Topic archive | `/blog/topics/{topic}` | none — `noindex` by default (BLG-15) |

  **"Extraction-only"** means the markup is emitted for LLM parsing and non-Google consumers and produces no Google SERP feature. It is never the primary schema and never the justification for a requirement.

- **BLG-11a. Slug namespace.** Pillar pages and standard posts share the `/blog/{slug}` namespace, so slugs are allocated from **one uniqueness pool** across both. `topics` is a **permanently reserved segment** and cannot be used as a post slug. Because BLG-14 makes slugs immutable once indexed, a collision is unrecoverable — enforce reservation and uniqueness at creation, not at publish.

- **BLG-12.** **No dates in URLs.** Evergreen content is the strategy; a 2026 stamp in the path suppresses clicks on a post updated in 2028.
- **BLG-13.** **No category directory in the path.** A post's cluster can change; its URL cannot (BLG-14). Cluster membership is expressed through breadcrumbs, internal links and schema, not the URL.
- **BLG-14.** Slugs are immutable once indexed. Renames issue a permanent 301, retain the old slug forever, and never chain (SEO-10).
- **BLG-15.** **Topic archives are `noindex, follow` by default** and become indexable only when they carry unique curatorial copy of 150+ words and 5+ published posts. Paginated archive pages beyond page 1 are always `noindex, follow`. Thin archive pages are the most common source of index bloat on a content site.
- **BLG-16.** Blog home is indexable but is **not** the primary entry point and must not be optimised as one. Pillar pages carry the head terms.
- **BLG-17.** Blog is included in the segmented XML sitemap index (SEO-8) as its own segment, with `lastmod` reflecting real content change per BLG-4.

---

## 4. Editorial Workflow & the Quality Gate

> This section is the reason the chosen production model is viable. Its requirements are quality controls, not bureaucracy.

- **BLG-18.** **Workflow states:** `brief → drafting → editing → expert review → SEO/AEO check → legal check (conditional) → scheduled → published → in review → updated | retired`. Every transition is audit-logged with actor and timestamp.
- **BLG-19.** **The brief comes first, and a human writes it.** No draft may be generated without an approved brief containing: target query cluster, search intent classification, the specific question the post answers, the audience, the required unique angle, the cluster it belongs to, and the marketplace entities it must link to. **A brief that cannot articulate a unique angle is rejected at brief stage** — that is the cheapest possible place to kill a thin post.
- **BLG-20.** **Named human accountability on every post.** AI may assist drafting. A named human editor is recorded as Author and is accountable for accuracy. The byline must never be a fabricated persona, an AI, or a generic "Editorial Team" on substantive content. Fabricated author identities are both an E-E-A-T failure and a straightforward credibility risk in a health-adjacent topic.
- **BLG-21.** **Publish gate — automated, blocking, non-overridable by the content team.** An Article cannot reach `published` unless **all** of the following pass:
  1. Assigned to an existing, published ContentCluster with a live pillar (BLG-2, BLG-9).
  2. Named Author with a populated author profile page (BLG-30).
  3. **Named Reviewer with a verified credential** for any post touching practice instruction, safety, contraindications, injury, prenatal, therapeutic application, or health claims (BLG-22).
  4. An `AnswerBlock` of 40–60 words present within the first screen (BLG-35).
  5. At least 3 outbound links to authoritative external sources, each with a structured `Source` record (BLG-5).
  6. At least 3 internal links, of which **at least one resolves to a commercial marketplace page** — city hub, style page, teacher, studio, or listing (BLG-26).
  7. Unique-content check: passes a similarity threshold against both the existing corpus and the top-ranking pages for the target query. Near-duplicate or paraphrase-of-competitor content is rejected.
  8. Valid structured data, zero errors. **Validate against the Schema.org Markup Validator, not the Rich Results Test** — the latter no longer accepts `FAQPage` or `HowTo` and cannot serve as a blocking check for types it has dropped (BLG-36).
  9. Meets the CWV budget in a pre-publish synthetic run (SEO-9).
  10. Accessibility check: heading order, alt text present on every image, contrast (NFR-5).
  11. **Medical disclaimer present and correctly placed** where the post's topic or a detected high-risk claim phrase requires it: top-of-post block, plus at least one inline qualifier within the section containing the flagged phrase (BLG-47a). Blocking.
  12. *(Conditional)* High-risk health-claim phrases detected → routed to mandatory legal check before the gate can pass (BLG-47).
  13. *(Warn only)* Anchor-text distribution within threshold (BLG-28). Surfaces to the editor; does not block.

  Items 1–11 are **hard blocks**. Item 12 blocks only until legal review clears. Item 13 never blocks.

  **Ops and Editorial cannot override the gate.** Only an Engineering-owned config change can, and each override is logged and reported monthly. Velocity pressure will produce requests to soften this; the gate exists precisely for those moments.
- **BLG-22.** **Expert review is mandatory for YMYL-adjacent content, at two distinct tiers.** Yoga, breathwork and meditation content routinely touches injury risk, pregnancy, mental health and physical safety. The reviewer standard depends on what is being claimed:

  | Content type | Required reviewer |
  |---|---|
  | Practice instruction, technique, safety cues, alignment, contraindication *awareness* | **Registry-verified credential** (CRD-1, registry-verified tier) — RYT-500, senior lineage authorisation, or equivalent |
  | Medical, therapeutic, clinical or physiological claims; pregnancy; mental health; injury rehabilitation | **Appropriate clinical qualification** — physiotherapist, physician, registered midwife, licensed mental-health professional |

  **This distinction is not optional.** Parent CRD-6 and Appendix C are emphatic that RYT/RYS is a voluntary registry designation and **not** a licence or clinical certification, and BLG-31 repeats it. Displaying an RYT-500 in the trust block as the reviewer of a prenatal contraindication article implies exactly the clinical authority CRD-6 forbids us from implying. The reviewer's name, credential and review date render on the page (BLG-32), and the credential shown must be the one that actually supports the claims made.

  Reviewers are compensated. This is a real cost line, not a favour — and the clinical tier is meaningfully more expensive than the practice tier, which is a direct input to the BLG-23 volume cap.
- **BLG-23.** **Volume ceiling tied to review capacity.** Monthly publishing volume is **capped at what the expert-review and editing pipeline can genuinely absorb**, configured as an explicit number, not an aspiration. If the cap is 30 and the demand is 50, 30 publish. Publishing beyond review capacity is exactly the pattern scaled-content-abuse enforcement targets.
- **BLG-24.** **Scheduled content review.** Every Article carries `nextReviewDue` — 6 months for fast-moving topics (accreditation rules, pricing, regulations), 12 months for evergreen. Overdue posts are flagged to Editorial, then **automatically demoted in internal linking** and finally `noindex`ed if 6 months past due. Mirrors the ING-9 freshness discipline applied to the index. Retire and 410 content that is no longer accurate rather than leaving it live (SEO-10).

---

## 5. Internal Linking & Marketplace Integration

> The highest-leverage requirements in this document. The blog's strategic purpose is passing authority to pages that generate GMV.

- **BLG-25.** **Automated entity linking.** On save, the system detects taxonomy terms (LST-12: styles, modalities, meditation and breathwork techniques), city names, and named providers in the body, and proposes internal links to the corresponding marketplace pages. **Proposals are editor-approved, never auto-inserted** — automatic anchor insertion produces nonsense links that read as manipulation and degrade the page for human readers and LLMs alike.
- **BLG-26.** **Minimum one commercial link per post**, enforced at the gate (BLG-21.6). A post about choosing a first Vinyasa class links to the Vinyasa style hub and to at least one city page.
- **BLG-27.** **Reverse surfacing — marketplace pages pull in editorial.** City hubs, style pages and retreat destination pages each render a related-content module drawn from the matching ContentCluster. This is where the authority actually flows to revenue, and it thickens marketplace pages against the SEO-4 threshold with genuinely useful content rather than filler.
  - **Cross-language behaviour, since the blog is English-only (BLG-6) and marketplace pages exist in seven languages (LOC-1):** the related-content module is **suppressed on non-`en` locales** in v1. Do not render English cards on a German city hub, and do not machine-translate editorial into the module. Both options degrade the page and the second creates the cross-language duplication SEO-7 warns against. Revisit when B5 is decided.
- **BLG-28.** **Anchor text variety is enforced.** The linking engine tracks anchor text distribution per destination URL and warns when exact-match anchors exceed a configured share. Uniform exact-match internal anchors are a recognisable manipulation pattern.
- **BLG-29.** **Author-to-profile linking.** Where a post is written or reviewed by a teacher who has a profile on the platform, the byline links to `/teachers/{slug}` and the teacher profile surfaces their authored posts. This is a genuine E-E-A-T signal — demonstrable practice experience attached to editorial — and it is a supply-side engagement hook, including in the 30 advertising-only cities where DASH-7 and profile ownership are the only claim incentives (parent Decision #14).

---

## 6. E-E-A-T & Author Infrastructure

- **BLG-30.** **Author profile pages at `/authors/{slug}`**, indexable, carrying: full name, photo, role, credentials with issuing body, years of practice and teaching, areas of expertise, education, external publications, social and professional links, link to their teacher profile where applicable, and a complete list of authored and reviewed posts. `Person` schema with `sameAs` to authoritative external profiles.
- **BLG-31.** **Credential display is honest and tiered**, reusing CRD-1's vocabulary. Never imply state certification or clinical licensure where none exists (CRD-6). Legal reviews all credential copy on author pages, exactly as it does for provider badges.
- **BLG-32.** **Visible trust block on every post**, above the fold or immediately below the answer block: author name + credential, reviewer name + credential where applicable, published date, last updated date, medically/practice reviewed date. These are the specific signals both Google's quality raters and LLM retrieval favour.
- **BLG-33.** **Visible References section** at the foot of every substantive post, rendered from `Source[]`. Not a formality: external citation of authoritative sources is a measurable trust signal for AI retrieval, and it is the difference between an article that reads as researched and one that reads as generated.
- **BLG-34.** **Organisation entity consistency.** `Organization` schema on the homepage, `publisher` on every Article, consistent naming and logo across all surfaces, `sameAs` to established external profiles. Brand entity strength is among the strongest observed predictors of LLM citation — arguably stronger than backlinks — so brand consistency is an SEO requirement here, not a design preference.

---

## 7. AEO — Answer Engine Optimization

> Optimising to be **extracted and cited**, which is a different problem from ranking.
>
> **The one well-evidenced finding to design around:** an analysis of roughly 1.2 million ChatGPT answers found **44% of citations drawn from the first 30% of a page's text** — the "ski ramp" distribution. Note this is ChatGPT-specific and should not be over-generalised to all engines, but the direction is consistent enough to justify front-loading the page. That single finding is the basis for BLG-35.
>
> **What the evidence does not support:** that structured data independently increases LLM citation. Vendor claims of a 30–40% uplift have no published methodology; an Ahrefs study tracking 1,885 pages that added schema found AI citations barely moved, and a separate analysis across OpenAI, Gemini and Perplexity found no correlation. **Emit schema because it aids parsing and because it is cheap — not because it will win citations.** This matters: BLG-21 item 8 makes schema validity a blocking gate, and that gate should be justified on correctness grounds, not on a contested performance claim.

- **BLG-35.** **AnswerBlock — mandatory, 40–60 words, within the first screen.** A direct, self-contained answer to the post's core question, stated before any preamble. It must name the topic explicitly rather than relying on the title for context, define jargon inline on first use, and be comprehensible with zero surrounding text. This is a structured field in the CMS, not a styling convention, so it can be validated at the gate and reused in schema.
- **BLG-36.** **Structured data per format**, validated at publish against the Schema.org Markup Validator with zero errors:

  | Type | Applied to | Google SERP effect |
  |---|---|---|
  | `Article` | All posts, with `author`, `reviewedBy`, `datePublished`, `dateModified`, `publisher`, `mainEntityOfPage` | Yes — supported |
  | `BreadcrumbList` | All pages | Yes — supported |
  | `Person`, `ProfilePage` | Author pages | Yes — supported |
  | `Dataset` | Original research | Yes — Dataset Search |
  | `FAQPage` | Posts with visible FAQ blocks | **None. Deprecated May 2026, removed June 2026.** Emitted for LLM extraction only. |
  | `HowTo` | Step-based posts | **None. Deprecated 2023.** Emitted for LLM extraction only. |

  - **Never emit schema for content not visibly present on the page.** Mirrors the parent's SEO-3 position on `AggregateRating`.
  - **Do not spend engineering effort chasing deprecated rich results.** If `FAQPage` emission ever becomes non-trivial to maintain, drop it — the visible FAQ block (BLG-39) is doing the real work.
- **BLG-37.** **Question-shaped H2s.** Subheadings phrased as questions users actually ask, sourced from real query data and People Also Ask, not invented. Each section answers its own heading in the first sentence — inverted pyramid within every section, not just at the top.
- **BLG-38.** **Extraction-friendly formatting, applied deliberately:**
  - Numbered lists for processes and sequences
  - Bullets for unordered facts
  - **Tables for every comparison** — styles, training hours, retreat types, price bands. LLMs extract tables reliably and cite them disproportionately.
  - Statistics stated with source and year in the same sentence, so the claim survives extraction: "According to Yoga Alliance (2025), …"
  - Bold lead-ins on list items
- **BLG-39.** **Visible FAQ block on every substantive post** — 5–10 genuine questions sourced from real query data, each answered in 40–80 self-contained words, individually addressable via fragment IDs so a citation can deep-link to a single answer. `FAQPage` markup is emitted for extraction (BLG-36) but produces **no Google rich result** and is not the reason to build this. The reason is that self-contained Q&A blocks are among the most reliably extracted and cited structures in LLM retrieval, and they answer the follow-up questions a reader has anyway.
- **BLG-40.** **AI-citation monitoring as the primary KPI**, extending SEO-14. Track, per target query cluster and over time:
  - Citation presence in Google AI Overviews, Perplexity, ChatGPT Search and Copilot
  - Which specific URL and which passage was cited
  - Share of voice against named competitors
  - Correlation between citation and assisted bookings (BLG-42)

  Instrument this from day one. Content decisions are made against it, and it is the metric that survives AI Overviews absorbing informational clicks. Note honestly that citation tracking is sampled and noisy: track directional trend across a fixed query panel, not a precise number.
- **BLG-41.** **`/llms.txt` maintenance.** The blog's pillar pages and cluster structure are listed in the root `/llms.txt` (SEO-5), regenerated on publish. Treat this as cheap insurance, not a proven ranking factor — adoption is broad but no major AI platform has confirmed consuming it, and the observed citation effect is currently marginal. Do not trade real work for it.

---

## 8. Measurement

- **BLG-42.** **Assisted-booking attribution.** Multi-touch attribution crediting any blog session in the path to a booking, with a configurable lookback window long enough for the high-ticket motion — retreat and training research journeys run weeks to months. Last-click attribution systematically undervalues editorial and must not be the reported number.
- **BLG-43.** **Reported metrics**, in priority order: AI citation share; assisted bookings and assisted GMV; commercial-page sessions originating from blog internal links; pillar-page rankings for head terms; provider claims attributed to blog sessions (supply-side value, parent Decision #14); organic sessions **last**, and explicitly framed as diagnostic rather than as a goal.
- **BLG-44.** **Content-decay dashboard.** Per post: traffic trend, citation trend, ranking trend, days since review, days overdue. Drives the BLG-24 review queue. On a high-volume programme, systematic updating outperforms continuous new production within roughly a year.

---

## 9. Commercial, Legal & Compliance Constraints

- **BLG-45.** **No affiliate links and no sponsored posts in v1.**
  - **NG-8** forbids monetising or facilitating off-platform transactions, and that constraint is what keeps the platform outside DAC7, the UK digital-platform reporting rules and the Australian SERR (parent PAY-12, PAY-17a). An affiliate link on a post about Bali retreats is precisely the paid-facilitation signal the parent doc removed on purpose.
  - Sponsored or paid placement within editorial would additionally engage COMP-11 labelling and sits badly with parent Decision #4 (no paid placement in v1).
  - **Any future proposal to monetise the blog directly goes to Legal before Product.** Record against this requirement.
- **BLG-46.** **AI-assistance disclosure.** A clear, standing statement of editorial policy — how content is produced, how it is reviewed, and by whom — published at a stable URL and linked from every post. Google does not require disclosure of AI assistance, but a transparent, specific policy is a genuine trust signal for readers and raters, and it removes the risk of the practice surfacing as an exposé rather than as a stated position.
- **BLG-47.** **Health-claim discipline.** No therapeutic or medical claims without a cited source, and none at all where the evidence does not support them. Yoga and breathwork content attracts confident overstatement about anxiety, depression, blood pressure and fertility. Legal reviews the claim-language guidelines; Editorial applies them at the review stage; the gate flags a configured list of high-risk claim phrases for mandatory legal check (BLG-18).
- **BLG-47a. Medical disclaimer — placement, wording and limits.**

  **The principle:** the disclaimer must sit **adjacent to the claim it qualifies**, not only in a footer. A footer disclaimer is weak legally, invisible practically, and — specific to this module — **does not survive extraction**. When an AI engine lifts a passage about breathwork and blood pressure, it lifts that passage; a disclaimer 2,000 words below it does not travel with the citation. Adjacency is an AEO requirement as much as a legal one.

  **Placement rules:**

  | Location | Requirement |
  |---|---|
  | **Top of post**, immediately below the trust block | **Required** on any post touching injury, pregnancy, postnatal, mental health, medication, medical conditions, therapeutic application, or contraindications. Visually distinct, not collapsed, not behind a toggle. |
  | **Inline, at the specific claim** | **Required** wherever a physiological, therapeutic or clinical claim is made — in the same section, within a sentence or two of the claim. This is the placement that matters most. |
  | **FAQ answers** (BLG-39) | **Required** within any individual answer that addresses a health question. Each answer is independently extractable and must carry its own qualifier. |
  | **AnswerBlock** (BLG-35) | Required where the answer itself is health-related — and it must fit inside the 40–60 words, not extend them. If the qualifier will not fit, the topic is too clinical for a blog answer block; restructure it. |
  | **Footer of every post** | A single standing line linking to the editorial and medical policy page. Necessary, but explicitly **not sufficient**. |
  | **Newsletter** (BLG-49a) | Required on any health-related send. |
  | **Editorial policy page** (BLG-46) | Full statement, at a stable URL, linked from every post. |
  | **Posts with no health dimension** | **Not applied.** "How to choose a yoga mat" or "what to pack for a retreat" get no disclaimer. |

  **On that last row — do not apply this to every post.** A blanket disclaimer on all 20–50 posts a month produces disclaimer blindness, at which point the ones that matter are ignored too. Scope it by topic, enforced at the gate.

  **Approved copy — plain language, no hedging jargon:**
  - *Standard (top of post):* "This article is for general information and is not medical advice. Yoga, breathwork and meditation affect people differently. **Please consult your doctor** before starting or changing a practice, especially if you are pregnant, recovering from injury or illness, or managing a health condition."
  - *Inline (at a claim):* "Research on this is early and mixed — **please consult your doctor** about what is appropriate for you."
  - *High-risk formats* (breathwork protocols, ice exposure, hot yoga, inversions, aerial; see BLG-48): "This practice carries specific risks and is not suitable for everyone. **Please consult your doctor** before trying it, particularly with cardiovascular conditions, epilepsy, pregnancy, or a history of fainting."
  - *If a reader is in distress:* where a post touches mental health, include a line pointing to appropriate support alongside the disclaimer. Do not leave a reader who arrived in difficulty with a legal notice and nothing else.

  **What the disclaimer does not do — write this on the wall:**
  - It does **not** substitute for accuracy. A wrong claim with a disclaimer is still a wrong claim.
  - It does **not** substitute for the clinical reviewer tier in BLG-22. Never accept "we'll add a disclaimer" as an alternative to expert review.
  - It does **not** transfer liability. Under EU and UK consumer law liability for harm is largely non-excludable, and parent **COMP-10** and **COMP-13** apply. Legal owns the wording; Editorial owns the placement.
  - It does **not** license stronger claims elsewhere in the piece.

  **Gate enforcement:** BLG-21 item 11 already routes high-risk claim phrases to legal review. Extend the same phrase list to **assert disclaimer presence and placement** — top-of-post block present, and at least one inline qualifier within the section containing a flagged phrase. Blocking.

- **BLG-48.** **Contraindication cross-linking.** Any post covering a high-risk format must link to the corresponding safety content and must not contradict the product's own safety messaging.
  - For **breathwork and hyperventilation protocols, ice exposure, hot yoga, inversions and aerial**, mirror the pre-booking warnings under parent **WVR-7**.
  - For **prenatal, postnatal and therapeutic practice**, note that WVR-7 does *not* cover these — they are handled via mandatory health intake under **WVR-3**. Editorial must therefore write its own warning language for these topics rather than mirroring a warning that does not exist, and that language falls under the clinical reviewer tier (BLG-22).
- **BLG-48a. Corrections and retractions policy.** Mandatory for a high-volume, AI-assisted, health-adjacent programme.
  - When a published claim is found to be wrong, the post carries a **visible, dated correction notice** describing what was wrong and what changed. Corrections are never silent edits.
  - A public **corrections log** at a stable URL, linked from the editorial policy page (BLG-47).
  - Correction triggers `dateModified` (BLG-4) and **requires reviewer re-attestation** — a new `dateReviewed` from a reviewer at the appropriate tier (BLG-22).
  - Material safety errors are escalated to Legal and, where the post has been cited by an AI engine or syndicated, the citation is tracked and the correction propagated where possible.
  - Content that cannot be corrected is retracted, 410'd, and logged (SEO-10, BLG-24).
  - This is a genuine E-E-A-T signal as well as a liability control. Publishing 20–50 posts a month without a corrections mechanism is the failure mode that turns a content programme into a legal problem.
- **BLG-49.** **Reader data handling.** Newsletter signup and analytics operate under COMP-1, COMP-5 and ANL-5. No non-essential tracking before consent for EU and UK readers — who will be a large share of the blog audience despite being able to buy only US-held in-person inventory (parent Decision #12, PAY-11a).
- **BLG-49a. Newsletter.** Referenced by BLG-49 and BLG-54, specified here. **Inherits parent MSG-6 in full**: strictly opt-in, double opt-in for EU and UK subscribers, granular preference centre, one-click unsubscribe, per-channel and per-topic, GDPR/PECR/CAN-SPAM compliant. Consent evidence (timestamp, IP, form version) stored with the subscription. The newsletter list is a marketing asset governed by the same consent regime as the rest of the platform, not a blog-team side channel.
- **BLG-50.** **Comments are off in v1.** They add moderation load under TSF-3, create a UGC spam surface that damages the domain, and deliver little SEO or AEO value. Revisit only with moderation capacity budgeted.

---

## 10. Non-Functional Requirements

- **BLG-51.** Blog pages meet the parent CWV budget: LCP < 2.5 s, INP < 200 ms, CLS < 0.1 at p75 on 4G mobile, enforced in CI (SEO-9). AI crawlers time out on slow pages; this is an AEO requirement, not only a UX one.
- **BLG-52.** Server-side rendered or statically generated. **No client-side-rendered article body under any circumstances** (SEO-1).
- **BLG-53.** Clean semantic HTML: article body in `<main>`, single `<h1>`, strict heading order, no heading levels skipped, no headings used for styling. Extraction quality depends directly on this.
- **BLG-54.** No intrusive interstitials, no popups blocking content on first load, no newsletter modal before meaningful scroll depth. Blocks both crawlers and readers.
- **BLG-55.** Images: WebP/AVIF, descriptive alt text on every image, lazy-loaded below fold, explicit dimensions to protect CLS, descriptive filenames.
- **BLG-56.** WCAG 2.2 AA across all editorial templates, including embedded video, tables and interactive elements (NFR-5, COMP-12).
- **BLG-57.** Editorial CMS supports scheduled publish, preview-as-published, revision history with diff, and rollback. Revision history is the audit trail for BLG-4 and BLG-18.

---

## 10a. Additional requirements closing identified gaps

- **BLG-58. Image provenance and AI-generated imagery.** Parent **ING-5** forbids copying third-party images into the index; editorial needs the equivalent.
  - Every editorial image must have a recorded licence: owned, commissioned, stock with licence reference, or provider-supplied with written permission. Stored as structured metadata, not a spreadsheet.
  - **AI-generated images are permitted but must be labelled** on the page and recorded in metadata. They must never depict a real, identifiable person, and must never illustrate an anatomical, medical or alignment point — generative models get postural anatomy wrong in ways that are subtly harmful in this subject.
  - No image of a named teacher, studio or student without documented consent.
- **BLG-59. Outbound link hygiene.** BLG-21 item 5 mandates ≥3 outbound authoritative links per post at 20–50 posts/month, which accumulates fast.
  - Default `rel` is plain (followed). Use `rel="sponsored"` and `rel="nofollow"` where applicable — though BLG-45 means neither should arise in v1.
  - **Automated link-rot monitoring** across all `Source[]` URLs on a scheduled cadence; broken sources raise an editorial task and count toward BLG-24 review urgency.
  - Archive a snapshot URL alongside each `Source` at time of citation, so a dead reference does not silently undermine a live claim.
- **BLG-60. Social and Open Graph metadata.** Every article emits `og:title`, `og:description`, `og:image`, `og:type=article`, `article:published_time`, `article:author`, and Twitter card tags. A share image is auto-generated per post from a template, with per-post override. Given parent WEB-2's assumption that a large share of traffic arrives from Instagram and TikTok in-app browsers, unstyled shares are a material acquisition loss.
- **BLG-61. Author lifecycle and personal data.** Author profiles are indexable pages of personal data about named individuals, so the parent's ING-7 problem applies here in a different form.
  - On author departure, the profile page persists by default with a "former contributor" state — bylines on published work must survive for accuracy and E-E-A-T.
  - The author may request removal of their profile page and byline under **COMP-4**. Honouring it requires either reassigning the byline to an editor or retracting the post; it must never leave an anonymous byline on health content.
  - Author consent to a public profile is captured explicitly at onboarding, including for platform teachers whose profiles link across (BLG-29).
  - Soft-delete per DM-6; hard-delete only via the COMP-4 erasure workflow.
- **BLG-62. Taxonomy version safety.** Parent **LST-13** requires taxonomy changes not to orphan listings; the same guarantee extends to editorial. Renaming or retiring a term in LST-12 must not break `TopicEntity[]` bindings, topic archives (BLG-11), cluster membership, or the automated entity links in BLG-25. Term changes trigger a re-resolution pass, not a silent break.
- **BLG-63. Definition of "substantive change"** (referenced by BLG-4 and BLG-17). A change is substantive if it alters meaning, facts, recommendations, the AnswerBlock, or any FAQ answer — or adds/removes a section. It is **not** substantive if it fixes typography, formatting, template markup, image compression, or internal link targets. Only substantive change updates `dateModified` and `lastmod`. Implement as an explicit editor declaration validated against the revision diff, not as an inferred heuristic.
- **BLG-64. Machine-checkable definition of "first screen"** (referenced by BLG-21 item 4). A blocking automated gate cannot depend on viewport. The deterministic proxy is: **the AnswerBlock must begin within the first 800 rendered characters of `<main>`, and no more than one element may precede it other than the H1 and the trust block.** Configurable, versioned, and testable in CI.
- **BLG-65. AI tooling governance.** The production model is AI-assisted at volume, which brings the tooling itself into scope for parent COMP-1's lawful-basis register and DPIA.
  - An approved-tools list, owned by Engineering and reviewed by Legal.
  - **No personal data of providers, students or reviewers may be pasted into a third-party model** during drafting or research — this includes seeded profile data about non-consenting individuals (ING-7).
  - Vendor terms must be checked for training-data use and retention; training on our inputs must be disabled where the option exists.
  - Draft provenance is logged: which tool, which version, which prompt template, so a systemic error in generated content can be traced across the corpus rather than fixed post by post.

---

## 11. Open Decisions

| # | Decision | Owner | Notes |
|---|---|---|---|
| **B1** | What is the actual monthly volume cap under BLG-23? | Editorial + Finance | Must be derived from real expert-review capacity, not from a traffic target. Set it before the first sprint; it determines reviewer hiring. |
| **B2** | Are expert reviewers paid contractors, or platform teachers compensated in kind? | Editorial + Growth | Paying platform teachers creates a supply-relationship benefit and a clean E-E-A-T story. In-kind compensation is cheaper but weakens both, and risks reviewer attrition. |
| **B3** | Does the blog live on the root domain or a subdomain? | SEO + Engineering | **Strong recommendation: root domain, `/blog`.** A subdomain fragments authority and forfeits most of the point. Recorded here only because it is frequently re-litigated by infrastructure preference. |
| **B4** | Original data studies from the platform's own index — in or out? | Data + Editorial | The index holds genuinely unique data: pricing distributions, style prevalence by city, training cost benchmarks. Original data is the strongest available AI-citation asset and the hardest for competitors to replicate. It also means publishing aggregate insight about providers, which needs a privacy and competitive review first. |
| **B5** | When do we add languages? | Growth | English-only at launch (BLG-6). The 30 advertising-only cities would benefit most from local-language content, and are also the least measurable (parent PAY-17a) — so this decision will have to be made on judgement rather than data. |
| **B6** | Editorial independence from commercial pressure | Editorial + Legal | BLG-26 requires a commercial link in every post. Where is the line between useful internal linking and editorial captured by the funnel? Worth a written policy before the first "can we push this retreat partner" conversation. |
| **B7** | Should the medical disclaimer (BLG-47a) extend beyond the blog to listing descriptions and provider bios? | Legal + Product | Providers write their own copy and will make therapeutic claims — "heals back pain", "cures anxiety". The blog is now disciplined; the marketplace is not. Parent CRD-6 governs credential copy and WVR-7 governs high-risk formats, but neither covers provider-authored therapeutic claims in a listing. This is arguably a larger exposure than the blog, since it sits directly in the purchase path. **Recommend raising against the parent spec as a new requirement, not solving it here.** |

---

## Appendix A — Post template (canonical structure)

```
H1: [Question-shaped or clearly topical title, ≤60 chars for SERP]

[ANSWER BLOCK — 40–60 words. Names the topic explicitly. Self-contained.
 Answers the core question completely with zero surrounding context.
 MUST come before the trust block — the 44% front-loading finding (§7)
 and BLG-64's 800-character rule both depend on this ordering.]

[Trust block: Author + credential · Reviewed by + credential · Published · Updated
 · Reviewed date. Rendered immediately below the answer block per BLG-32.]

[MEDICAL DISCLAIMER — health-topic posts only, per BLG-47a. Visually distinct.
 Not collapsed, not behind a toggle. Omitted entirely on non-health posts.]

[1–2 paragraphs of context and why it matters]

H2: [Question users actually ask]
   [First sentence answers the heading directly. Then detail.]
   [Table if comparative. Numbered list if sequential.]
   [INLINE QUALIFIER beside any physiological or therapeutic claim — BLG-47a.
    This is the placement that survives extraction.]

H2: [Question users actually ask]
   [Same pattern]

H2: [Question users actually ask]
   [Same pattern]

H2: Frequently asked questions
   [5–10 Q&A pairs, 40–80 words each, self-contained,
    individually fragment-addressable. Any answer touching health carries its
    own qualifier — each answer is extracted independently.]

H2: References
   [Structured source list — publication, author, date, date accessed]

[Related on the platform: 3+ internal links, ≥1 commercial]
[About the author / About the reviewer — links to /authors/{slug}]
```

## Appendix B — Publish gate checklist (BLG-21, machine-enforced)

| # | Check | Blocking |
|---|---|---|
| 1 | Belongs to a published cluster with a live pillar | Yes |
| 2 | Named Author with populated profile page | Yes |
| 3 | Credentialed Reviewer, where YMYL-adjacent | Yes |
| 4 | AnswerBlock present, 40–60 words, first screen | Yes |
| 5 | ≥3 authoritative outbound sources, structured | Yes |
| 6 | ≥3 internal links, ≥1 to a commercial page | Yes |
| 7 | Passes corpus and SERP similarity threshold | Yes |
| 8 | Structured data valid, zero errors (Schema.org Markup Validator — **not** Rich Results Test) | Yes |
| 9 | CWV budget met in synthetic run | Yes |
| 10 | Accessibility: heading order, alt text, contrast | Yes |
| 11 | Medical disclaimer present + correctly placed, where topic requires it (BLG-47a) | Yes |
| 12 | High-risk health-claim phrases flagged for legal | Conditional |
| 13 | Anchor-text distribution within threshold | Warn only |

Overrides require an Engineering-owned config change, are logged, and are reported monthly to the SEO and Editorial leads.
