import type { Metadata } from "next";
import { Card, EmptyState, SectionLabel } from "@/components/ui";
import { CheckInForm } from "@/components/dashboard/CheckInForm";
import { providerIsTransactable, resolveDashboardProvider, transactionPanel } from "@/lib/dashboard";
import { formatMoney } from "@/lib/money";
import { slotById } from "@/lib/repo";

export const metadata: Metadata = { title: "Bookings & check-in" };

interface Props {
  searchParams: Promise<{ as?: string }>;
}

export default async function BookingsPage({ searchParams }: Props) {
  const { as } = await searchParams;
  const provider = resolveDashboardProvider(as);

  // DASH-8: bookings are transactable-only by construction — advertising-only
  // providers have no booking data because none exists (PAY-17a).
  if (!providerIsTransactable(provider)) {
    return (
      <div>
        <SectionLabel>Bookings</SectionLabel>
        <h1 className="mt-2 text-3xl">Bookings & check-in</h1>
        <div className="mt-8">
          <EmptyState title="Your listings run in advertising mode">
            Seekers book with you directly, so there is nothing to check in
            here. Your public-page performance lives on the overview.
          </EmptyState>
        </div>
      </div>
    );
  }

  const panel = transactionPanel(provider);

  return (
    <div>
      <SectionLabel>Bookings</SectionLabel>
      <h1 className="mt-2 text-3xl">Bookings & check-in</h1>

      {/* BKG-17: scannable from a mobile browser at the door (WEB-4). */}
      <Card className="mt-8 max-w-xl p-6">
        <h2 className="text-lg">Check in a student</h2>
        <p className="mt-1 text-sm text-sage-600">
          Enter the reference from the student&apos;s confirmation (or QR scan).
          Attendance opens their review window (REV-1); no-shows feed your
          policy engine.
        </p>
        <CheckInForm />
      </Card>

      <section className="mt-10">
        <h2 className="text-lg">All bookings</h2>
        {panel.bookings.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No bookings yet">
              Bookings appear here the moment a student checks out.
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {panel.bookings.map((booking) => {
              const slot = slotById(booking.slotId);
              return (
                <Card key={booking.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
                  <span className="font-mono font-semibold text-forest">{booking.reference}</span>
                  <span>{booking.guestName}</span>
                  <span className="text-sage-600">
                    {slot?.what} · {slot?.day} {slot?.time}
                  </span>
                  <span className="ml-auto">
                    {booking.price ? formatMoney(booking.price) : "Donation"}
                  </span>
                  <span className="rounded-full bg-mint px-3 py-1 text-xs font-medium text-forest">
                    {booking.state.replace(/_/g, " ")}
                  </span>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
