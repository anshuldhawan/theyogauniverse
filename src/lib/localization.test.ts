import { describe, expect, it } from "vitest";
import {
  culturalDefaults,
  formatConvertedPrice,
  localizedContent,
  resolveLocalePreference,
} from "./localization";
import { money } from "./money";

describe("localization", () => {
  it("prioritises account and explicit cookie preferences", () => {
    expect(resolveLocalePreference({ accountLocale: "fr", cookieLocale: "de" })).toBe("fr");
    expect(resolveLocalePreference({ cookieLocale: "de", browserLanguages: ["es-MX"] })).toBe("de");
    expect(resolveLocalePreference({ browserLanguages: ["pt-BR"] })).toBe("pt");
    expect(resolveLocalePreference({ country: "NL" })).toBe("nl");
  });

  it("provides culturally aware English variants", () => {
    expect(culturalDefaults("en", "US")).toMatchObject({
      locale: "en-US",
      hourCycle: "h12",
      weekStartsOn: 0,
      measurementSystem: "imperial",
    });
    expect(culturalDefaults("en", "GB")).toMatchObject({
      locale: "en-GB",
      hourCycle: "h23",
      weekStartsOn: 1,
      defaultCurrency: "GBP",
    });
    expect(culturalDefaults("en", "AU").locale).toBe("en-AU");
  });

  it("discloses conversion basis, margin and USD settlement", () => {
    const result = formatConvertedPrice({
      original: money(10_000, "USD"),
      presented: money(9_200, "EUR"),
      locale: "de-DE",
      fxRateAsOf: "2026-07-29",
      fxMarginBps: 150,
    });
    expect(result.display).toContain("92");
    expect(result.disclosure).toContain("2026-07-29");
    expect(result.disclosure).toContain("1.5%");
    expect(result.disclosure).toContain("Settlement is in USD");
  });

  it("labels machine translations and preserves the original", () => {
    expect(
      localizedContent(
        {
          original: "Hola",
          originalLanguage: "es",
          translation: "Hello",
          translationLanguage: "en",
          method: "machine",
        },
        "en",
      ),
    ).toEqual({ text: "Hello", label: "Machine translated", original: "Hola" });
  });
});
