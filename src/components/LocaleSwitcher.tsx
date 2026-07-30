"use client";

import { useLocale } from "next-intl";
import { locales, type Locale } from "@/i18n/config";
import { LOCALE_COOKIE } from "@/lib/localization";

const LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  nl: "Nederlands",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  return (
    <label className="flex items-center gap-2 text-xs text-sage">
      <span>Language</span>
      <select
        aria-label="Language"
        value={locale}
        onChange={(event) => {
          document.cookie =
            `${LOCALE_COOKIE}=${event.target.value}; Path=/; Max-Age=31536000; ` +
            "SameSite=Lax; Secure";
          window.location.reload();
        }}
        className="rounded border border-sage/40 bg-forest px-2 py-1 text-white"
      >
        {locales.map((value) => (
          <option key={value} value={value}>
            {LABELS[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
