"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock, LifeBuoy, Mail, Phone, Search, Ticket } from "lucide-react";

import { NewTicketDialog } from "@/components/new-ticket-dialog";
import { StatusBadge } from "@/components/ticket-badges";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LEVEL_META } from "@/lib/cms";
import { PRIORITY_META, PRIORITY_ORDER } from "@/lib/constants";
import { formatHours, ticketRef, timeAgo } from "@/lib/format";
import { useAppStore, useCurrentUser } from "@/lib/store";

export default function PortalHome() {
  const user = useCurrentUser()!;
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const companies = useAppStore((s) => s.companies);
  const content = useAppStore((s) => s.content);
  const settings = useAppStore((s) => s.settings);
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);

  const company = companies.find((c) => c.id === user.companyId);
  const manager = users.find((u) => u.id === company?.accountManagerId);
  const mine = tickets.filter((t) => t.requesterId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const open = mine.filter((t) => ["open", "in_progress", "waiting"].includes(t.status));
  const waitingOnMe = open.filter((t) => t.status === "waiting");
  const articles = content.filter((c) => c.type === "article" && c.status === "published");
  const q = query.trim().toLowerCase();
  const matches = q ? articles.filter((a) => `${a.title} ${a.excerpt}`.toLowerCase().includes(q)).slice(0, 5) : [];
  const popular = [...articles].sort((a, b) => b.views - a.views).slice(0, 6);
  const alerts = content.filter((c) => c.type === "announcement" && c.status === "published");

  return (
    <div className="space-y-6">
      <div className="bg-sidebar relative overflow-hidden rounded-2xl px-6 py-10 text-white sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(50% 90% at 0% 0%, color-mix(in oklch, var(--brand) 60%, transparent), transparent 70%)" }}
        />
        <div className="relative max-w-2xl space-y-5">
          <div className="space-y-2">
            <p className="text-sm text-white/60">{company?.name}</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {settings.portalWelcome.replace("Hi there", `Hi ${user.name.replace(/^(Dr\.|Mrs\.|Mr\.)\s/, "").split(" ")[0]}`)}
            </h1>
          </div>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your problem – e.g. “can't print”"
              className="bg-background text-foreground h-12 rounded-xl pl-12 text-base"
            />
            {q && (
              <div className="bg-popover text-popover-foreground absolute inset-x-0 top-14 z-10 overflow-hidden rounded-xl border shadow-lg">
                {matches.map((a) => (
                  <Link key={a.id} href={`/knowledge-base/${a.slug}`} className="hover:bg-muted flex items-center gap-3 px-4 py-3 text-sm">
                    <BookOpen className="text-primary size-4" />
                    <span className="flex-1">{a.title}</span>
                    <ArrowRight className="text-muted-foreground size-4" />
                  </Link>
                ))}
                <button onClick={() => setNewOpen(true)} className="hover:bg-muted flex w-full items-center gap-3 border-t px-4 py-3 text-left text-sm">
                  <LifeBuoy className="text-primary size-4" />
                  <span className="flex-1">
                    {matches.length ? "None of these? " : "No articles found. "}
                    <span className="text-primary font-medium">Raise a ticket</span>
                  </span>
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setNewOpen(true)} className="bg-white text-zinc-900 hover:bg-white/90">
              <LifeBuoy />
              Raise a ticket
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <a href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}>
                <Phone />
                {settings.supportPhone}
              </a>
            </Button>
          </div>
        </div>
      </div>

      {waitingOnMe.length > 0 && (
        <Link
          href={`/tickets/${waitingOnMe[0].id}`}
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <Clock className="size-4 shrink-0" />
          <span className="flex-1">
            <span className="font-semibold">We need your reply</span> on {waitingOnMe.length === 1 ? `“${waitingOnMe[0].subject}”` : `${waitingOnMe.length} tickets`} so we can keep
            going.
          </span>
          <ArrowRight className="size-4" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="gap-0 pb-0 xl:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle>Your open tickets</CardTitle>
            <CardDescription>We&apos;ll email you whenever there&apos;s an update.</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/tickets">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <div className="divide-y border-t">
            {open.slice(0, 5).map((t) => {
              const eng = users.find((u) => u.id === t.assigneeId);
              return (
                <Link key={t.id} href={`/tickets/${t.id}`} className="hover:bg-muted/40 flex items-center gap-4 px-6 py-3.5">
                  <Ticket className="text-muted-foreground size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{t.subject}</div>
                    <div className="text-muted-foreground text-xs">
                      {ticketRef(t.number)} · updated {timeAgo(t.updatedAt)}
                      {eng ? ` · ${eng.name}` : ""}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </Link>
              );
            })}
            {open.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <CheckCircle2 className="size-8 text-emerald-600" />
                <div className="font-medium">No open tickets</div>
                <p className="text-muted-foreground text-sm">Everything&apos;s running smoothly.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Your support</CardTitle>
            <CardDescription>
              {company?.name} · <Badge variant="outline">{company?.plan} plan</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {manager && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <UserAvatar name={manager.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="text-muted-foreground text-xs">Your account manager</div>
                  <div className="font-medium">{manager.name}</div>
                  <a href={`mailto:${manager.email}`} className="text-primary flex items-center gap-1 truncate text-xs hover:underline">
                    <Mail className="size-3" />
                    {manager.email}
                  </a>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div className="text-sm font-medium">Our response promise</div>
              {PRIORITY_ORDER.map((p) => (
                <div key={p} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{PRIORITY_META[p].label}</span>
                  <span className="font-medium">within {formatHours(settings.sla[p].response)}</span>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground border-t pt-3 text-xs">Service desk hours: {settings.businessHours}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="gap-3 xl:col-span-2">
          <CardHeader>
            <CardTitle>Popular help articles</CardTitle>
            <CardDescription>Quick fixes for the things people ask us most</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/knowledge-base">Help centre</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {popular.map((a) => (
              <Link key={a.id} href={`/knowledge-base/${a.slug}`} className="hover:border-primary/40 flex items-start gap-3 rounded-lg border p-3 transition-colors">
                <BookOpen className="text-primary mt-0.5 size-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-muted-foreground line-clamp-1 text-xs">{a.excerpt}</div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardHeader>
            <CardTitle>Service status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4" />
                All systems operational
              </div>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="space-y-1.5 rounded-lg border p-3">
                  {a.level && (
                    <Badge variant="outline" className={LEVEL_META[a.level].className}>
                      {LEVEL_META[a.level].label}
                    </Badge>
                  )}
                  <div className="text-sm font-medium">{a.title}</div>
                  <p className="text-muted-foreground text-xs">{a.excerpt}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <NewTicketDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}
