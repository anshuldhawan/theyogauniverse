"use client";

import Link from "next/link";
import { useState } from "react";
import { ChipStart } from "@/components/ui";

export interface StartHereItem {
  name: string;
  note: string;
  post: { id: string; title: string; category: string; excerpt: string; meta: string };
  listings: {
    name: string;
    kindLabel: string;
    placeLine: string;
    tagline: string;
    href: string;
  }[];
}

/** Situation finder: select to reveal a note, one post and two listings. */
export function StartHere({ items }: { items: StartHereItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const selected = open === null ? null : items[open];

  return (
    <div>
      <div className="flex flex-wrap gap-2.25">
        {items.map((item, i) => (
          <ChipStart
            key={item.name}
            active={open === i}
            aria-pressed={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.name}
          </ChipStart>
        ))}
      </div>
      {selected && (
        <div className="mt-7 border-t border-mint pt-6.5">
          <p className="mb-5 max-w-[60ch] text-[15px] leading-relaxed text-body">
            {selected.note}
          </p>
          <div className="grid-fit-240 gap-4">
            <Link
              href={`/blog/${selected.post.id}`}
              className="flex flex-col gap-2.5 rounded-[14px] border border-mint-200 bg-mint p-5 transition-colors hover:border-sage"
            >
              <span className="text-[10px] uppercase tracking-[0.18em] text-leaf">
                Read first · {selected.post.category}
              </span>
              <h3 className="heading-card text-xl leading-tight text-pretty">
                {selected.post.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-body text-pretty">
                {selected.post.excerpt}
              </p>
              <span className="mt-auto text-[12px] text-faint">{selected.post.meta}</span>
            </Link>
            {selected.listings.map((listing) => (
              <Link
                key={listing.href}
                href={listing.href}
                className="flex flex-col gap-2.5 rounded-[14px] border border-mint-200 bg-white p-5 transition-colors hover:border-sage"
              >
                <span className="text-[10px] uppercase tracking-[0.18em] text-orange">
                  {listing.kindLabel}
                </span>
                <h3 className="heading-card text-xl leading-tight">{listing.name}</h3>
                <p className="text-[13px] text-muted">{listing.placeLine}</p>
                <p className="text-[14px] leading-relaxed text-body text-pretty">
                  {listing.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
