import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { RemovalForm } from "@/components/site/RemovalForm";

export const metadata: Metadata = {
  title: "Request listing removal",
  description:
    "Ask The Yoga Universe to remove a professional listing. No account needed; requests are actioned within 72 hours and removal is permanent.",
};

/**
 * ING-7 / Decision #7 — the public half of the opt-out guarantee. The index
 * lists professionals we have no commercial relationship with; this page is
 * how any of them can be removed, without an account.
 */
export default function RemovalPage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Legal</Eyebrow>
      <h1 className="display-2">Request listing removal</h1>
      <div className="prose-editorial mt-7">
        <p>
          The Yoga Universe indexes publicly available professional information so students can
          find teachers, studios and retreats. If you are listed and would rather not be, tell us
          below — you do not need an account, and we do not ask you to prove ownership beyond the
          contact details already on the listing.
        </p>
        <ul>
          <li>Requests from the listing&apos;s own contact email are honoured immediately.</li>
          <li>Every other request is reviewed and actioned within 72 hours.</li>
          <li>Removal is permanent: the listing is suppressed from every page and cannot be re-created by our data sources.</li>
        </ul>
        <p>
          If you would rather keep the listing and manage it yourself, you can{" "}
          <Link href="/claim">claim your profile</Link> instead. For anything else about personal
          data, see our <Link href="/legal/privacy">privacy policy</Link>.
        </p>
      </div>
      <div className="mt-8">
        <RemovalForm />
      </div>
    </div>
  );
}
