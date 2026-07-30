import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { resolveLocalePreference } from "@/lib/localization";

/**
 * LOC-4: locale detection — cookie override first (user-set, persisted),
 * falling back to the default. Geo/browser detection is layered in at the
 * edge (middleware) and always user-overridable.
 */
export default getRequestConfig(async () => {
  const store = await cookies();
  const requestHeaders = await headers();
  const cookieLocale = store.get("locale")?.value;
  const browserLanguages = (requestHeaders.get("accept-language") ?? "")
    .split(",")
    .map((part) => part.split(";")[0].trim())
    .filter(Boolean);
  const locale = resolveLocalePreference({
    cookieLocale,
    browserLanguages,
    country: requestHeaders.get("x-vercel-ip-country"),
  });

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
