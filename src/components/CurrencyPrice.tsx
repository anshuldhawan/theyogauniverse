import { formatConvertedPrice } from "@/lib/localization";
import type { Money } from "@/lib/money";

export function CurrencyPrice(props: {
  original: Money;
  presented: Money;
  locale: string;
  fxRateAsOf: string;
  fxMarginBps: number;
}) {
  const value = formatConvertedPrice(props);
  return (
    <span>
      <span>{value.display}</span>
      <span className="block text-xs text-faint">{value.disclosure}</span>
    </span>
  );
}
