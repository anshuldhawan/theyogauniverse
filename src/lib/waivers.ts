/**
 * WVR — waivers. Templates are versioned and immutable (WVR-2); the version
 * signed is stored on the booking. Real templates are per-US-state and
 * counsel-approved before that state's inventory is bookable (WVR-1) — this
 * dev template is a placeholder pending counsel sign-off, tracked in
 * tracker/sections/WVR.md.
 */

export const CURRENT_WAIVER_VERSION = "us-general-v1";

export const WAIVER_TEXT = `ASSUMPTION OF RISK, WAIVER AND RELEASE — version us-general-v1 (placeholder pending counsel approval)

1. Voluntary participation. I am choosing to take part in yoga, breathwork,
meditation or related movement instruction ("the Activities") provided by the
listed provider. Participation is voluntary.

2. Assumption of risk. Physical activity carries risk of injury. I understand
the nature of the Activities, I am aware of my own medical condition and
limitations, and I accept full responsibility for practising within them. I
will inform the instructor of injuries or conditions that may affect my
participation, and I may rest or stop at any time.

3. Not medical advice. Instruction is not medical advice, diagnosis or
treatment. I have been advised to consult a physician before beginning any
exercise programme, particularly if pregnant or managing a medical condition.

4. Release. To the fullest extent permitted by the law of the state in which
the Activities take place, I release the provider, its teachers and staff,
and The Yoga Universe platform from liability for injury or loss arising from
ordinary negligence in connection with my participation. Nothing in this
waiver limits liability for gross negligence, recklessness or intentional
misconduct, or any liability that cannot lawfully be waived.

5. Platform role. The Yoga Universe processes bookings as the provider's commercial
agent. The Activities are provided by the provider, who is solely responsible
for their conduct and safety.

By checking the box and signing electronically I confirm I have read and
understood this waiver, and that I sign it freely.`;

export type HighRiskFormat = "prenatal" | "therapeutic" | "hot" | "aerial" | "breathwork" | "ice_exposure" | "inversions";

export interface WaiverTemplate {
  id: string;
  version: string;
  usState: string;
  providerId?: string;
  content: string;
  counselApprovedAt: Date | null;
}

/** WVR-1: drafts are never eligible for bookable inventory. */
export function selectApprovedTemplate(
  templates: WaiverTemplate[],
  usState: string,
  providerId?: string,
): WaiverTemplate | null {
  const eligible = templates
    .filter((template) =>
      template.usState.toUpperCase() === usState.toUpperCase() &&
      template.counselApprovedAt &&
      (!template.providerId || template.providerId === providerId),
    )
    .sort((a, b) => b.counselApprovedAt!.getTime() - a.counselApprovedAt!.getTime());
  return eligible.find((template) => template.providerId === providerId) ?? eligible[0] ?? null;
}

export interface WaiverSignature {
  templateId: string;
  version: string;
  bookingId: string;
  attendeeId: string;
  signedName: string;
  signedAt: Date;
  ipAddress: string;
  guardian?: { name: string; relationship: string; consentedAt: Date };
}

export function requiresResignature(
  signature: WaiverSignature | null,
  currentTemplate: WaiverTemplate,
): boolean {
  return !signature ||
    signature.templateId !== currentTemplate.id ||
    signature.version !== currentTemplate.version;
}

export function validateMinorConsent(
  age: number,
  guardian: WaiverSignature["guardian"],
): string | null {
  if (age < 16) return "Accounts are not available to children under 16.";
  if (age < 18 && !guardian) return "A parent or legal guardian must consent for this attendee.";
  return null;
}

const HEALTH_INTAKE_MANDATORY = new Set<HighRiskFormat>([
  "prenatal", "therapeutic", "hot", "aerial", "breathwork", "ice_exposure",
]);

export function healthIntakeRequired(formats: HighRiskFormat[], providerRequiresIt = false): boolean {
  return providerRequiresIt || formats.some((format) => HEALTH_INTAKE_MANDATORY.has(format));
}

export const CONTRAINDICATION_WARNINGS: Record<HighRiskFormat, string> = {
  prenatal: "Prenatal movement may require clinical clearance; consult your maternity clinician.",
  therapeutic: "Therapeutic yoga is not medical treatment; consult your clinician about limitations.",
  hot: "Heat increases cardiovascular load and dehydration risk.",
  aerial: "Aerial practice includes suspension and fall risk.",
  breathwork: "Hyperventilation-style breathwork can cause fainting and is unsuitable for some conditions.",
  ice_exposure: "Cold exposure can create acute cardiovascular and respiratory stress.",
  inversions: "Inversions may be unsuitable with glaucoma, uncontrolled blood pressure, or some injuries.",
};

export function preBookingWarnings(formats: HighRiskFormat[]): string[] {
  return [...new Set(formats)].map((format) => CONTRAINDICATION_WARNINGS[format]);
}

export interface HealthDataGrant {
  bookingId: string;
  providerId: string;
  encryptedPayload: string;
  keyScope: string;
  expiresAt: Date;
}

export function authoriseHealthDataRead(
  grant: HealthDataGrant,
  request: { bookingId: string; providerId: string; now: Date },
): { allowed: boolean; audit: { action: "health_data_read"; bookingId: string; providerId: string; at: Date } | null } {
  const allowed =
    grant.encryptedPayload.length > 0 &&
    grant.keyScope === `health:${grant.bookingId}:${grant.providerId}` &&
    grant.bookingId === request.bookingId &&
    grant.providerId === request.providerId &&
    request.now < grant.expiresAt;
  return {
    allowed,
    audit: allowed
      ? { action: "health_data_read", bookingId: request.bookingId, providerId: request.providerId, at: request.now }
      : null,
  };
}

export function validateEmergencyContact(
  listingType: string,
  contact: { name: string; phone: string } | null,
): boolean {
  if (listingType !== "retreat" && listingType !== "teacher_training") return true;
  return Boolean(contact?.name.trim() && contact.phone.trim());
}

/** Stable printable artifact; the HTTP layer can render these fields to PDF. */
export function waiverCopy(signature: WaiverSignature, template: WaiverTemplate): string {
  if (signature.templateId !== template.id || signature.version !== template.version) {
    throw new Error("Signature does not match waiver template.");
  }
  return [
    template.content,
    "",
    `Version: ${signature.version}`,
    `Signed by: ${signature.signedName}`,
    `Signed at: ${signature.signedAt.toISOString()}`,
    `Booking: ${signature.bookingId}`,
  ].join("\n");
}
