import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PrivacyChoicesButton } from "@/components/ComplianceProviders";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

const indexLinks = [
  { href: "/directory", label: "Everything" },
  { href: "/directory?kind=teacher", label: "Teachers" },
  { href: "/directory?kind=studio", label: "Studios" },
  { href: "/directory?kind=retreat", label: "Retreats" },
  { href: "/directory?kind=training", label: "Teacher training" },
  { href: "/directory?kind=breathwork", label: "Breathwork" },
  { href: "/directory?kind=meditation", label: "Meditation" },
];

const moreLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/guides/yoga-sutras", label: "The Yoga Sutras" },
  { href: "/places/rishikesh", label: "Rishikesh" },
  { href: "/dashboard", label: "For teachers" },
  { href: "/help/how-booking-works", label: "How booking works" },
  { href: "/help/verification", label: "Verification" },
  { href: "/legal/editorial-policy", label: "Editorial policy" },
];

export async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="bg-forest text-sage-pale">
      <div className="shell flex flex-wrap justify-between gap-9 pt-[clamp(36px,5vw,64px)]">
        <div className="flex-1 basis-65">
          <p className="mb-4.5 font-heading text-2xl font-light text-white">
            The Yoga Universe
          </p>
          <p className="max-w-[40ch] text-[14.5px] leading-relaxed text-sage">
            {t("tagline")}
          </p>
        </div>
        <div className="flex-none basis-42.5">
          <p className="label mb-4 text-sage">{t("indexColumn")}</p>
          <div className="flex flex-col gap-2.75">
            {indexLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14.5px] text-white hover:text-amber"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex-none basis-42.5">
          <p className="label mb-4 text-sage">{t("moreColumn")}</p>
          <div className="flex flex-col gap-2.75">
            {moreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14.5px] text-white hover:text-amber"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="shell mt-10 flex flex-wrap justify-between gap-3 border-t border-sage/25 pt-5 pb-8 text-[12px] text-sage-600">
        <span className="flex flex-wrap items-center gap-4">
          <span>© 2026 The Yoga Universe</span>
          <LocaleSwitcher />
        </span>
        <span className="flex flex-wrap gap-4">
          <PrivacyChoicesButton />
          <Link href="/legal/privacy/requests" className="text-sage-600 hover:text-amber">
            Privacy request
          </Link>
          <Link href="/legal/dsa-notice" className="text-sage-600 hover:text-amber">
            Report illegal content
          </Link>
          <Link href="/legal/ranking" className="text-sage-600 hover:text-amber">
            Ranking
          </Link>
          <Link href="/legal/compliance-register" className="text-sage-600 hover:text-amber">
            Controls register
          </Link>
          <Link href="/legal/removal" className="text-sage-600 hover:text-amber">
            Remove a listing
          </Link>
          <Link href="/legal/privacy" className="text-sage-600 hover:text-amber">
            {t("privacy")}
          </Link>
          <Link href="/legal/terms" className="text-sage-600 hover:text-amber">
            {t("terms")}
          </Link>
        </span>
      </div>
    </footer>
  );
}
