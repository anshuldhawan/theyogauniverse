import { describe, expect, it } from "vitest";
import {
  authoriseHealthDataRead,
  healthIntakeRequired,
  preBookingWarnings,
  requiresResignature,
  selectApprovedTemplate,
  validateEmergencyContact,
  validateMinorConsent,
  waiverCopy,
  type WaiverSignature,
  type WaiverTemplate,
} from "./waivers";

const template: WaiverTemplate = {
  id: "waiver-ny-2", version: "2", usState: "NY", content: "Approved terms",
  counselApprovedAt: new Date("2026-07-01"),
};
const signature: WaiverSignature = {
  templateId: template.id, version: "2", bookingId: "booking", attendeeId: "attendee",
  signedName: "Student", signedAt: new Date("2026-07-02T10:00:00Z"), ipAddress: "192.0.2.1",
};

describe("waiver and health controls", () => {
  it("gates templates on explicit state counsel approval (WVR-1)", () => {
    const draft = { ...template, id: "draft", counselApprovedAt: null };
    expect(selectApprovedTemplate([draft], "NY")).toBeNull();
    expect(selectApprovedTemplate([draft, template], "ny")).toEqual(template);
  });

  it("requires re-signature on immutable template changes and provides a printable copy (WVR-2)", () => {
    expect(requiresResignature(signature, template)).toBe(false);
    expect(requiresResignature(signature, { ...template, version: "3" })).toBe(true);
    expect(waiverCopy(signature, template)).toContain("Signed at: 2026-07-02T10:00:00.000Z");
  });

  it("makes intake mandatory and surfaces warnings for high-risk formats (WVR-3/7)", () => {
    expect(healthIntakeRequired(["hot"])).toBe(true);
    expect(preBookingWarnings(["breathwork", "ice_exposure"])).toHaveLength(2);
  });

  it("restricts health reads by booking, provider, key scope and retention (WVR-4)", () => {
    const grant = {
      bookingId: "b", providerId: "p", encryptedPayload: "ciphertext",
      keyScope: "health:b:p", expiresAt: new Date("2026-08-01"),
    };
    expect(authoriseHealthDataRead(grant, { bookingId: "b", providerId: "p", now: new Date("2026-07-01") })).toMatchObject({ allowed: true, audit: { action: "health_data_read" } });
    expect(authoriseHealthDataRead(grant, { bookingId: "b", providerId: "other", now: new Date("2026-07-01") }).allowed).toBe(false);
  });

  it("enforces minor guardian and emergency-contact rules (WVR-5/6)", () => {
    expect(validateMinorConsent(15, undefined)).toContain("under 16");
    expect(validateMinorConsent(17, undefined)).toContain("guardian");
    expect(validateMinorConsent(17, { name: "Parent", relationship: "parent", consentedAt: new Date() })).toBeNull();
    expect(validateEmergencyContact("retreat", null)).toBe(false);
    expect(validateEmergencyContact("recurring_class", null)).toBe(true);
  });
});
