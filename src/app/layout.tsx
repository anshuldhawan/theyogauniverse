import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Petrona, Roboto } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { ComplianceProviders } from "@/components/ComplianceProviders";
import { PwaBootstrap } from "@/components/PwaControls";
import { authEnabled } from "@/lib/auth";
import "./globals.css";

// Petrona is variable, so the 300 weight the display type uses comes for free.
const petrona = Petrona({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-petrona",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "The Yoga Universe",
    template: "%s · The Yoga Universe",
  },
  description:
    "The definitive index of yoga, meditation and breathwork teachers, studios, retreats and trainings across 50 cities worldwide.",
  // Google Search Console site verification (emitted only when the env var is
  // set — value comes from Search Console's "HTML tag" verification method).
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const app = (
    <NextIntlClientProvider>
      <ComplianceProviders identify={authEnabled()}>{children}</ComplianceProviders>
    </NextIntlClientProvider>
  );

  return (
    <html lang={locale} className={`${petrona.variable} ${roboto.variable}`}>
      <body>
        {authEnabled() ? <ClerkProvider>{app}</ClerkProvider> : app}
        <PwaBootstrap />
      </body>
    </html>
  );
}
