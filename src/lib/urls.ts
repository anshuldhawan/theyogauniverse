import { normalize } from "./taxonomy";
import type { Provider } from "./types";

function slugifyCity(name: string): string {
  return normalize(name).replace(/[^a-z0-9]+/g, "-");
}

/**
 * PRO-1 URL patterns. Every provider has a unique, permanent, human-readable
 * URL regardless of transactability. Online-only providers use "online" as
 * the geographic segment.
 */
export function providerPath(provider: Provider): string {
  const country = provider.onlineOnly ? "online" : (provider.country?.toLowerCase() ?? "online");
  const city = provider.onlineOnly
    ? "online"
    : provider.citySlug ?? slugifyCity(provider.cityName ?? "online");
  switch (provider.kind) {
    case "teacher":
      return `/teachers/${provider.slug}`;
    case "studio":
      return `/studios/${country}/${city}/${provider.slug}`;
    case "school":
      return `/schools/${country}/${city}/${provider.slug}`;
    case "organiser":
      return `/organisers/${provider.slug}`;
    case "venue":
      return `/venues/${country}/${city}/${provider.slug}`;
  }
}

/** PRO-7: the mobile "link in bio" variant at /{slug}. */
export function linkInBioPath(provider: Provider): string {
  return `/${provider.slug}`;
}

export function cityHubPath(country: string, citySlug: string): string {
  return `/${country}/${citySlug}/yoga`;
}
