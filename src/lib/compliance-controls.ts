export type ConsumerRegion = "EU" | "UK" | "AU" | "US";

export interface PriceComponent {
  code: string;
  amount: number;
  mandatory: boolean;
  disclosedBeforeCheckout: boolean;
}

export function assessConsumerOffer(input: {
  region: ConsumerRegion;
  baseAmount: number;
  components: PriceComponent[];
  recurring: boolean;
  renewalConsentAt?: Date | null;
  cancellationDisclosure: boolean;
}): { allowed: boolean; allInAmount: number; violations: string[] } {
  const violations: string[] = [];
  if (!Number.isInteger(input.baseAmount) || input.baseAmount < 0) {
    violations.push("invalid_base_price");
  }
  for (const component of input.components) {
    if (!Number.isInteger(component.amount) || component.amount < 0) {
      violations.push(`invalid_component:${component.code}`);
    }
    if (component.mandatory && !component.disclosedBeforeCheckout) {
      violations.push(`undisclosed_mandatory_fee:${component.code}`);
    }
  }
  if (input.recurring && !input.renewalConsentAt) violations.push("missing_recurring_consent");
  if (!input.cancellationDisclosure) violations.push("missing_cancellation_disclosure");
  return {
    allowed: violations.length === 0,
    allInAmount:
      input.baseAmount +
      input.components.filter((component) => component.mandatory).reduce((sum, item) => sum + item.amount, 0),
    violations,
  };
}

export interface AccessibilityControlReview {
  reviewedAt: Date;
  reviewer: string;
  scope: string[];
  findingsOpen: number;
  evidenceRefs: string[];
}

/**
 * COMP-12 is a statutory-obligations control, not a certification. A recorded
 * review demonstrates governance only and must never be rendered as a claim
 * that the service complies with EAA/ADA/Equality Act/DDA.
 */
export function accessibilityControlState(review?: AccessibilityControlReview): {
  status: "external_required" | "operational_review";
  claim: "no_legal_compliance_claim";
  reason: string;
} {
  if (!review || !review.reviewer.trim() || review.scope.length === 0 || review.evidenceRefs.length === 0) {
    return {
      status: "external_required",
      claim: "no_legal_compliance_claim",
      reason: "A scoped statutory accessibility review and evidence are required.",
    };
  }
  return {
    status: "operational_review",
    claim: "no_legal_compliance_claim",
    reason:
      review.findingsOpen > 0
        ? `${review.findingsOpen} accessibility finding(s) remain open.`
        : "Control evidence recorded; this is not legal certification.",
  };
}
