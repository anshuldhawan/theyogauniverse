import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink, SectionLabel } from "@/components/ui";
import { EightLimbs } from "@/components/site/EightLimbs";

export const metadata: Metadata = {
  title: "The Yoga Sutras of Patanjali — a plain guide",
  description:
    "The four books of the Yoga Sutras, the eight limbs explained from outward conduct to samadhi, and why a 2,000-year-old text matters to a weekly class.",
};

const BOOKS = [
  {
    label: "Book I · Samadhi Pada · 51 verses",
    note: "What yoga is, what the mind does instead, and the states of absorption available to someone who stops it. Written as if for a reader already practising.",
  },
  {
    label: "Book II · Sadhana Pada · 55 verses",
    note: "The practical book: the causes of suffering, and the eight limbs. This is where posture appears, in three verses, described only as a steady and comfortable seat.",
  },
  {
    label: "Book III · Vibhuti Pada · 56 verses",
    note: "Concentration, meditation and absorption — and a long catalogue of resulting powers, which Patanjali then warns are obstacles rather than achievements.",
  },
  {
    label: "Book IV · Kaivalya Pada · 34 verses",
    note: "The philosophical close: the nature of mind and matter, and liberation as the end of identification rather than the gaining of anything.",
  },
];

export default function SutrasPage() {
  return (
    <>
      <section className="bg-forest text-white">
        <div className="shell-1100 flex flex-wrap items-center gap-[clamp(24px,4vw,48px)] py-[clamp(36px,5vw,72px)]">
          <div className="min-w-65 flex-[1_1_340px]">
            <p className="eyebrow-hero mb-4.5">The source text</p>
            <h1 className="font-heading text-[clamp(32px,5vw,60px)] leading-[1.05] font-light tracking-[-0.02em] text-white">
              The Yoga Sutras of Patanjali
            </h1>
            <p className="mt-5 max-w-[50ch] text-[clamp(16px,1.5vw,19px)] leading-[1.7] text-sage-pale">
              196 short aphorisms, compiled somewhere between 200 BCE and 400 CE, that
              define what yoga actually is. Three of them mention posture.
            </p>
          </div>
          <div className="relative flex h-[clamp(240px,30vw,360px)] min-w-65 flex-[1_1_300px] items-center justify-center overflow-hidden rounded-2xl bg-forest-800">
            <Image
              src="/brand/mark-green.png"
              alt=""
              width={360}
              height={360}
              aria-hidden
              className="w-[62%] opacity-25"
            />
          </div>
        </div>
      </section>

      <div className="shell-760 shell-inset pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,7vw,90px)]">
        <p className="mb-6.5 text-[17.5px] leading-[1.8] text-article text-pretty">
          Patanjali did not invent yoga and probably did not write the Sutras alone. He
          compiled an existing oral tradition into four short books — the{" "}
          <em className="font-heading italic">padas</em> — in a compressed style meant to
          be memorised and then unpacked by a teacher. This is why the text feels terse to
          the point of unhelpfulness on first reading, and why almost nobody reads it
          without a commentary.
        </p>
        <p className="mb-10 text-[17.5px] leading-[1.8] text-article text-pretty">
          Its second verse is the whole definition, and it says nothing about the body:{" "}
          <em className="font-heading italic">yogaś citta-vṛtti-nirodhaḥ</em> — yoga is the
          stilling of the movements of the mind. Everything else in the text is method or
          consequence.
        </p>

        <h2 className="display-3 mb-6">The four books</h2>
        <div className="stack-table mb-12">
          {BOOKS.map((book) => (
            <div key={book.label} className="block bg-white p-5">
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-leaf">
                {book.label}
              </p>
              <p className="text-[15.5px] leading-[1.7] text-body">{book.note}</p>
            </div>
          ))}
        </div>

        <h2 className="display-3 mb-2.5">The eight limbs</h2>
        <p className="mb-6 text-[16px] leading-[1.7] text-muted">
          Ashtanga — literally eight limbs. The word names this structure, long before it
          named a sequence of postures.
        </p>
        <div className="mb-12">
          <EightLimbs />
        </div>

        <div className="mb-11 rounded-[18px] bg-mint p-[clamp(24px,3.4vw,40px)]">
          <SectionLabel className="mb-4.5 tracking-[0.24em]">
            Why it matters to a Tuesday class
          </SectionLabel>
          <p className="font-heading text-[clamp(20px,2.4vw,28px)] leading-[1.45] font-light text-forest text-pretty">
            If posture is one of eight limbs and gets three verses out of 196, then a
            practice built entirely on it is not wrong — it is simply small. Most teachers
            in this index will tell you the same thing in their own words.
          </p>
        </div>

        <h2 className="display-4 mb-4.5">Where to start reading</h2>
        <p className="mb-3.5 text-[16.5px] leading-[1.75] text-article">
          Read a translation with commentary, not a bare one. Bare translations of a
          deliberately compressed text produce confident misreadings.
        </p>
        <p className="mb-8.5 text-[16.5px] leading-[1.75] text-article">
          Read Book II first, then Book I. Book III&apos;s list of powers derails most
          first readings, and Book IV means little until the rest has settled.
        </p>
        <ButtonLink href="/directory?q=philosophy" tone="forest">
          Find a teacher who teaches philosophy
        </ButtonLink>
      </div>
    </>
  );
}
