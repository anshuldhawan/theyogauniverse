import { locales, type Locale } from "@/i18n/config";
import type { LedgerTransaction } from "./ledger";

export interface ScheduledRelease {
  bookingId: string;
  amount: number;
  currency: string;
  releaseAt: Date;
}

export function financialSummary(input: {
  organisationId: string;
  transactions: LedgerTransaction[];
  releases: ScheduledRelease[];
}): {
  held: number;
  available: number;
  commission: number;
  refunds: number;
  releases: ScheduledRelease[];
} {
  const totals = { held: 0, available: 0, commission: 0, refunds: 0 };
  for (const transaction of input.transactions) {
    for (const leg of transaction.legs) {
      if (leg.organisationId && leg.organisationId !== input.organisationId) continue;
      const signed = leg.direction === "credit" ? leg.amount.amount : -leg.amount.amount;
      if (leg.account === "provider_payable_held") totals.held += signed;
      if (leg.account === "provider_payable_available") totals.available += signed;
      if (leg.account === "platform_commission") totals.commission += signed;
      if (leg.account === "refunds_paid") totals.refunds += signed;
    }
  }
  return {
    ...totals,
    releases: input.releases
      .filter((release) => release.releaseAt.getTime() > Date.now())
      .sort((a, b) => a.releaseAt.getTime() - b.releaseAt.getTime()),
  };
}

export type IngestionWorkKind =
  | "fetch"
  | "parse_structured"
  | "extract_unstructured"
  | "normalise"
  | "disambiguate";

export function ingestionExecutor(input: {
  kind: IngestionWorkKind;
  deterministicAvailable: boolean;
  confidence?: number;
}): "crawler" | "deterministic_parser" | "model" | "human_review" {
  if (input.kind === "fetch") return "crawler";
  if (input.deterministicAvailable) return "deterministic_parser";
  if (input.kind === "parse_structured") return "human_review";
  if ((input.confidence ?? 1) < 0.6) return "human_review";
  return "model";
}

export const MESSAGE_COPY: Record<
  Locale,
  { bookingConfirmed: string; reviewRequest: string; reviewReminder: string }
> = {
  en: { bookingConfirmed: "Booking confirmed", reviewRequest: "How was your experience?", reviewReminder: "A final reminder to share your review" },
  es: { bookingConfirmed: "Reserva confirmada", reviewRequest: "¿Cómo fue tu experiencia?", reviewReminder: "Último recordatorio para compartir tu reseña" },
  pt: { bookingConfirmed: "Reserva confirmada", reviewRequest: "Como foi a sua experiência?", reviewReminder: "Último lembrete para partilhar a sua avaliação" },
  de: { bookingConfirmed: "Buchung bestätigt", reviewRequest: "Wie war deine Erfahrung?", reviewReminder: "Letzte Erinnerung, deine Bewertung zu teilen" },
  fr: { bookingConfirmed: "Réservation confirmée", reviewRequest: "Comment s’est passée votre expérience ?", reviewReminder: "Dernier rappel pour partager votre avis" },
  it: { bookingConfirmed: "Prenotazione confermata", reviewRequest: "Com’è stata la tua esperienza?", reviewReminder: "Ultimo promemoria per condividere la recensione" },
  nl: { bookingConfirmed: "Boeking bevestigd", reviewRequest: "Hoe was je ervaring?", reviewReminder: "Laatste herinnering om je beoordeling te delen" },
};

export function messageCopy(locale: string) {
  return MESSAGE_COPY[(locales as readonly string[]).includes(locale) ? (locale as Locale) : "en"];
}

export interface ReviewPromptState {
  bookingId: string;
  email: string;
  pushSubscription: boolean;
  occurrenceEndedAt: Date;
  requestedAt?: Date;
  remindedAt?: Date;
  reviewedAt?: Date;
}

export function dueReviewPrompts(
  rows: ReviewPromptState[],
  now: Date,
): { bookingId: string; kind: "request" | "reminder"; channels: ("email" | "web_push")[] }[] {
  const due: { bookingId: string; kind: "request" | "reminder"; channels: ("email" | "web_push")[] }[] = [];
  for (const row of rows) {
    if (row.reviewedAt || now.getTime() < row.occurrenceEndedAt.getTime() + 24 * 3_600_000) continue;
    const channels: ("email" | "web_push")[] = row.pushSubscription ? ["email", "web_push"] : ["email"];
    if (!row.requestedAt) {
      due.push({ bookingId: row.bookingId, kind: "request", channels });
      continue;
    }
    if (!row.remindedAt && now.getTime() >= row.requestedAt.getTime() + 72 * 3_600_000) {
      due.push({ bookingId: row.bookingId, kind: "reminder", channels });
    }
  }
  return due;
}
