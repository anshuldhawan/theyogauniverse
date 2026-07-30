import type { Metadata } from "next";
import { Card, SectionLabel } from "@/components/ui";
import {
  providerIsTransactable,
  resolveDashboardProvider,
  transactionPanel,
  visibleMarketingTools,
} from "@/lib/dashboard";

export const metadata: Metadata = { title: "Provider tools" };

const TOOL_LABELS: Record<string, string> = {
  social_cards: "Shareable social cards",
  link_in_bio: "Link-in-bio page",
  media: "Profile and listing media",
  promo_codes: "Promo codes",
  intro_offers: "Intro offers",
  packs_memberships: "Packs and memberships",
  gift_cards: "Gift cards",
};

export default function ProviderToolsPage() {
  const provider = resolveDashboardProvider();
  const transactable = providerIsTransactable(provider);
  const tools = visibleMarketingTools(transactable);
  const bookings = transactable ? transactionPanel(provider).bookings : [];
  const students = new Map(
    bookings.map((booking) => [
      booking.guestEmail.toLowerCase(),
      { name: booking.guestName, email: booking.guestEmail, bookings: 0 },
    ]),
  );
  for (const booking of bookings) {
    const student = students.get(booking.guestEmail.toLowerCase());
    if (student) student.bookings += 1;
  }

  return (
    <div>
      <SectionLabel>DASH-4 / 8 / 9 / 10</SectionLabel>
      <h1 className="mt-2 text-3xl">Provider tools</h1>

      <section className="mt-8">
        <h2 className="text-lg">Marketing</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool} className="p-5">
              <h3 className="font-medium">{TOOL_LABELS[tool]}</h3>
              <p className="mt-1 text-xs text-sage-600">Available for this provider</p>
            </Card>
          ))}
        </div>
      </section>

      {transactable && (
        <section className="mt-10">
          <h2 className="text-lg">Student CRM</h2>
          <p className="mt-1 text-sm text-sage-600">
            Contacts are derived only from this provider&apos;s bookings.
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-mint-200 bg-white">
            {[...students.values()].map((student) => (
              <div key={student.email} className="flex flex-wrap justify-between gap-3 border-t border-mint-200 p-4 first:border-0">
                <span>{student.name}</span>
                <span className="text-sm text-sage-600">{student.email}</span>
                <span className="text-sm">{student.bookings} booking(s)</span>
              </div>
            ))}
            {students.size === 0 && <p className="p-5 text-sm text-sage-600">No students yet.</p>}
          </div>
        </section>
      )}

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg">Team &amp; roles</h2>
          <p className="mt-2 text-sm leading-relaxed text-sage-600">
            Invite owners, admins, managers or check-in staff. Invitations expire after seven days.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg">Booking policies</h2>
          <p className="mt-2 text-sm leading-relaxed text-sage-600">
            Manage cancellation notice, waiver wording, house rules and booking windows.
          </p>
        </Card>
      </section>
    </div>
  );
}
