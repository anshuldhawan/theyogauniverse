import { Show, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { authEnabled } from "@/lib/auth";

export async function Header() {
  const t = await getTranslations("nav");
  const links = [
    { href: "/directory", label: t("index") },
    { href: "/blog", label: t("blog") },
    { href: "/guides/yoga-sutras", label: t("sutras") },
    { href: "/places/rishikesh", label: t("rishikesh") },
  ];
  return (
    <header className="sticky top-0 z-50 bg-forest text-white">
      <div className="shell flex flex-wrap items-center justify-between gap-4 py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/brand/mark-orange.png"
            alt=""
            width={34}
            height={34}
            className="block rounded-full"
            priority
          />
          <span className="flex shrink-0 flex-col leading-none">
            <span className="font-heading text-[21px] font-light tracking-[-0.01em] whitespace-nowrap text-white">
              The Yoga Universe
            </span>
            <span className="mt-1 text-[8.5px] tracking-[0.28em] whitespace-nowrap text-sage">
              YOGA · MEDITATION · BREATHWORK
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-[clamp(14px,2.2vw,28px)]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-1.5 text-[12px] uppercase tracking-[0.14em] text-white hover:text-amber"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="rounded-full bg-orange px-4.5 py-3 text-[12px] font-medium uppercase tracking-[0.14em] whitespace-nowrap text-forest hover:bg-amber hover:text-forest"
          >
            {t("forTeachers")}
          </Link>
          {authEnabled() && (
            <>
              <Show when="signed-out">
                <Link
                  href="/sign-in"
                  className="py-1.5 text-[12px] uppercase tracking-[0.14em] text-white hover:text-amber"
                >
                  Sign in
                </Link>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
