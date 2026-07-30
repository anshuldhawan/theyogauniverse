import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { formatMoney, type Money } from "./money";

export const LOCALE_COOKIE = "locale";

const COUNTRY_LOCALE: Record<string, Locale> = {
  AU: "en",
  DE: "de",
  ES: "es",
  FR: "fr",
  GB: "en",
  IT: "it",
  NL: "nl",
  PT: "pt",
  US: "en",
};

export function resolveLocalePreference(params: {
  accountLocale?: string | null;
  cookieLocale?: string | null;
  browserLanguages?: readonly string[];
  country?: string | null;
}): Locale {
  for (const candidate of [params.accountLocale, params.cookieLocale]) {
    if (candidate && isLocale(candidate)) return candidate;
  }
  for (const language of params.browserLanguages ?? []) {
    const base = language.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return COUNTRY_LOCALE[params.country?.toUpperCase() ?? ""] ?? defaultLocale;
}

export interface CulturalDefaults {
  locale: string;
  hourCycle: "h12" | "h23";
  weekStartsOn: 0 | 1;
  measurementSystem: "imperial" | "metric";
  nameOrder: "given-family" | "family-given";
  defaultCurrency: string;
}

export function culturalDefaults(locale: string, country?: string | null): CulturalDefaults {
  const cc = country?.toUpperCase();
  const resolved = cc === "GB" ? "en-GB" : cc === "AU" ? "en-AU" : locale === "en" ? "en-US" : locale;
  return {
    locale: resolved,
    hourCycle: cc === "US" ? "h12" : "h23",
    weekStartsOn: cc === "US" ? 0 : 1,
    measurementSystem: cc === "US" ? "imperial" : "metric",
    nameOrder: ["CN", "JP", "KR", "VN"].includes(cc ?? "") ? "family-given" : "given-family",
    defaultCurrency: cc === "GB" ? "GBP" : cc === "AU" ? "AUD" : cc === "US" ? "USD" : "EUR",
  };
}

export interface CurrencyDisclosure {
  display: string;
  disclosure: string;
}

export function formatConvertedPrice(params: {
  original: Money;
  presented: Money;
  locale: string;
  fxRateAsOf: string;
  fxMarginBps: number;
}): CurrencyDisclosure {
  return {
    display: formatMoney(params.presented, params.locale),
    disclosure:
      `Estimated from ${formatMoney(params.original, params.locale)} at the rate dated ` +
      `${params.fxRateAsOf}; FX margin ${params.fxMarginBps / 100}%. ` +
      "Settlement is in USD and your card issuer may use a different rate or add fees.",
  };
}

export interface TranslatedContent {
  original: string;
  originalLanguage: string;
  translation?: string | null;
  translationLanguage?: string | null;
  method?: "machine" | "human";
}

export function localizedContent(
  content: TranslatedContent,
  requestedLanguage: string,
): { text: string; label: string | null; original: string | null } {
  if (
    content.translation &&
    content.translationLanguage === requestedLanguage &&
    requestedLanguage !== content.originalLanguage
  ) {
    return {
      text: content.translation,
      label: content.method === "machine" ? "Machine translated" : null,
      original: content.original,
    };
  }
  return { text: content.original, label: null, original: null };
}
