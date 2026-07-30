/**
 * BLG-47a — approved medical-disclaimer copy. Legal owns the wording;
 * Editorial owns the placement. The disclaimer never substitutes for
 * accuracy, for the clinical reviewer tier, or for liability limits.
 */

export const DISCLAIMER_COPY = {
  standard:
    "This article is for general information and is not medical advice. Yoga, breathwork and meditation affect people differently. Please consult your doctor before starting or changing a practice, especially if you are pregnant, recovering from injury or illness, or managing a health condition.",
  "high-risk":
    "This practice carries specific risks and is not suitable for everyone. Please consult your doctor before trying it, particularly with cardiovascular conditions, epilepsy, pregnancy, or a history of fainting.",
  inline:
    "Research on this is early and mixed — please consult your doctor about what is appropriate for you.",
  footer:
    "General information, not medical advice. See our editorial and medical policy.",
} as const;

/**
 * BLG-21 item 12 / BLG-47 — high-risk claim phrases. Any hit routes the
 * draft to legal check and asserts disclaimer presence + inline placement
 * (item 11). Configured, not hardcoded into the gate logic.
 */
export const HIGH_RISK_PHRASES: string[] = [
  "blood pressure",
  "anxiety",
  "depression",
  "fertility",
  "pregnan", // pregnancy, pregnant
  "postnatal",
  "prenatal",
  "injur", // injury, injuries, injured
  "rehabilitation",
  "medication",
  "cardiovascular",
  "epilepsy",
  "trauma",
  "nervous system",
  "cures",
  "heals",
  "treats",
  "therapeutic",
  "mental health",
  "hyperventilation",
];

/**
 * Word-boundary prefix match: "pregnan" catches pregnancy/pregnant, while
 * "treats" no longer fires inside "retreats".
 */
export function detectHighRiskPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return HIGH_RISK_PHRASES.filter((phrase) => new RegExp(`\\b${phrase}`).test(lower));
}
