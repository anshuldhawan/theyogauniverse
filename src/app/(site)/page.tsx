import Image from "next/image";
import Link from "next/link";
import { ButtonLink, Avatar, Card, ChipDark, Eyebrow, Tag, TextLink } from "@/components/ui";
import { StartHere, type StartHereItem } from "@/components/site/StartHere";
import {
  categoryLabel,
  formatLabel,
  locationLine,
  placeLine,
  styleLabels,
} from "@/lib/listing-view";
import {
  allProviders,
  featuredProviders,
  posts,
  providerBySlug,
  startPaths,
} from "@/lib/repo";
import { locationOptions } from "@/lib/search";
import { providerPath } from "@/lib/urls";
import type { ProviderCategory } from "@/lib/types";

const POPULAR_STYLES = [
  { label: "Vinyasa", href: "/directory?styles=vinyasa" },
  { label: "Ashtanga", href: "/directory?styles=ashtanga" },
  { label: "Yin", href: "/directory?styles=yin" },
  { label: "Prenatal", href: "/directory?styles=prenatal" },
  { label: "Breathwork", href: "/directory?kind=breathwork" },
  { label: "Silent retreat", href: "/directory?kind=retreat&styles=vipassana" },
];

const KIND_OPTIONS: { value: string; label: string }[] = [
  { value: "everything", label: "Everything" },
  { value: "teacher", label: "Teachers" },
  { value: "studio", label: "Studios" },
  { value: "retreat", label: "Retreats" },
  { value: "training", label: "Teacher training" },
  { value: "breathwork", label: "Breathwork" },
  { value: "meditation", label: "Meditation" },
];

const CATEGORIES: { key: ProviderCategory; title: string; blurb: string }[] = [
  {
    key: "teacher",
    title: "Teachers",
    blurb: "Individual teachers, their styles, philosophy and weekly timetable.",
  },
  {
    key: "studio",
    title: "Studios",
    blurb: "Rooms with a full timetable, several teachers and drop-in classes.",
  },
  {
    key: "retreat",
    title: "Retreats",
    blurb: "Residential weeks and silent sits, with real dates and group sizes.",
  },
  {
    key: "training",
    title: "Trainings",
    blurb: "Accredited 200 and 300-hour courses, residential, part-time and online.",
  },
  {
    key: "breathwork",
    title: "Breathwork",
    blurb: "Pranayama, kriya and conscious connected breathing facilitators.",
  },
  {
    key: "meditation",
    title: "Meditation",
    blurb: "Zen, MBSR, yoga nidra and mantra — taught as its own discipline.",
  },
];

