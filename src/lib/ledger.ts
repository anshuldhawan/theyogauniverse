/**
 * PAY-14 — full double-entry ledger, independent of Stripe's reporting.
 * Every financial event posts a balanced transaction; the platform can
 * answer "how much do we owe provider X and why" without calling Stripe.
 *
 * Accounts:
 *   cash                        — platform bank/Stripe balance
 *   platform_commission         — earned commission (revenue)
 *   provider_payable_held       — owed to provider, in escrow (PAY-8)
 *   provider_payable_available  — owed to provider, releasable
 *   tax_collected               — indirect tax collected for remittance
 *   refunds_paid                — refunds issued
 */

import { money, type Money } from "./money";

export type LedgerAccount =
  | "cash"
  | "platform_commission"
  | "provider_payable_held"
  | "provider_payable_available"
  | "tax_collected"
  | "refunds_paid";

export interface LedgerLeg {
  account: LedgerAccount;
  direction: "debit" | "credit";
  amount: Money;
  organisationId?: string;
  memo?: string;
}

export interface LedgerTransaction {
  transactionId: string;
  bookingId?: string;
  legs: LedgerLeg[];
  createdAt: Date;
}

export class UnbalancedTransactionError extends Error {}

/** Every transaction must balance: Σ debits == Σ credits, same currency. */
export function assertBalanced(legs: LedgerLeg[]): void {
  if (legs.length < 2) throw new UnbalancedTransactionError("A transaction needs >= 2 legs");
  const currency = legs[0].amount.currency;
  let debits = 0;
  let credits = 0;
  for (const leg of legs) {
    if (leg.amount.currency !== currency) {
      throw new UnbalancedTransactionError("Mixed currencies in one transaction");
    }
    if (leg.direction === "debit") debits += leg.amount.amount;
    else credits += leg.amount.amount;
  }
  if (debits !== credits) {
    throw new UnbalancedTransactionError(`Unbalanced: debits ${debits} != credits ${credits}`);
  }
}

/** Booking capture: buyer pays `gross`; we retain `commission`; rest owed to provider. */
export function postBookingCapture(params: {
  transactionId: string;
  bookingId: string;
  organisationId: string;
  gross: Money;
  commission: Money;
  tax: Money;
  held: boolean; // PAY-8: high-ticket goes to the held account
}): LedgerTransaction {
  const providerShare = money(
    params.gross.amount - params.commission.amount - params.tax.amount,
    params.gross.currency,
  );
  const legs: LedgerLeg[] = [
    { account: "cash", direction: "debit", amount: params.gross },
    { account: "platform_commission", direction: "credit", amount: params.commission },
    {
      account: params.held ? "provider_payable_held" : "provider_payable_available",
      direction: "credit",
      amount: providerShare,
      organisationId: params.organisationId,
    },
  ];
  if (params.tax.amount > 0) {
    legs.push({ account: "tax_collected", direction: "credit", amount: params.tax });
  }
  assertBalanced(legs);
  return {
    transactionId: params.transactionId,
    bookingId: params.bookingId,
    legs,
    createdAt: new Date(),
  };
}

/** PAY-8 release at event start: held → available. */
export function postEscrowRelease(params: {
  transactionId: string;
  bookingId: string;
  organisationId: string;
  amount: Money;
}): LedgerTransaction {
  const legs: LedgerLeg[] = [
    {
      account: "provider_payable_held",
      direction: "debit",
      amount: params.amount,
      organisationId: params.organisationId,
    },
    {
      account: "provider_payable_available",
      direction: "credit",
      amount: params.amount,
      organisationId: params.organisationId,
    },
  ];
  assertBalanced(legs);
  return {
    transactionId: params.transactionId,
    bookingId: params.bookingId,
    legs,
    createdAt: new Date(),
  };
}

/** Full refund: the exact reversal of the capture legs. */
export function postRefund(params: {
  transactionId: string;
  bookingId: string;
  organisationId: string;
  gross: Money;
  commission: Money;
  tax: Money;
  wasHeld: boolean;
}): LedgerTransaction {
  const providerShare = money(
    params.gross.amount - params.commission.amount - params.tax.amount,
    params.gross.currency,
  );
  const legs: LedgerLeg[] = [
    { account: "cash", direction: "credit", amount: params.gross, memo: "refund issued" },
    { account: "platform_commission", direction: "debit", amount: params.commission },
    {
      account: params.wasHeld ? "provider_payable_held" : "provider_payable_available",
      direction: "debit",
      amount: providerShare,
      organisationId: params.organisationId,
    },
  ];
  if (params.tax.amount > 0) {
    legs.push({ account: "tax_collected", direction: "debit", amount: params.tax });
  }
  assertBalanced(legs);
  return {
    transactionId: params.transactionId,
    bookingId: params.bookingId,
    legs,
    createdAt: new Date(),
  };
}

/** In-memory journal for the dev store (DB implementation writes ledger_entries). */
const journal: LedgerTransaction[] = [];

export function postTransaction(txn: LedgerTransaction): void {
  assertBalanced(txn.legs);
  journal.push(txn);
}

export function journalEntries(): LedgerTransaction[] {
  return journal;
}

/** Balance of an account (optionally per organisation), credits minus debits for liability/revenue accounts. */
export function accountBalance(account: LedgerAccount, organisationId?: string): number {
  let balance = 0;
  for (const txn of journal) {
    for (const leg of txn.legs) {
      if (leg.account !== account) continue;
      if (organisationId && leg.organisationId !== organisationId) continue;
      balance += leg.direction === "credit" ? leg.amount.amount : -leg.amount.amount;
    }
  }
  return balance;
}
