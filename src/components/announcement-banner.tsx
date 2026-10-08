"use client";

import { useState } from "react";
import { Info, ShieldAlert, Wrench, X } from "lucide-react";

import { useAppStore } from "@/lib/store";
import type { AnnouncementLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<AnnouncementLevel, { className: string; icon: typeof Info }> = {
  incident: {
    className: "bg-red-50 text-red-900 border-red-200 dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/20",
    icon: ShieldAlert,
  },
  maintenance: {
    className: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20",
    icon: Wrench,
  },
  info: {
    className: "bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/20",
    icon: Info,
  },
};

/** Published CMS announcements appear here for client users. */
export function AnnouncementBanner() {
  const items = useAppStore((s) => s.content);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const live = items
    .filter((c) => c.type === "announcement" && c.status === "published" && !dismissed.includes(c.id))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  if (!live.length) return null;

  return (
    <div className="space-y-px">
      {live.map((a) => {
        const s = styles[a.level ?? "info"];
        const Icon = s.icon;
        return (
          <div key={a.id} className={cn("flex items-start gap-3 border-b px-4 py-2.5 text-sm sm:px-6 lg:px-8", s.className)}>
            <Icon className="mt-0.5 size-4 shrink-0" />
            <p className="flex-1">
              <span className="font-semibold">{a.title}.</span> <span className="opacity-90">{a.excerpt}</span>
            </p>
            <button onClick={() => setDismissed((d) => [...d, a.id])} className="opacity-60 hover:opacity-100">
              <X className="size-4" />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
