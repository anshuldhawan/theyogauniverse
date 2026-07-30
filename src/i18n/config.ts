/**
 * LOC-1: launch languages. Adding a language is configuration, not code —
 * add the locale here and a messages/{locale}.json file.
 */
export const locales = ["en", "es", "pt", "de", "fr", "it", "nl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
