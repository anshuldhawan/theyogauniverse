import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ProviderCard } from "@/components/site/ProviderCard";
import { EmptyState, Eyebrow } from "@/components/ui";
import { RelatedEditorial } from "@/components/site/RelatedEditorial";
import { buyerContext } from "@/lib/buyer";
import { cityBySlug } from "@/lib/config/markets";
import { editorialForCity } from "@/lib/editorial/store";
import { providerView } from "@/lib/listing-view";
import { providersByCity } from "@/lib/repo";
import { breadcrumbSchema, cityPageIndexable, siteUrl } from "@/lib/seo";
import { providerPath } from "@/lib/urls";

interface Props {
  params: Promise<{ slug: string; city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: country, city } = await params;
  const config = cityBySlug(country, city);
  if (!config) return {};
  const providers = providersByCity(config.slug);
  return {
    title: `Yoga in ${config.name} — teachers, studios & classes`,
    description: `Compare yoga teachers, studios, classes and workshops in ${config.name}, ${config.countryName}. Verified credentials, honest reviews, every style.`,
    alternates: { canonical: `/${country}/${city}/yoga` },
    // SEO-4: automatic render-time noindex below the quality threshold —
    // non-overridable by design.
    robots: cityPageIndexable(providers) ? undefined : { index: false, follow: true },
  };
}

export default async function CityHubPage({ params }: Props) {
  const { slug: country, city } = await params;
  const config = cityBySlug(country, city);
  if (!config) notFound();

  const buyer = await buyerContext();
  const views = providersByCity(config.slug).map((p) => providerView(p, buyer));

  const faq = [
    {
      question: `How do I book a class in ${config.name}?`,
      answer:
        config.tier === "transactional"
          ? `Most ${config.name} listings can be booked and paid for directly on The Yoga Universe. Where a provider takes bookings themselves, their contact details are on their page.`
          : `Providers in ${config.name} take bookings directly. Every listing shows the provider's own contact details and booking link — you arrange and pay with them.`,
    },
    {
      question: `Are credentials verified?`,
      answer:
        "Listings marked verified have had certification or accreditation checked against an external registry such as Yoga Alliance. Verification is independent of how you book.",
    },
    {
      question: `What styles are taught in ${config.name}?`,
      answer:
        "Everything from Ashtanga and vinyasa to yin, restorative, prenatal and chair yoga, plus meditation and breathwork. Use the style filter in the directory to narrow down.",
    },
  ];

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: views.map((view, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: view.provider.name,
      url: `${siteUrl()}${providerPath(view.provider)}`,
    })),
  };
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Directory", href: "/directory" },
    { name: `Yoga in ${config.name}`, href: `/${country}/${city}/yoga` },
  ];
  const breadcrumbs = breadcrumbSchema(breadcrumbItems);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="shell page-y">
      <JsonLd data={itemList} />
      <JsonLd data={breadcrumbs} />
      <JsonLd data={faqSchema} />

      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-faint">
        <ol className="flex flex-wrap gap-2">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href}>
              {index > 0 && <span aria-hidden className="mr-2">/</span>}
              {index === breadcrumbItems.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.href} className="underline">{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <Eyebrow className="mb-3">
        {config.countryName} · {config.name}
      </Eyebrow>
      <h1 className="display-1">Yoga in {config.name}</h1>

      {/* SEO-6: 40–60 word direct answer near the top */}
      <p className="mt-4.5 max-w-[62ch] text-[17px] leading-[1.7] text-muted">
        The Yoga Universe indexes yoga teachers, studios, workshops, breathwork and meditation across{" "}
        {config.name}. Every listing shows styles, levels, schedules and verified
        credentials, so you can compare options and{" "}
        {config.tier === "transactional"
          ? "book directly on this page or with the provider."
          : "contact the provider directly to book."}
      </p>

      {views.length === 0 ? (
        <div className="mt-9">
          <EmptyState title={`We're still building the ${config.name} index`}>
            Browse{" "}
            <Link href="/directory?formats=online" className="underline">
              online classes
            </Link>{" "}
            or the full{" "}
            <Link href="/directory" className="underline">
              directory
            </Link>{" "}
            meanwhile.
          </EmptyState>
        </div>
      ) : (
        <div className="grid-fill-272 mt-9 gap-5">
          {views.map((view) => (
            <ProviderCard key={view.provider.id} view={view} />
          ))}
        </div>
      )}

      {/* BLG-27: reverse surfacing — editorial module (en only). */}
      <RelatedEditorial
        articles={editorialForCity(country, config.slug)}
        heading={`Before you book in ${config.name}`}
      />

      {/* SEO-6: question-shaped H2s + FAQ block */}
      <section className="mt-14 max-w-3xl">
        <h2 className="display-4 mb-5">Good to know</h2>
        <div className="flex flex-col gap-6">
          {faq.map((f) => (
            <div key={f.question}>
              <h3 className="heading-card text-[20px]">{f.question}</h3>
              <p className="mt-2 text-[16px] leading-[1.75] text-article">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
