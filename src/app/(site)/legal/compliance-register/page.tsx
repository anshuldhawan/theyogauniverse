import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { COMPLIANCE_REGISTER, PROCESSING_REGISTER } from "@/lib/compliance-register";

export const metadata: Metadata = { title: "Compliance controls register" };

export default function ComplianceRegisterPage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Transparency</Eyebrow>
      <h1 className="display-2">Compliance controls register</h1>
      <p className="mt-5 text-body">
        This is an engineering and operations register, not a certification of legal
        compliance. “External required” means counsel, regulator, insurer, or vendor work
        has not been represented as complete.
      </p>
      <div className="mt-8 space-y-4">
        {COMPLIANCE_REGISTER.map((entry) => (
          <section key={entry.id} className="rounded-[14px] border border-mint-200 p-5">
            <p className="eyebrow">{entry.id} · {entry.status.replaceAll("_", " ")}</p>
            <h2 className="mt-2 font-heading text-xl text-forest">{entry.control}</h2>
            <p className="mt-2 text-sm text-body">{entry.evidence}</p>
            <p className="mt-2 text-xs text-faint">Owner: {entry.owner}</p>
          </section>
        ))}
      </div>
      <h2 className="mt-12 font-heading text-3xl text-forest">Processing register</h2>
      <div className="mt-5 space-y-3">
        {PROCESSING_REGISTER.map((entry) => (
          <section key={entry.activity} className="rounded-[14px] bg-mint p-4">
            <h3 className="font-medium text-forest">{entry.activity}</h3>
            <p className="mt-1 text-sm text-body">Basis: {entry.basis}. Retention: {entry.retention}.</p>
          </section>
        ))}
      </div>
    </div>
  );
}
