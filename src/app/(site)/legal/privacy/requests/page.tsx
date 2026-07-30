import type { Metadata } from "next";
import { DataRequestForm } from "@/components/site/ComplianceForms";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy request" };

export default function PrivacyRequestPage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Privacy</Eyebrow>
      <h1 className="display-2">Exercise your data rights</h1>
      <p className="mt-5 text-body">
        Request access, correction, erasure, portability, objection, or an opt-out of
        sale/sharing. No account is required. We verify identity before disclosing or
        deleting data and track requests against a 30-day operational deadline.
      </p>
      <DataRequestForm />
    </div>
  );
}
