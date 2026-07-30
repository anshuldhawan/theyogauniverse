import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { providerIsTransactable, resolveDashboardProvider } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: { template: "%s · The Yoga Universe Dashboard", default: "Provider dashboard" },
  robots: { index: false, follow: false },
};

const BASE_NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/onboarding", label: "Onboarding" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/schedule", label: "Timetable" },
  { href: "/dashboard/manage", label: "Tools" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const provider = resolveDashboardProvider();
  const nav = providerIsTransactable(provider)
    ? [
        ...BASE_NAV,
        { href: "/dashboard/bookings", label: "Bookings & check-in" },
        { href: "/dashboard/payouts", label: "Payouts" },
      ]
    : BASE_NAV;
  return (
    <div className="min-h-screen bg-mint">
      <header className="border-b border-forest/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-5 px-4 py-4 sm:px-6">
          <Link href="/" className="font-heading text-xl font-bold text-forest">
            The Yoga Universe <span className="text-sm font-normal text-sage-600">/ provider</span>
          </Link>
          <nav className="order-3 flex w-full gap-4 overflow-x-auto text-sm sm:order-none sm:w-auto">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-forest/80 hover:text-forest">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/directory" className="ml-auto text-sm text-sage-600 hover:text-forest">
            View public site →
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
