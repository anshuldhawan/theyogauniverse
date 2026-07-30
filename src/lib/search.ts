/**
 * SRCH — search and filtering over the index. Filters mirror the prototype's
 * directory (all live, all combinable) plus the two v1.2 booking-mode
 * filters from SRCH-4, which are the ONLY places transactability may
 * hard-exclude results (SRCH-16 / NG-7):
 *   - "Bookable on site": excludes advertising-only listings.
 *   - "Instant book": additionally excludes request-to-book.
 * Everywhere else, advertising-only providers rank on merit with the fixed
 * demotion applied by the ranking service.
 */

import { providerView } from "./listing-view";
import { allProviders } from "./repo";
import { rank, type RankedResult, type RankInput } from "./ranking";
import { normalize } from "./taxonomy";
import type { BuyerContext } from "./transactability";
import type { Provider, ProviderCategory, Transactability } from "./types";

export interface SearchFilters {
  query?: string;
  category?: ProviderCategory | "everything";
  styles?: string[]; // taxonomy slugs
  formats?: ("in_person" | "online")[];
  levels?: string[];
  days?: string[]; // Mon..Sun
  location?: string; // city name or "anywhere"
  verifiedOnly?: boolean;
  bookableOnSite?: boolean; // SRCH-4 booking-mode filter 1
  instantBook?: boolean; // SRCH-4 booking-mode filter 2 (strict subset)
  sort?: "relevance" | "reviews" | "established" | "name";
}

export interface SearchResult extends RankedResult {
  transactability: Transactability;
  priceDisplay: string | null;
  priceIsIndicative: boolean;
}

const DAY_ALIASES: Record<string, string[]> = {
  mon: ["mon", "monday", "daily", "mon–fri", "mon-fri", "mon–thu", "mon-thu", "mon–sat", "mon-sat", "mon, wed, fri"],
  tue: ["tue", "tuesday", "daily", "mon–fri", "mon-fri", "mon–thu", "mon-thu", "mon–sat", "mon-sat", "tue & thu", "sun & tue"],
  wed: ["wed", "wednesday", "daily", "mon–fri", "mon-fri", "mon–thu", "mon-thu", "mon–sat", "mon-sat", "mon, wed, fri"],
  thu: ["thu", "thursday", "daily", "mon–fri", "mon-fri", "mon–thu", "mon-thu", "mon–sat", "mon-sat", "tue & thu", "sun & tue"],
  fri: ["fri", "friday", "daily", "mon–fri", "mon-fri", "mon–sat", "mon-sat", "mon, wed, fri"],
  sat: ["sat", "saturday", "daily", "mon–sat", "mon-sat", "first sunday"],
  sun: ["sun", "sunday", "daily", "sun & tue", "first sunday"],
};

function runsOnDay(provider: Provider, day: string): boolean {
  const aliases = DAY_ALIASES[day.slice(0, 3).toLowerCase()] ?? [];
  return provider.schedule.some((row) => {
    const d = row.day.toLowerCase();
    return aliases.some((a) => d.includes(a));
  });
}

function textRelevance(provider: Provider, query: string): number {
  if (!query) return 0.7; // neutral relevance when browsing
  const q = normalize(query);
  const haystacks: [string, number][] = [
    [provider.name, 1],
    [provider.category, 0.9],
    [provider.styles.join(" "), 0.85],
    [provider.tagline, 0.7],
    [provider.cityName ?? "", 0.8],
    [provider.bio, 0.5],
  ];
  let best = 0;
  for (const [text, weight] of haystacks) {
    if (normalize(text).includes(q)) best = Math.max(best, weight);
  }
  return best;
}

export function searchProviders(filters: SearchFilters, buyer: BuyerContext): SearchResult[] {
  const query = filters.query?.trim() ?? "";

  const candidates = allProviders().filter((provider) => {
    if (
      filters.category &&
      filters.category !== "everything" &&
      provider.category !== filters.category
    ) {
      return false;
    }
    if (query && textRelevance(provider, query) === 0) return false;
    if (filters.verifiedOnly && provider.verificationTier === "self_declared") return false;
    if (filters.styles?.length) {
      if (!filters.styles.some((s) => provider.styles.includes(s))) return false;
    }
    if (filters.formats?.length) {
      const matches = filters.formats.some((f) =>
        f === "online"
          ? provider.format === "online" || provider.format === "both"
          : provider.format === "in_person" || provider.format === "both",
      );
      if (!matches) return false;
    }
    if (filters.levels?.length) {
      if (!filters.levels.some((l) => provider.levels.includes(l.toLowerCase()))) return false;
    }
    if (filters.days?.length) {
      if (!filters.days.some((d) => runsOnDay(provider, d))) return false;
    }
    if (filters.location && normalize(filters.location) !== "anywhere") {
      const target = normalize(filters.location);
      const cityMatch = provider.cityName && normalize(provider.cityName) === target;
      const onlineMatch = target === "online" && provider.onlineOnly;
      if (!cityMatch && !onlineMatch) return false;
    }
    return true;
  });

  const withViews = candidates.map((provider) => {
    const view = providerView(provider, buyer);
    return { provider, view };
  });

  // The two explicit opt-in booking-mode filters (SRCH-4) — the only hard
  // exclusions on transactability anywhere in search.
  const afterBookingMode = withViews.filter(({ view }) => {
    if ((filters.bookableOnSite || filters.instantBook) && view.transactability !== "bookable") {
      return false;
    }
    // All seed bookable listings are instant-book; request_to_book exclusion
    // applies when the booking engine supplies per-listing modes.
    return true;
  });

  const inputs: RankInput[] = afterBookingMode.map(({ provider, view }) => ({
    provider,
    transactability: view.transactability,
    behavioural: null, // behavioural signals arrive with the booking engine
    relevance: textRelevance(provider, query),
  }));

  let results = rank(inputs).map((ranked) => {
    const view = afterBookingMode.find((x) => x.provider.id === ranked.provider.id)!.view;
    return {
      ...ranked,
      transactability: view.transactability,
      priceDisplay: view.priceDisplay,
      priceIsIndicative: view.priceIsIndicative,
    };
  });

  if (filters.sort === "reviews") {
    results = [...results].sort((a, b) => b.provider.reviewCount - a.provider.reviewCount);
  } else if (filters.sort === "established") {
    results = [...results].sort(
      (a, b) => (b.provider.yearsRunning ?? 0) - (a.provider.yearsRunning ?? 0),
    );
  } else if (filters.sort === "name") {
    results = [...results].sort((a, b) => a.provider.name.localeCompare(b.provider.name));
  }

  return results;
}

/** Locations facet, built from the live listing set like the prototype. */
export function locationOptions(): string[] {
  const cities = new Set<string>();
  let hasOnline = false;
  for (const provider of allProviders()) {
    if (provider.onlineOnly) hasOnline = true;
    else if (provider.cityName) cities.add(provider.cityName);
  }
  return ["Anywhere", ...(hasOnline ? ["Online"] : []), ...[...cities].sort()];
}
