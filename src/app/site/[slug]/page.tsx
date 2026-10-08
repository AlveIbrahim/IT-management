import { PublicSite } from "@/components/public-site";

export default async function SitePage({ params }: PageProps<"/site/[slug]">) {
  const { slug } = await params;
  return <PublicSite slug={slug} />;
}
