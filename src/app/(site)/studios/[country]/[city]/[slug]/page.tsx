import { ProviderPage, providerMetadata } from "@/components/site/provider-page";

interface Props {
  params: Promise<{ country: string; city: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return providerMetadata(slug, ["studio"]);
}

export default async function StudioPage({ params }: Props) {
  const { slug } = await params;
  return <ProviderPage slug={slug} kinds={["studio"]} />;
}
