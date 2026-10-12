import type { Metadata } from "next";

import { PublicSite } from "@/components/public-site";
import { DEFAULT_SETTINGS } from "@/lib/seed";

export const metadata: Metadata = {
  title: `${DEFAULT_SETTINGS.brandName} – Managed IT support & cyber security`,
  description: "Proactive IT support and cyber security for growing UK businesses.",
};

export default function SiteHome() {
  return <PublicSite slug="home" />;
}
