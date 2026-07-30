import { ProviderPage, providerMetadata } from "@/components/site/provider-page";

interface Props {
  params: Promise<{ country: string; city: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return providerMetadata(slug, ["school"]);
}

export default async function SchoolPage({ params }: Props) {
  const { slug } = await params;
  return <ProviderPage slug={slug} kinds={["school"]} />;
}
