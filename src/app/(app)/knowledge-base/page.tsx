"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, ChevronRight, Eye, Pencil, Search } from "lucide-react";

import { EmptyState } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORY_ICON } from "@/lib/cms";
import { KB_CATEGORIES } from "@/lib/constants";
import { timeAgo } from "@/lib/format";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function KnowledgeBasePage() {
  const user = useCurrentUser()!;
  const content = useAppStore((s) => s.content);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const isClient = user.role === "client";

  const articles = content.filter((c) => c.type === "article" && (c.status === "published" || !isClient));
  const q = query.trim().toLowerCase();
  const results = articles
    .filter((a) => (!category || a.category === category) && (!q || `${a.title} ${a.excerpt} ${a.body}`.toLowerCase().includes(q)))
    .sort((a, b) => b.views - a.views);

  return (
    <div className="space-y-8">
      <div className="bg-sidebar relative overflow-hidden rounded-2xl px-6 py-12 text-center text-white sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(60% 80% at 50% 0%, color-mix(in oklch, var(--brand) 60%, transparent), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-2xl space-y-5">
          <h1 className="text-3xl font-semibold tracking-tight">Help centre</h1>
          <p className="text-white/70">Step-by-step guides to fix common problems yourself – any time of day.</p>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for answers, e.g. “VPN” or “password”"
              className="bg-background text-foreground h-12 rounded-xl pl-12 text-base"
            />
          </div>
        </div>
      </div>

      {!isClient && (
        <div className="flex items-center justify-between rounded-lg border border-dashed px-4 py-3 text-sm">
          <span className="text-muted-foreground">You&apos;re seeing drafts too because you&apos;re signed in as staff.</span>
          <Button asChild size="sm" variant="outline">
            <Link href="/cms">
              <Pencil />
              Manage articles
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {KB_CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICON[c] ?? BookOpen;
          const count = articles.filter((a) => a.category === c).length;
          const active = category === c;
          return (
            <button
              key={c}
              onClick={() => setCategory(active ? null : c)}
              className={cn(
                "bg-card hover:border-brand-ink/40 flex items-center gap-4 rounded-xl border p-4 text-left transition-colors",
                active && "border-brand-ink ring-brand-ink/20 ring-2",
              )}
            >
              <span className="bg-primary/35 text-brand-ink grid size-11 shrink-0 place-items-center rounded-lg">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{c}</div>
                <div className="text-muted-foreground text-xs">
                  {count} article{count === 1 ? "" : "s"}
                </div>
              </div>
              <ChevronRight className="text-muted-foreground size-4" />
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {q ? `Results for “${query}”` : category ? category : "Popular articles"}
          </h2>
          {(category || q) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategory(null);
                setQuery("");
              }}
            >
              Show all
            </Button>
          )}
        </div>
        <Card className="gap-0 divide-y py-0">
          {results.map((a) => (
            <Link key={a.id} href={`/knowledge-base/${a.slug}`} className="hover:bg-muted/40 flex items-center gap-4 px-5 py-4 transition-colors">
              <BookOpen className="text-brand-ink size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{a.title}</span>
                  {a.status !== "published" && <Badge variant="outline">Draft</Badge>}
                </div>
                <p className="text-muted-foreground truncate text-sm">{a.excerpt}</p>
              </div>
              <div className="text-muted-foreground hidden shrink-0 text-right text-xs sm:block">
                <div className="flex items-center justify-end gap-1">
                  <Eye className="size-3.5" />
                  {a.views.toLocaleString("en-GB")}
                </div>
                <div>Updated {timeAgo(a.updatedAt)}</div>
              </div>
            </Link>
          ))}
          {results.length === 0 && (
            <CardContent>
              <EmptyState icon={Search} title="No articles found" description="Try a different search, or raise a ticket and we'll help." />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
