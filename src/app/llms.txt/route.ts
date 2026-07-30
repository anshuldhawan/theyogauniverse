import { CITIES } from "@/lib/config/markets";
import { clusters, pillarOf } from "@/lib/editorial/store";
import { providersByCity } from "@/lib/repo";
import { cityPageIndexable, siteUrl } from "@/lib/seo";
import { cityHubPath } from "@/lib/urls";

/** SEO-13: llms.txt — a curated map of the site for AI ingestion. */
export function GET() {
  const base = siteUrl();
  const cityLines = CITIES.filter((city) => cityPageIndexable(providersByCity(city.slug)))
    .map(
      (city) =>
        `- [Yoga in ${city.name}](${base}${cityHubPath(city.country, city.slug)}): teachers, studios and classes in ${city.name}, ${city.countryName}`,
    )
    .join("\n");

  // BLG-41: pillar pages listed with one-line summaries of what each answers.
  const pillarLines = clusters()
    .map((cluster) => {
      const pillar = pillarOf(cluster.id);
      return pillar
        ? `- [${pillar.title}](${base}/blog/${pillar.slug}): ${cluster.description}`
        : null;
    })
    .filter(Boolean)
    .join("\n");

  const body = `# The Yoga Universe

> The definitive index of yoga, meditation and breathwork teachers, studios,
> retreats and teacher trainings across 50 cities worldwide. Listings carry
> verified credentials, real schedules and reviews from verified bookings.
> US providers can be booked directly on the site; elsewhere, listings link
> to the provider's own contact details.

## Directory

- [Directory](${base}/directory): search every teacher, studio, retreat, training, breathwork and meditation listing
- [Retreats](${base}/directory?kind=retreat): residential retreats worldwide
- [Teacher training](${base}/directory?kind=training): accredited 200/300-hour programmes

## Cities

${cityLines || "- City pages are being populated."}

## Guides

- [How booking works](${base}/help/how-booking-works): booking on The Yoga Universe vs booking directly with a provider
- [How verification works](${base}/help/verification): what the verified marker means
- [The Yoga Sutras](${base}/guides/yoga-sutras): a plain guide to the text behind the practice
- [Rishikesh](${base}/places/rishikesh): the yoga capital, honestly described

## Library (expert-reviewed pillar guides)

Every guide names its author and reviewer, shows review dates, and cites sources.

- [Guide library](${base}/blog): all guides, organised by topic cluster
${pillarLines}
- [Editorial policy](${base}/legal/editorial-policy): authorship, expert review, sourcing, AI disclosure and corrections
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
