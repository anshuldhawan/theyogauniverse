"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BLOG_TOUCH_COOKIE } from "@/lib/editorial/attribution";

/**
 * BLG-43 — assisted-booking attribution. Reading an article drops a 7-day
 * first-party touch; the booking action reads it at confirmation and reports
 * blog-assisted bookings (the KPI — never sessions or pageviews).
 */
export function BlogAttribution({ slug }: { slug: string }) {
  useEffect(() => {
    document.cookie = `${BLOG_TOUCH_COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=${7 * 86400}; samesite=lax`;
  }, [slug]);
  return null;
}

/** BLG-42: the "On The Yoga Universe" block, with commercial-click beacons. */
export function CommercialLinks({
  articleSlug,
  links,
}: {
  articleSlug: string;
  links: { href: string; anchor: string }[];
}) {
  const beacon = (href: string) => {
    const body = JSON.stringify({
      name: "article_commercial_click",
      payload: { article: articleSlug, href },
    });
    navigator.sendBeacon?.("/api/analytics", new Blob([body], { type: "application/json" }));
  };
  return (
    <ul className="mt-3.5 flex flex-col gap-2 text-[15.5px]">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            onClick={() => beacon(link.href)}
            className="underline decoration-sage underline-offset-2"
          >
            {link.anchor}
          </Link>
        </li>
      ))}
    </ul>
  );
}
