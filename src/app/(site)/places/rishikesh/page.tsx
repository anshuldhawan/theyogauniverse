import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink, SectionLabel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Rishikesh — the yoga capital, honestly described",
  description:
    "History, ashrams, teacher trainings and travel notes for Rishikesh, from the rishis through Sivananda and the Beatles ashram to the modern training industry.",
};

const OFFERINGS = [
  {
    title: "Teacher training",
    note: "The town's main export. 200hr and 300hr courses, mostly residential, concentrated in Tapovan and Upper Swarg Ashram. Check accreditation and how many hours are actually taught, not advertised.",
  },
  {
    title: "Ashram stays",
    note: "Traditional residential practice with a fixed daily schedule, shared rooms and a 5am start. Parmarth Niketan and the Sivananda ashram take long-stay students; several accept walk-ins.",
  },
  {
    title: "Drop-in classes",
    note: "Hatha, Ashtanga and Iyengar all over the east bank, often on rooftops, usually 200–500 rupees. Quality varies by teacher rather than by venue — ask who is teaching, not where.",
  },
  {
    title: "Silent & meditation retreats",
    note: "Vipassana courses, silent sits and shorter three-day retreats, mostly on the quieter hillsides above the town rather than in the centre.",
  },
  {
    title: "Ayurveda & panchakarma",
    note: "Consultations, massage and full panchakarma programmes of one to three weeks. Look for a BAMS-qualified practitioner; the title is a real degree and easy to check.",
  },
  {
    title: "Ganga Aarti",
    note: "The evening fire ceremony at Triveni Ghat and Parmarth Niketan. Free, daily at sunset, and the one thing worth doing on your first evening.",
  },
  {
    title: "Sound, kirtan & philosophy",
    note: "Sanskrit and sutra study, chanting groups and kirtan most evenings. The philosophy courses are the most under-attended and often the best value in town.",
  },
  {
    title: "The river, and walking",
    note: "Rafting from September to June, beaches upstream, and the walk up to Neelkanth Mahadev — traditionally done on foot, and still the best day out of town.",
  },
];

const TRAVEL = [
  "Jolly Grant airport (DED), 20km — an hour from Delhi.",
  "Haridwar Junction, 25km, is the practical railhead.",
  "Six hours by road from Delhi, longer in the monsoon.",
];

export default function RishikeshPage() {
  return (
    <>
      <section className="bg-forest text-white">
        <div className="shell py-[clamp(36px,5vw,72px)]">
          <p className="eyebrow-hero mb-4.5">Places · Uttarakhand, India</p>
          <h1 className="font-heading text-[clamp(34px,5.6vw,66px)] leading-[1.05] font-light tracking-[-0.02em] text-white">
            Rishikesh
          </h1>
          <p className="mt-5 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.7] text-sage-pale">
            Where the Ganges leaves the Himalaya and the yoga tourism industry begins. A
            pilgrimage town of 100,000 that trains a large share of the world&apos;s yoga
            teachers.
          </p>
          <div className="mt-[clamp(24px,4vw,40px)] flex h-[clamp(220px,30vw,380px)] items-center justify-center overflow-hidden rounded-2xl bg-forest-800">
            <Image
              src="/brand/mark-green.png"
              alt=""
              width={380}
              height={380}
              aria-hidden
              className="w-[min(280px,40vw)] opacity-25"
            />
          </div>
        </div>
      </section>

      <div className="shell shell-inset pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,7vw,90px)]">
        <div className="flex flex-wrap gap-[clamp(28px,4vw,56px)]">
          <div className="min-w-75 flex-[2_1_420px]">
            <h2 className="display-3 mb-5.5">A short history</h2>
            <div className="flex flex-col gap-5.5 text-[17px] leading-[1.8] text-article">
              <p className="text-pretty">
                Rishikesh has been a place of retreat for far longer than it has been a
                destination. Its name — from{" "}
                <em className="font-heading italic">rishi</em>, seer — reflects a tradition
                of ascetics settling where the Ganges emerges from the mountains, and the
                town appears in Puranic literature as a stop on the pilgrimage route north
                to Badrinath and Kedarnath. For most of its history it was a staging post:
                pilgrims rested, bathed at the ghats, and walked on.
              </p>
              <p className="text-pretty">
                The modern ashram town took shape in the twentieth century. Swami
                Sivananda founded the Divine Life Society here in 1936 and, unusually for
                the time, taught and published in English — which is much of why Rishikesh
                rather than Haridwar or Varanasi became the place foreign students came to.
                His students went on to found lineages of their own, and by the 1950s the
                west bank held a cluster of teaching ashrams.
              </p>
              <p className="text-pretty">
                In February 1968 the Beatles arrived at Maharishi Mahesh Yogi&apos;s
                Transcendental Meditation ashram and stayed several weeks, writing much of
                what became the White Album. The visit turned a regional pilgrimage town
                into a global one almost overnight. The ashram itself was abandoned in the
                1990s and its graffiti-covered meditation cells now sit inside the Rajaji
                reserve, open to visitors.
              </p>
              <p className="text-pretty">
                What followed is harder to romanticise. Rishikesh now hosts hundreds of
                teacher trainings, and the quality range is enormous — from ashrams
                teaching in six-month terms to four-week certificate mills. The town also
                carries an alcohol and meat ban, a March yoga festival that draws tens of
                thousands, and a whitewater rafting industry sharing the same river. All of
                it coexists, not always comfortably.
              </p>
              <p className="text-pretty">
                Come in October to March. April and May are hot, and the monsoon from June
                closes much of the river.
              </p>
            </div>
          </div>

          <div className="flex min-w-65 flex-[1_1_280px] flex-col gap-4.5">
            <div className="overflow-hidden rounded-2xl border border-mint-200">
              <iframe
                src="/rishikesh-map.html"
                title="Interactive map of Rishikesh landmarks"
                className="block h-85 w-full border-0"
                loading="lazy"
              />
              <div className="border-t border-mint-200 px-4.5 py-4">
                <p className="text-[13.5px] leading-[1.6] text-muted">
                  30.09° N, 78.27° E · 372m · 240km north of Delhi. Click the map to zoom;
                  tap a pin for what is there.
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-mint p-5">
              <SectionLabel className="mb-3.5">Getting there</SectionLabel>
              <div className="flex flex-col gap-2.5">
                {TRAVEL.map((line) => (
                  <p key={line} className="text-[14px] leading-[1.6] text-body">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <h2 className="display-3 mt-[clamp(40px,5vw,64px)] mb-6">What is on offer</h2>
        <div className="grid-fit-250 gap-4">
          {OFFERINGS.map((offering) => (
            <div
              key={offering.title}
              className="rounded-2xl border border-mint-200 p-5.5 transition-colors hover:border-sage"
            >
              <h3 className="heading-card mb-2.5 text-[21px]">{offering.title}</h3>
              <p className="text-[14.5px] leading-[1.65] text-muted">{offering.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-[clamp(32px,4vw,52px)] flex flex-wrap items-center justify-between gap-6 rounded-[18px] bg-orange p-[clamp(24px,3.4vw,40px)]">
          <div className="flex-[1_1_320px]">
            <h2 className="display-4">Choosing a Rishikesh training?</h2>
            <p className="mt-3 max-w-[52ch] text-[15.5px] leading-[1.7] text-cta-body">
              Read the piece on telling a good teacher from a popular one before you pay a
              deposit. The same test applies to schools.
            </p>
          </div>
          <ButtonLink href="/directory?kind=training" tone="invert" className="px-7.5">
            Browse trainings
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
