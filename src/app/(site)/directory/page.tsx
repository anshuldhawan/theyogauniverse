import type { Metadata } from "next";
import Link from "next/link";
import { Button, Eyebrow, Input, SectionLabel, Select } from "@/components/ui";
import { ProviderRow } from "@/components/site/ProviderRow";
import { RelatedEditorial } from "@/components/site/RelatedEditorial";
import { buyerContext } from "@/lib/buyer";
import { editorialForStyles } from "@/lib/editorial/store";
import { locationOptions, searchProviders, type SearchFilters } from "@/lib/search";
import { allStyleTerms } from "@/lib/taxonomy";
import type { ProviderCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Directory — teachers, studios, retreats & trainings",
  description:
    "Search and compare yoga teachers, studios, retreats, teacher trainings, breathwork and meditation across 50 cities and online.",
};

const KIND_TABS: { key: SearchFilters["category"] & string; label: string }[] = [
  { key: "everything", label: "Everything" },
  { key: "teacher", label: "Teachers" },
  { key: "studio", label: "Studios" },
  { key: "retreat", label: "Retreats" },
  { key: "training", label: "Teacher training" },
  { key: "breathwork", label: "Breathwork" },
  { key: "meditation", label: "Meditation" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LEVELS = ["beginner", "intermediate", "advanced"];

type Params = Record<string, string | string[] | undefined>;

function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Chip built from a label + hidden checkbox, so filtering works without JS. */
function CheckChip({
  name,
  value,
  label,
  checked,
  tight = false,
}: {
  name: string;
  value: string;
  label: string;
  checked?: boolean;
  tight?: boolean;
}) {
  return (
    <label
      className={`cursor-pointer rounded-full border border-mint-200 bg-white text-[12.5px] text-body transition-colors hover:border-sage has-checked:border-forest has-checked:bg-forest has-checked:text-white ${
        tight ? "px-2.75 py-1.75" : "px-3 py-1.75"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        className="sr-only"
      />
      {label}
    </label>
  );
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const buyer = await buyerContext();

  const filters: SearchFilters = {
    query: single(params.q),
    category: (single(params.kind) as ProviderCategory | "everything") ?? "everything",
    styles: list(params.styles),
    formats: list(params.formats) as SearchFilters["formats"],
    levels: list(params.levels),
    days: list(params.days),
    location: single(params.location),
    verifiedOnly: single(params.verified) === "1",
    bookableOnSite: single(params.bookable) === "1",
    sort: (single(params.sort) as SearchFilters["sort"]) ?? "relevance",
  };

  const results = searchProviders(filters, buyer);
  const styleTerms = allStyleTerms();

  return (
    <div className="shell page-y">
      <Eyebrow className="mb-3">The index</Eyebrow>
      <h1 className="display-1 mb-6">
        Teachers, studios, retreats, trainings, breathwork &amp; meditation
      </h1>

      <div className="mb-7.5 flex flex-wrap gap-2">
        {KIND_TABS.map((tab) => {
          const active = filters.category === tab.key;
          const next = new URLSearchParams();
          if (filters.query) next.set("q", filters.query);
          if (tab.key !== "everything") next.set("kind", tab.key);
          return (
            <Link
              key={tab.key}
              href={`/directory?${next.toString()}`}
              className={`rounded-full border px-4.5 py-2.75 text-[13px] tracking-[0.06em] transition-colors ${
                active
                  ? "border-forest bg-forest text-white"
                  : "border-mint-200 bg-white text-body hover:border-sage"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* One GET form spans the sidebar and the sort control. */}
      <form
        method="get"
        action="/directory"
        className="flex flex-wrap items-start gap-[clamp(20px,3vw,40px)]"
      >
        {filters.category && filters.category !== "everything" && (
          <input type="hidden" name="kind" value={filters.category} />
        )}

        <aside className="sticky-side flex min-w-60 flex-[1_1_250px] flex-col gap-6.5 rounded-2xl border border-mint-200 p-5.5">
          <Input
            type="text"
            name="q"
            defaultValue={filters.query}
            placeholder="Search the index…"
            aria-label="Search the index"
          />

          <div>
            <label className="inline-block cursor-pointer rounded-full border border-mint-200 bg-white px-3.5 py-2.25 text-[12.5px] text-body transition-colors hover:border-sage has-checked:border-leaf has-checked:bg-leaf has-checked:text-white">
              <input
                type="checkbox"
                name="verified"
                value="1"
                defaultChecked={filters.verifiedOnly}
                className="sr-only"
              />
              ✓ Verified only
            </label>
            <p className="mt-2.5 text-[12px] leading-relaxed text-faint">
              We have seen certification documents or accreditation for verified listings.
            </p>
          </div>

          <fieldset>
            <legend className="label mb-3">Style &amp; focus</legend>
            <div className="flex max-h-56 flex-wrap gap-1.75 overflow-y-auto">
              {styleTerms.map((term) => (
                <CheckChip
                  key={term.slug}
                  name="styles"
                  value={term.slug}
                  label={term.label}
                  checked={filters.styles?.includes(term.slug)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label mb-3">Format</legend>
            <div className="flex flex-wrap gap-1.75">
              <CheckChip
                name="formats"
                value="in_person"
                label="In person"
                checked={filters.formats?.includes("in_person")}
              />
              <CheckChip
                name="formats"
                value="online"
                label="Online"
                checked={filters.formats?.includes("online")}
              />
              {/* SRCH-4: explicit opt-in booking-mode filter — the only hard
                  transactability exclusion in search (SRCH-16). */}
              <CheckChip
                name="bookable"
                value="1"
                label="Bookable on site"
                checked={filters.bookableOnSite}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="label mb-3">Level</legend>
            <div className="flex flex-wrap gap-1.75">
              {LEVELS.map((level) => (
                <CheckChip
                  key={level}
                  name="levels"
                  value={level}
                  label={level[0].toUpperCase() + level.slice(1)}
                  checked={filters.levels?.includes(level)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label mb-3">Runs on</legend>
            <div className="flex flex-wrap gap-1.75">
              {DAYS.map((day) => (
                <CheckChip
                  key={day}
                  name="days"
                  value={day}
                  label={day}
                  checked={filters.days?.includes(day)}
                  tight
                />
              ))}
            </div>
          </fieldset>

          <div>
            <SectionLabel className="mb-3">Location</SectionLabel>
            <Select
              name="location"
              defaultValue={filters.location ?? "Anywhere"}
              aria-label="Location"
            >
              {locationOptions().map((location) => (
                <option key={location}>{location}</option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" tone="forest" className="px-6 py-3.5">
              Apply filters
            </Button>
            <Link
              href="/directory"
              className="text-[11.5px] uppercase tracking-[0.16em] text-faint hover:text-orange"
            >
              Clear all filters
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-[3_1_460px]">
          <div className="mb-4.5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] text-muted">
              {results.length === 1 ? "1 listing" : `${results.length} listings`}
            </p>
            <Select
              name="sort"
              defaultValue={filters.sort}
              aria-label="Sort results"
              className="w-auto px-3 py-2.25 text-[13.5px]"
            >
              <option value="relevance">Most relevant</option>
              <option value="reviews">Most reviewed</option>
              <option value="established">Longest established</option>
              <option value="name">Name A–Z</option>
            </Select>
          </div>

          {results.length === 0 ? (
            /* SRCH-12: an empty result set always offers a way forward. */
            <div className="rounded-2xl border border-dashed border-sage px-6 py-12 text-center">
              <h2 className="heading-card text-2xl">Nothing matches that yet</h2>
              <p className="mt-2.5 text-[15px] text-muted">
                Try loosening a filter — the index is growing every week.
              </p>
              <Link
                href="/directory"
                className="mt-5 inline-block rounded-full bg-forest px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.16em] text-white hover:bg-orange hover:text-white"
              >
                Clear filters
              </Link>
              <p className="mt-5 text-[13px] text-faint">
                Or{" "}
                <Link href="/directory?formats=online" className="underline">
                  look online
                </Link>{" "}
                and browse{" "}
                <Link href="/directory?kind=teacher" className="underline">
                  all teachers
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {results.map((result) => (
                <ProviderRow
                  key={result.provider.id}
                  provider={result.provider}
                  priceDisplay={result.priceDisplay}
                  priceIsIndicative={result.priceIsIndicative}
                />
              ))}
            </div>
          )}

          {/* BLG-27: reverse surfacing on style-filtered views (en only). */}
          {(filters.styles?.length ?? 0) > 0 && (
            <RelatedEditorial
              articles={editorialForStyles(filters.styles ?? [])}
              heading="Guides on these styles"
            />
          )}
        </main>
      </form>
    </div>
  );
}
