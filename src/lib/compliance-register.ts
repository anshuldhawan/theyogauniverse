export type ControlStatus = "implemented" | "operational_review" | "external_required";

export interface ComplianceRegisterEntry {
  id: string;
  control: string;
  owner: string;
  status: ControlStatus;
  evidence: string;
}

/**
 * Product/operations register, not a declaration of legal compliance.
 * External-required entries must never be presented as completed.
 */
export const COMPLIANCE_REGISTER: readonly ComplianceRegisterEntry[] = [
  { id: "COMP-1", control: "Lawful-basis and processing register", owner: "Privacy lead", status: "operational_review", evidence: "Register and request workflow implemented; DPIAs, EU representative and Article 14 campaign remain external." },
  { id: "COMP-2", control: "Australian cross-border disclosure and breach response", owner: "Privacy lead", status: "external_required", evidence: "Policy disclosure implemented; response plan needs Australian review." },
  { id: "COMP-3", control: "Sale/sharing opt-out and Global Privacy Control", owner: "Engineering", status: "implemented", evidence: "Optional tags are consent-gated; GPC forces optional categories off." },
  { id: "COMP-4", control: "Data-subject request intake and SLA", owner: "Privacy operations", status: "implemented", evidence: "Public six-right intake, identity-verification state, 30-day due date and transition history." },
  { id: "COMP-5", control: "Cookie and analytics consent", owner: "Engineering", status: "implemented", evidence: "Analytics providers do not mount before affirmative consent." },
  { id: "COMP-6", control: "Age eligibility", owner: "Trust & Safety", status: "operational_review", evidence: "Jurisdiction-aware age policy and server validation available; account onboarding integration remains." },
  { id: "COMP-8", control: "DSA notice and action", owner: "Trust & Safety", status: "implemented", evidence: "Public notice intake and mandatory decision statement." },
  { id: "COMP-9", control: "Ranking transparency", owner: "Search", status: "operational_review", evidence: "Public parameter statement includes transactability demotion; legal wording review remains." },
  { id: "COMP-10", control: "Consumer price, cancellation and recurring-payment protections", owner: "Legal and Commerce", status: "operational_review", evidence: "All-in price and mandatory disclosure gate implemented for EU/UK/AU/US consumers; jurisdictional legal validation remains external." },
  { id: "COMP-11", control: "Paid placement", owner: "Product", status: "implemented", evidence: "Disabled in v1; enabling requires register update and visible labelling." },
  { id: "COMP-12", control: "Statutory accessibility obligations (EAA, ADA, Equality Act, DDA)", owner: "Legal and Engineering", status: "external_required", evidence: "Governance control records scoped reviews and findings without claiming legal compliance; statutory assessment and remediation evidence remain required." },
  { id: "COMP-13", control: "Provider insurance position", owner: "Risk", status: "external_required", evidence: "Provider obligation stated; platform E&O/cyber placement not represented as complete." },
  { id: "COMP-14", control: "US indirect-tax monitoring", owner: "Finance", status: "operational_review", evidence: "Quarterly exception model implemented; registrations and Stripe Tax setup remain external." },
  { id: "COMP-15", control: "Foreign-tax scope guard", owner: "Finance", status: "implemented", evidence: "Foreign Track B disabled and non-US performance blocked; bundled-retreat question remains with counsel." },
  { id: "COMP-16", control: "Sanctions decisions", owner: "Compliance", status: "operational_review", evidence: "Jurisdiction decisions include outcome, reason and list version; denied-party vendor/counsel review remains." },
];

export const PROCESSING_REGISTER = [
  { activity: "Accounts and authentication", basis: "contract", retention: "account life plus required legal period" },
  { activity: "Marketplace bookings and payments", basis: "contract and legal obligation", retention: "statutory financial-record period" },
  { activity: "Public professional index", basis: "legitimate interests", retention: "while current; permanent suppression after valid removal" },
  { activity: "Health intake", basis: "explicit consent", retention: "short listing-specific period after service" },
  { activity: "Fraud and sanctions screening", basis: "legal obligation and legitimate interests", retention: "decision log retention schedule" },
  { activity: "Optional analytics", basis: "consent", retention: "provider-configured minimised period" },
] as const;
