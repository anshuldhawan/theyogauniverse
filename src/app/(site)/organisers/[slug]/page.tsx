import { ProviderPage, providerMetadata } from "@/components/site/provider-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return providerMetadata(slug, ["organiser"]);
}

export default async function OrganiserPage({ params }: Props) {
  const { slug } = await params;
  return <ProviderPage slug={slug} kinds={["organiser"]} />;
}
