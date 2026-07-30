/**
 * DM-4: money is integer minor units + ISO-4217 currency. Never floats,
 * never an implicit currency — even though settlement is USD-only,
 * presentment varies (LOC-7) and advertising-only prices are never USD by
 * default (LST-14).
 */

export interface Money {
  /** Integer amount in the currency's minor unit (cents, paise, …). */
  amount: number;
  /** ISO-4217 alpha code, uppercase. */
  currency: string;
}

/** Currencies with a non-2 minor-unit exponent that we present. */
const MINOR_UNIT_EXPONENT: Record<string, number> = {
  JPY: 0,
  KRW: 0,
  VND: 0,
  KWD: 3,
  BHD: 3,
};

export function minorUnitExponent(currency: string): number {
  return MINOR_UNIT_EXPONENT[currency.toUpperCase()] ?? 2;
}

export function money(amount: number, currency: string): Money {
  if (!Number.isSafeInteger(amount)) {
    throw new TypeError(`Money amount must be an integer of minor units, got ${amount}`);
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new TypeError(`Currency must be an ISO-4217 alpha code, got "${currency}"`);
  }
  return { amount, currency };
}

export function fromMajor(major: number, currency: string): Money {
  const exponent = minorUnitExponent(currency);
  return money(Math.round(major * 10 ** exponent), currency);
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

/**
 * Commission and proportional splits: banker's-safe integer math, rounding
 * half away from zero. `percentBps` is basis points (12% = 1200).
 */
export function percentageBps(of: Money, percentBps: number): Money {
  const raw = (of.amount * percentBps) / 10_000;
  return money(Math.sign(raw) * Math.round(Math.abs(raw)), of.currency);
}

export function isZero(a: Money): boolean {
  return a.amount === 0;
}

export function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new TypeError(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

/** Locale-aware display (LOC-2/LOC-7). */
export function formatMoney(value: Money, locale = "en-US"): string {
  const exponent = minorUnitExponent(value.currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: value.currency,
    minimumFractionDigits: value.amount % 10 ** exponent === 0 ? 0 : exponent,
  }).format(value.amount / 10 ** exponent);
}

/** LST-14: indicative price range on advertising-only listings. */
export interface PriceRange {
  low: Money;
  high: Money;
}

export function formatPriceRange(range: PriceRange, locale = "en-US"): string {
  assertSameCurrency(range.low, range.high);
  if (range.low.amount === range.high.amount) return formatMoney(range.low, locale);
  return `${formatMoney(range.low, locale)}–${formatMoney(range.high, locale)}`;
}
