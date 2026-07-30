import type { Metadata } from "next";
import { DsaNoticeForm } from "@/components/site/ComplianceForms";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Notice of illegal content" };

export default function DsaNoticePage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">EU Digital Services Act</Eyebrow>
      <h1 className="display-2">Report illegal content or services</h1>
      <p className="mt-5 text-body">
        This notice-and-action channel covers listings, profiles, reviews, and services
        offered through the platform. We retain the notice, review the identified target,
        and provide a statement of reasons when action is taken or declined.
      </p>
      <DsaNoticeForm />
    </div>
  );
}
