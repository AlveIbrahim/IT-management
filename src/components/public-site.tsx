"use client";

import { useEffect } from "react";

import { ContactPage, ContentPage, NotFoundPage } from "@/components/site/content-page";
import { HomePage } from "@/components/site/home-page";
import { SiteShell } from "@/components/site/site-shell";
import { useAppStore, useMounted } from "@/lib/store";

/** The public marketing website, rendered from pages managed in the CMS. */
export function PublicSite({ slug }: { slug: string }) {
  const mounted = useMounted();
  const content = useAppStore((s) => s.content);
  const brandName = useAppStore((s) => s.settings.brandName);
  const page = content.find((c) => c.type === "page" && c.status === "published" && c.slug === slug);

  useEffect(() => {
    if (!mounted) return;
    document.title = page ? page.seoTitle || `${page.title} | ${brandName}` : `Page not found | ${brandName}`;
  }, [mounted, page, brandName]);

  // Content lives in the browser (demo CMS), so render once the store has loaded.
  if (!mounted) return <div className="bg-background min-h-svh" />;

  return (
    <SiteShell current={slug}>
      {!page ? (
        <NotFoundPage />
      ) : slug === "home" ? (
        <HomePage page={page} />
      ) : slug === "contact" ? (
        <ContactPage page={page} />
      ) : (
        <ContentPage page={page} />
      )}
    </SiteShell>
  );
}
