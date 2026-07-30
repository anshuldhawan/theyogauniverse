/**
 * BLG-25..28 — internal linking engine.
 *
 * Link extraction feeds the publish gate (BLG-21.6); entity detection
 * proposes links that an editor approves — proposals are NEVER auto-inserted
 * (BLG-25); anchor-text distribution is tracked per destination and warned
 * on over-uniformity (BLG-28).
 */

import { CITIES } from "@/lib/config/markets";
import { allStyleTerms } from "@/lib/taxonomy";
import type { Article } from "./types";

export interface InternalLink {
  href: string;
  anchor: string;
}

const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** All internal links on an article: inline body links + the related block. */
export function extractInternalLinks(article: Article): InternalLink[] {
  const links: InternalLink[] = [];
  for (const section of article.sections) {
    for (const paragraph of section.paragraphs) {
      for (const match of paragraph.matchAll(MARKDOWN_LINK)) {
        if (match[2].startsWith("/")) links.push({ anchor: match[1], href: match[2] });
      }
    }
  }
  for (const link of article.related) {
    if (link.href.startsWith("/")) links.push({ anchor: link.anchor, href: link.href });
  }
  return links;
}

/**
 * BLG-26: commercial marketplace pages — city hubs, style/directory pages,
 * provider profiles and listings. Help/blog/legal pages are not commercial.
 */
export function isCommercialPath(href: string): boolean {
  const path = href.split(/[?#]/)[0];
  if (href.startsWith("/directory")) return true;
  if (
    path.startsWith("/teachers/") ||
    path.startsWith("/studios/") ||
    path.startsWith("/schools/") ||
    path.startsWith("/organisers/") ||
    path.startsWith("/venues/") ||
    path.startsWith("/book/")
  ) {
    return true;
  }
  // City hub pattern: /{country}/{city}/yoga
  return /^\/[a-z]{2}\/[a-z0-9-]+\/yoga$/.test(path);
}

/* ------------------------- BLG-25 entity detection ------------------------- */

export interface LinkProposal {
  entity: string;
  kind: "style" | "city";
  href: string;
  /** The matched text, suggested as anchor — editor approves and may edit. */
  match: string;
}

/**
 * Detect taxonomy terms (LST-12) and indexed city names in body text and
 * propose marketplace links. Output is a proposal list for the editor;
 * nothing is inserted automatically.
 */
export function proposeEntityLinks(article: Article): LinkProposal[] {
  const text = article.sections
    .flatMap((s) => [s.heading, ...s.paragraphs])
    .join("\n")
    .toLowerCase();
  const already = new Set(extractInternalLinks(article).map((l) => l.href.split(/[?#]/)[0]));
  const proposals: LinkProposal[] = [];

  for (const term of allStyleTerms()) {
    const href = `/directory?styles=${term.slug}`;
    if (already.has("/directory")) continue; // generic directory link already present
    if (text.includes(term.label.toLowerCase()) && !proposals.some((p) => p.href === href)) {
      proposals.push({ entity: term.slug, kind: "style", href, match: term.label });
    }
  }
  for (const city of CITIES) {
    const href = `/${city.country}/${city.slug}/yoga`;
    if (already.has(href)) continue;
    if (text.includes(city.name.toLowerCase()) && !proposals.some((p) => p.href === href)) {
      proposals.push({ entity: city.slug, kind: "city", href, match: city.name });
    }
  }
  return proposals;
}

/* --------------------- BLG-28 anchor-text distribution --------------------- */

export interface AnchorWarning {
  href: string;
  anchor: string;
  share: number;
}

/**
 * Warn when a single anchor text exceeds `maxShare` of all links pointing at
 * one destination across the corpus (uniform exact-match anchors read as
 * manipulation). Warn-only — never blocks (BLG-21 item 13).
 */
export function anchorDistributionWarnings(
  articles: Article[],
  maxShare = 0.6,
  minLinks = 3,
): AnchorWarning[] {
  const byDestination = new Map<string, Map<string, number>>();
  for (const article of articles) {
    for (const link of extractInternalLinks(article)) {
      const path = link.href.split("#")[0];
      const anchors = byDestination.get(path) ?? new Map<string, number>();
      const key = link.anchor.trim().toLowerCase();
      anchors.set(key, (anchors.get(key) ?? 0) + 1);
      byDestination.set(path, anchors);
    }
  }
  const warnings: AnchorWarning[] = [];
  for (const [href, anchors] of byDestination) {
    const total = [...anchors.values()].reduce((a, b) => a + b, 0);
    if (total < minLinks) continue;
    for (const [anchor, count] of anchors) {
      const share = count / total;
      if (share > maxShare) warnings.push({ href, anchor, share });
    }
  }
  return warnings;
}