export default function HomePage() {
  const providers = allProviders();
  const featured = featuredProviders().slice(0, 4);
  const teasers = posts().slice(0, 3);
  const cities = locationOptions();

  const startItems: StartHereItem[] = startPaths().map((path) => {
    const post = posts().find((p) => p.id === path.post) ?? posts()[0];
    return {
      name: path.name,
      note: path.note,
      post: {
        id: post.id,
        title: post.title,
        category: post.category,
        excerpt: post.excerpt,
        meta: post.meta,
      },
      listings: path.ids
        .map((id) => providerBySlug(id))
        .filter((p) => p != null)
        .map((p) => ({
          name: p.name,
          kindLabel: categoryLabel(p.category),
          placeLine: placeLine(p),
          tagline: p.tagline,
          href: providerPath(p),
        })),
    };
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest text-white">
        <Image
          src="/brand/mark-green.png"
          alt=""
          width={560}
          height={560}
          priority
          aria-hidden
          className="pointer-events-none absolute top-[-10%] right-[-8%] w-[min(560px,60vw)] opacity-13"
        />
        <div className="shell hero-y relative">
          <p className="eyebrow-hero mb-5">The Yoga Universe</p>
          <h1 className="display-hero max-w-[17ch] text-white text-pretty">
            Every yoga and meditation offering, in one index.
          </h1>
          <p className="mt-6 max-w-[58ch] text-[clamp(16px,1.5vw,19px)] leading-[1.7] text-sage-pale">
            Teachers, studios, retreats, teacher trainings, breathwork and meditation.
            Everyone lists their philosophy, when and where they teach — in person or
            online — and what their students actually say.
          </p>

          <form
            action="/directory"
            method="get"
            className="mt-[clamp(28px,4vw,44px)] flex flex-wrap items-stretch gap-2 rounded-[18px] bg-white p-3 shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
          >
            <label className="flex flex-[3_1_200px] flex-col justify-center px-4 py-2.5">
              <span className="label-sm">Name, style or keyword</span>
              <input
                type="text"
                name="q"
                placeholder="Ashtanga, prenatal, breathwork…"
                className="w-full border-0 bg-transparent pt-1.5 text-[16px] text-forest outline-none"
              />
            </label>
            <span className="w-px flex-none bg-mint-200" aria-hidden />
            <label className="flex flex-[2_1_150px] flex-col justify-center px-4 py-2.5">
              <span className="label-sm">Looking for</span>
              <select
                name="kind"
                defaultValue="everything"
                className="w-full cursor-pointer appearance-none border-0 bg-transparent pt-1.5 text-[16px] text-forest outline-none"
              >
                {KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <span className="w-px flex-none bg-mint-200" aria-hidden />
            <label className="flex flex-[2_1_150px] flex-col justify-center px-4 py-2.5">
              <span className="label-sm">Where</span>
              <select
                name="location"
                defaultValue="Anywhere"
                className="w-full cursor-pointer appearance-none border-0 bg-transparent pt-1.5 text-[16px] text-forest outline-none"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="flex flex-[1_1_140px] cursor-pointer items-center justify-center rounded-xl bg-orange px-5 py-4.5 text-[12px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-forest"
            >
              Search
            </button>
          </form>

          <div className="mt-5.5 flex flex-wrap items-center gap-2.5">
            <span className="mr-1 text-[12px] uppercase tracking-[0.16em] text-sage">
              Popular
            </span>
            {POPULAR_STYLES.map((style) => (
              <ChipDark key={style.label} href={style.href}>
                {style.label}
              </ChipDark>
            ))}
          </div>
        </div>
      </section>

      {/* Start here */}
      <section className="section-y-top bg-white">
        <div className="shell">
          <div className="rounded-[20px] border border-mint-200 p-[clamp(24px,3.4vw,40px)]">
            <Eyebrow className="mb-3">Start here</Eyebrow>
            <h2 className="display-4 mb-2 text-[clamp(24px,3.2vw,38px)] leading-[1.12]">
              Not sure what you are looking for?
            </h2>
            <p className="mb-6 max-w-[56ch] text-[16px] leading-[1.7] text-muted">
              Pick the closest thing to your situation and we will name three specific
              people, not a filter page.
            </p>
            <StartHere items={startItems} />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-y-top bg-white">
        <div className="shell grid-fit-220 gap-4">
          {CATEGORIES.map((category) => {
            const count = providers.filter((p) => p.category === category.key).length;
            return (
              <Link key={category.key} href={`/directory?kind=${category.key}`}>
                <Card hover className="flex h-full flex-col gap-2 p-6">
                  <h3 className="heading-card text-[22px]">{category.title}</h3>
                  <p className="text-[14px] leading-relaxed text-muted">{category.blurb}</p>
                  <span className="mt-1.5 text-[11.5px] uppercase tracking-[0.16em] text-orange">
                    {count} listed
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="section-y bg-white">
        <div className="shell">
          <div className="mb-8.5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow className="mb-3">Hand picked</Eyebrow>
              <h2 className="display-2">Featured teachers</h2>
            </div>
            <TextLink href="/directory">See all {providers.length} listings</TextLink>
          </div>
          <div className="grid-fill-272 gap-5">
            {featured.map((provider) => (
              <Link key={provider.id} href={providerPath(provider)}>
                <Card hover className="flex h-full flex-col gap-3.5 p-5.5">
                  <div className="flex items-center gap-3.5">
                    <Avatar id={provider.id} name={provider.name} size={54} />
                    <div className="min-w-0">
                      <h3 className="heading-card text-[21px] leading-tight">
                        {provider.name}
                      </h3>
                      <p className="mt-1.25 text-[13px] text-muted">
                        {locationLine(provider)}
                      </p>
                    </div>
                  </div>
                  <p className="text-[14.5px] leading-relaxed text-body text-pretty">
                    {provider.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {styleLabels(provider.styles)
                      .slice(0, 3)
                      .map((style) => (
                        <Tag key={style}>{style}</Tag>
                      ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-mint pt-3.5">
                    <span className="text-[13px] text-muted">
                      {provider.reviewCount} reviews
                    </span>
                    <span className="text-[12.5px] text-faint">
                      {formatLabel(provider.format)}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* From the blog */}
      <section className="section-y bg-mint">
        <div className="shell">
          <div className="mb-8.5 flex flex-wrap items-end justify-between gap-4">
            <h2 className="display-3 text-[clamp(26px,3.4vw,40px)]">From the blog</h2>
            <TextLink href="/blog">All writing</TextLink>
          </div>
          <div className="grid-fit-280 gap-6">
            {teasers.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="flex flex-col gap-3">
                <div
                  className="flex h-42 items-end rounded-[14px] p-4"
                  style={{ background: post.tint }}
                >
                  <span className="rounded-full bg-white px-2.75 py-1.5 text-[10.5px] uppercase tracking-[0.2em] text-forest">
                    {post.category}
                  </span>
                </div>
                <h3 className="heading-card mt-1 text-[22px] leading-snug text-pretty">
                  {post.title}
                </h3>
                <p className="text-[14.5px] leading-relaxed text-muted">{post.excerpt}</p>
                <span className="text-[12px] text-faint">{post.meta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Listing CTA */}
      <section className="bg-orange py-[clamp(40px,6vw,76px)]">
        <div className="shell flex flex-wrap items-center justify-between gap-7">
          <div className="flex-[1_1_340px]">
            <h2 className="display-3 text-[clamp(26px,3.4vw,42px)] text-pretty">
              Teach, host or run a space? Put yourself on the map.
            </h2>
            <p className="mt-3.5 max-w-[52ch] text-[16px] leading-[1.7] text-cta-body">
              Listing is free for teachers, studios, retreats and breathwork facilitators.
              Add your styles, your timetable and your philosophy.
            </p>
          </div>
          <ButtonLink href="/dashboard" tone="invert" className="px-8 py-4.5">
            Add your listing
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
