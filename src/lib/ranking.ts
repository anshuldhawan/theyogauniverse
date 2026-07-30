/**
 * SRCH-14/SRCH-16 — the ranking service. Versioned (config carries the
 * version), testable offline, and degradation-aware:
 *
 * - Advertising-only listings have NO behavioural signals (booking
 *   conversion, response rate, cancellation rate do not exist for them,
 *   MSG-3/ANL-2). The ranker scores them on the static signals only —
 *   verification tier, completeness, freshness, historical reviews — rather
 *   than scoring missing signals as zero, which would silently compound the
 *   SRCH-16 demotion (tested explicitly per the PRD).
 *
 * - SRCH-16: transactability is a ranking signal, never a filter. A fixed
 *   multiplier from config (RANKING_CONFIG.advertisingOnlyMultiplier, within
 *   the disclosed 15–20% band), published under EU P2B (COMP-9).
 */

import { RANKING_CONFIG } from "./config/markets";
import type { Provider, Transactability, VerificationTier } from "./types";

export interface BehaviouralSignals {
  bookingConversion: number; // 0..1
  responseRate: number; // 0..1
  cancellationRate: number; // 0..1 (lower is better)
}

export interface RankInput {
  provider: Provider;
  transactability: Transactability;
  /** Present for transactable listings only. */
  behavioural: BehaviouralSignals | null;
  /** Free-text relevance from the search layer, 0..1. */
  relevance: number;
}

const VERIFICATION_SCORE: Record<VerificationTier, number> = {
  registry_verified: 1,
  document_verified: 0.7,
  self_declared: 0.35,
};

function freshnessScore(lastVerifiedAt: string, now: Date): number {
  const days = (now.getTime() - new Date(lastVerifiedAt).getTime()) / 86_400_000;
  if (days <= 30) return 1;
  if (days >= 180) return 0.2;
  return 1 - (0.8 * (days - 30)) / 150;
}

function reviewScore(reviewCount: number): number {
  // log-scaled; 340 reviews (seed max) ≈ 1.0
  return Math.min(1, Math.log10(1 + reviewCount) / 2.5);
}

export interface RankedResult {
  provider: Provider;
  score: number;
  rankerVersion: string;
}

export function scoreProvider(input: RankInput, now = new Date()): RankedResult {
  const { provider, behavioural, transactability, relevance } = input;

  const staticSignals =
    0.3 * VERIFICATION_SCORE[provider.verificationTier] +
    0.2 * (provider.confidenceScore ?? 0.5) + // stands in for completeness until PRO-9 scoring lands
    0.2 * freshnessScore(provider.lastVerifiedAt, now) +
    0.3 * reviewScore(provider.reviewCount);

  let quality: number;
  if (behavioural) {
    const behaviouralScore =
      0.5 * behavioural.bookingConversion +
      0.3 * behavioural.responseRate +
      0.2 * (1 - behavioural.cancellationRate);
    quality = 0.65 * staticSignals + 0.35 * behaviouralScore;
  } else {
    // Degrade to static signals at full weight — never score missing
    // behavioural signals as zero (SRCH-14 note).
    quality = staticSignals;
  }

  let score = 0.55 * relevance + 0.45 * quality;

  if (transactability === "enquiry_only") {
    score *= RANKING_CONFIG.advertisingOnlyMultiplier;
  }

  return { provider, score, rankerVersion: RANKING_CONFIG.version };
}

export function rank(inputs: RankInput[], now = new Date()): RankedResult[] {
  return inputs
    .map((input) => scoreProvider(input, now))
    .sort((a, b) => b.score - a.score);
}
