import type { Metadata } from "next";

import { PublicSite } from "@/components/public-site";
import { DEFAULT_SETTINGS, createSeed } from "@/lib/seed";

export async function generateMetadata({ params }: PageProps<"/site/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = createSeed().content.find((c) => c.type === "page" && c.slug === slug && c.status === "published");
  if (!page) return { title: `Page not found | ${DEFAULT_SETTINGS.brandName}` };
  return { title: page.seoTitle || `${page.title} | ${DEFAULT_SETTINGS.brandName}`, description: page.seoDescription || page.excerpt };
}

export default async function SitePage({ params }: PageProps<"/site/[slug]">) {
  const { slug } = await params;
  return <PublicSite slug={slug} />;
}
