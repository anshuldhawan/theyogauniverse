import { money, type Money } from "./money";

export type RefundCause = "provider_fault" | "buyer_fault" | "platform_goodwill";

export interface RefundAllocation {
  buyerRefund: Money;
  providerDebit: Money;
  commissionReversal: Money;
  platformExpense: Money;
}

/** PAY-9 accounting treatment: goodwill never changes provider earnings. */
export function allocateRefund(
  amount: Money,
  originalCommission: Money,
  originalGross: Money,
  cause: RefundCause,
): RefundAllocation {
  if (amount.currency !== originalCommission.currency || amount.currency !== originalGross.currency) {
    throw new Error("Refund currencies must match.");
  }
  const refundAmount = Math.min(amount.amount, originalGross.amount);
  const proportionalCommission = Math.round(originalCommission.amount * refundAmount / originalGross.amount);
  if (cause === "platform_goodwill") {
    return {
      buyerRefund: money(refundAmount, amount.currency),
      providerDebit: money(0, amount.currency),
      commissionReversal: money(0, amount.currency),
      platformExpense: money(refundAmount, amount.currency),
    };
  }
  const reverseCommission = cause === "provider_fault" ? proportionalCommission : 0;
  return {
    buyerRefund: money(refundAmount, amount.currency),
    providerDebit: money(refundAmount - reverseCommission, amount.currency),
    commissionReversal: money(reverseCommission, amount.currency),
    platformExpense: money(0, amount.currency),
  };
}

export interface ReceiptInput {
  receiptNumber: string;
  buyerLocale: string;
  buyerCountry: string;
  performanceCountry: "US";
  supplyType: "in_person";
  subtotal: Money;
  tax: Money;
  providerName: string;
}

export interface Receipt {
  receiptNumber: string;
  total: string;
  lines: string[];
  taxNote: string;
}

export function createTrackAReceipt(input: ReceiptInput): Receipt {
  if (input.subtotal.currency !== input.tax.currency) throw new Error("Receipt currencies must match.");
  const formatter = new Intl.NumberFormat(input.buyerLocale, {
    style: "currency",
    currency: input.subtotal.currency,
  });
  const total = input.subtotal.amount + input.tax.amount;
  return {
    receiptNumber: input.receiptNumber,
    total: formatter.format(total / 100),
    lines: [
      `Provider: ${input.providerName}`,
      `Subtotal: ${formatter.format(input.subtotal.amount / 100)}`,
      `US sales tax: ${formatter.format(input.tax.amount / 100)}`,
    ],
    taxNote: input.buyerCountry.toUpperCase() === "US"
      ? "US sales tax is based on where the in-person service is performed."
      : "No local VAT or GST applies because this in-person service is performed in the United States.",
  };
}

export function reportingRegimesForV1(params: {
  providerCountry: string;
  transactedOnPlatform: boolean;
}): ("1099-K" | "DAC7" | "UK_PLATFORM" | "AU_SERR")[] {
  if (!params.transactedOnPlatform) return [];
  return params.providerCountry.toUpperCase() === "US" ? ["1099-K"] : [];
}
