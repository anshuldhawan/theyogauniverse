# NFR-5 — WCAG 2.2 AA independent audit: removed from launch scope

**Status:** REMOVED — owner decision, 29 July 2026.

**Decision:** The independent WCAG 2.2 AA audit (and its annual re-run) is
removed from the launch plan. No accessibility specialist will be engaged,
and no accessibility-filter functionality will ship on the site.

**Why this is acceptable for v1:**

- NFR-5 was load-bearing chiefly because the platform *marketed
  accessibility filters* — "we market accessibility filters and must meet
  the standard ourselves." No such filters were ever built or marketed:
  directory filters are kind, location, style, price and booking mode only,
  and no UI copy promises accessibility filtering.
- Semantic-HTML best efforts remain in place regardless (BLG-53 heading
  discipline; BLG-56: FAQ `dl`, scoped `th`, aria-labelled disclaimers).

**Consequences:**

- `NFR-5` is marked `n-a` in the tracker with a link to this memo; `BLG-56`
  is completed on its semantic-templates scope.
- EU EAA exposure (`COMP-12`) remains an honest open gap tied to any future
  EU launch — removing the audit does not remove the law; it accepts that
  v1 does not launch in the EU.
- If accessibility filters are ever added to the product, this decision
  must be revisited before they ship.
