import { ProviderPage, providerMetadata } from "@/components/site/provider-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return providerMetadata(slug, ["teacher"]);
}

export default async function TeacherPage({ params }: Props) {
  const { slug } = await params;
  return <ProviderPage slug={slug} kinds={["teacher"]} />;
}
