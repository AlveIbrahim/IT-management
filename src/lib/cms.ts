import { BookOpen, Globe, KeyRound, Laptop, Mail, Megaphone, Rocket, ShieldCheck, Wifi, type LucideIcon } from "lucide-react";

import type { AnnouncementLevel, ContentItem, ContentStatus, ContentType } from "./types";

export const CONTENT_STATUS_META: Record<ContentStatus, { label: string; className: string }> = {
  published: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  draft: {
    label: "Draft",
    className: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-300 dark:border-zinc-500/30",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  },
};

export const LEVEL_META: Record<AnnouncementLevel, { label: string; className: string }> = {
  incident: { label: "Security / incident", className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30" },
  maintenance: { label: "Maintenance", className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30" },
  info: { label: "Information", className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30" },
};

export const TYPE_META: Record<ContentType, { label: string; plural: string; icon: LucideIcon; blurb: string }> = {
  page: { label: "Page", plural: "Website pages", icon: Globe, blurb: "Pages on your public website" },
  article: { label: "Article", plural: "Help articles", icon: BookOpen, blurb: "Knowledge base for clients and engineers" },
  announcement: { label: "Announcement", plural: "Announcements", icon: Megaphone, blurb: "Alerts shown at the top of the client portal" },
};

export function publicHref(item: ContentItem) {
  if (item.type === "page") return item.slug === "home" ? "/site" : `/site/${item.slug}`;
  if (item.type === "article") return `/knowledge-base/${item.slug}`;
  return "/portal";
}


export const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Getting started": Rocket,
  "Microsoft 365": Mail,
  Security: ShieldCheck,
  "Network & VPN": Wifi,
  "Hardware & printing": Laptop,
  "Accounts & passwords": KeyRound,
};

