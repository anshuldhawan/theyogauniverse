import type { Provider } from "./types";

/**
 * SEO-4 — thin-page suppression, promoted to a hard rule in v1.2: with
 * Launch Gates removed this is the only mechanism preventing thin city pages
 * from being indexed. Enforced at render time, automatic, and NOT
 * overridable by Ops.
 *
 * SEO-4a — the threshold measures content and provider quality, never
 * transactability. A page of 60 advertising-only providers is a legitimate,
 * indexable page; "we cannot take payment here" must not be conflated with
 * "this page is low value".
 */
export function cityPageIndexable(providers: Provider[]): boolean {
  const live = providers.length;
  const verified = providers.some((p) => p.verificationTier !== "self_declared");
  return live >= 3 || (live >= 1 && verified);
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export interface Breadcrumb {
  name: string;
  href: string;
}

export function breadcrumbSchema(items: Breadcrumb[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.href, siteUrl()).toString(),
    })),
  };
}

export function paginationLinks(input: {
  pathname: string;
  page: number;
  totalPages: number;
}): { canonical: string; prev?: string; next?: string } {
  const page = Math.max(1, Math.min(input.page, input.totalPages));
  const href = (value: number) =>
    value === 1 ? input.pathname : `${input.pathname}?page=${value}`;
  return {
    canonical: href(page),
    ...(page > 1 ? { prev: href(page - 1) } : {}),
    ...(page < input.totalPages ? { next: href(page + 1) } : {}),
  };
}

export function localeAlternates(pathname: string, supportedLocales: readonly string[]): {
  canonical: string;
  languages: Record<string, string>;
} {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return {
    canonical: clean,
    languages: {
      ...Object.fromEntries(supportedLocales.map((locale) => [locale, `/${locale}${clean}`])),
      "x-default": clean,
    },
  };
}

export interface RedirectRecord {
  from: string;
  to: string | null;
  removed: boolean;
}

/** SEO-10: resolve directly to the terminal target; removed records return 410. */
export function resolveRedirect(
  pathname: string,
  records: RedirectRecord[],
): { status: 200 | 301 | 410; location?: string } {
  const first = records.find((record) => record.from === pathname);
  if (!first) return { status: 200 };
  if (first.removed || !first.to) return { status: 410 };
  let terminal = first.to;
  const seen = new Set([pathname]);
  while (true) {
    if (seen.has(terminal)) throw new Error("Redirect cycle detected.");
    seen.add(terminal);
    const next = records.find((record) => record.from === terminal);
    if (!next) return { status: 301, location: terminal };
    if (next.removed || !next.to) return { status: 410 };
    terminal = next.to;
  }
}

export interface WebVitals {
  lcp: number;
  inp: number;
  cls: number;
}

export const CWV_BUDGET: WebVitals = { lcp: 2_500, inp: 200, cls: 0.1 };

export function webVitalsRegressions(
  measured: WebVitals,
  budget: WebVitals = CWV_BUDGET,
): Array<keyof WebVitals> {
  return (["lcp", "inp", "cls"] as const).filter((metric) => measured[metric] > budget[metric]);
}

export function metaTemplate(input: {
  kind: "city" | "provider" | "style" | "article";
  name: string;
  location?: string;
  override?: { title?: string; description?: string };
}): { title: string; description: string } {
  const generated =
    input.kind === "city"
      ? {
          title: `Yoga in ${input.name} — teachers, studios & classes`,
          description: `Compare verified yoga teachers, studios and classes in ${input.name}. Explore styles, schedules and honest reviews.`,
        }
      : {
          title: `${input.name}${input.location ? ` in ${input.location}` : ""} · The Yoga Universe`,
          description: `Explore ${input.name}${input.location ? ` in ${input.location}` : ""}, including verified details, schedules and independent reviews.`,
        };
  return {
    title: input.override?.title?.trim() || generated.title,
    description: input.override?.description?.trim() || generated.description,
  };
}
