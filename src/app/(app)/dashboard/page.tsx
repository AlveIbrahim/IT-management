"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format, startOfDay, subDays } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Inbox,
  SmilePlus,
  Ticket as TicketIcon,
  UserX,
} from "lucide-react";

import { BarList, ChartLegend, TrendChart } from "@/components/charts";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge, SlaBadge, StatusBadge } from "@/components/ticket-badges";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatHours, hoursBetween, slaInfo, ticketRef, timeAgo } from "@/lib/format";
import { useNow } from "@/hooks/use-now";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const ACTIVE = ["open", "in_progress", "waiting"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  tone?: "default" | "warning";
}) {
  return (
    <Link href={href} className="group">
      <Card className="group-hover:border-brand-ink/40 gap-3 py-5 transition-colors">
        <CardHeader className="px-5">
          <CardDescription className="flex items-center gap-2 font-medium">
            <Icon className={cn("size-4", tone === "warning" ? "text-red-600 dark:text-red-400" : "text-brand-ink")} />
            {label}
          </CardDescription>
          <CardAction>
            <ArrowUpRight className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </CardAction>
        </CardHeader>
        <CardContent className="px-5">
          <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
          <div className="text-muted-foreground mt-1 text-xs">{sub}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useCurrentUser()!;
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const companies = useAppStore((s) => s.companies);
  const now = useNow();

  const stats = useMemo(() => {
    const active = tickets.filter((t) => ACTIVE.includes(t.status));
    const last30 = tickets.filter((t) => now - new Date(t.createdAt).getTime() < 30 * 86_400_000);
    const prev7 = tickets.filter((t) => {
      const age = now - new Date(t.createdAt).getTime();
      return age >= 7 * 86_400_000 && age < 14 * 86_400_000;
    }).length;
    const this7 = tickets.filter((t) => now - new Date(t.createdAt).getTime() < 7 * 86_400_000).length;

    const responded = last30.filter((t) => t.firstResponseAt);
    const avgResponse = responded.length
      ? responded.reduce((s, t) => s + hoursBetween(t.createdAt, t.firstResponseAt!), 0) / responded.length
      : 0;

    const rated = last30.filter((t) => t.satisfaction);
    const csat = rated.length ? (rated.filter((t) => t.satisfaction === "positive").length / rated.length) * 100 : 0;

    const finished = last30.filter((t) => t.resolvedAt);
    const slaMet = finished.length ? (finished.filter((t) => slaInfo(t).tone === "met").length / finished.length) * 100 : 0;

    const attention = active
      .map((t) => ({ t, sla: slaInfo(t, now) }))
      .filter(({ sla }) => sla.tone === "breached" || sla.tone === "at_risk")
      .sort((a, b) => a.t.dueAt.localeCompare(b.t.dueAt));

    const days = Array.from({ length: 14 }, (_, i) => startOfDay(subDays(now, 13 - i)));
    const volume = days.map((d) => {
      const next = d.getTime() + 86_400_000;
      const inDay = (iso: string | null) => !!iso && new Date(iso).getTime() >= d.getTime() && new Date(iso).getTime() < next;
      return {
        day: format(d, "d MMM"),
        created: tickets.filter((t) => inDay(t.createdAt)).length,
        resolved: tickets.filter((t) => inDay(t.resolvedAt)).length,
      };
    });

    const byCategory = Object.entries(
      last30.reduce<Record<string, number>>((acc, t) => ({ ...acc, [t.category]: (acc[t.category] ?? 0) + 1 }), {}),
    )
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);

    const techs = users.filter((u) => u.role === "technician" && u.status === "active");
    const workload = techs
      .map((u) => ({ u, open: active.filter((t) => t.assigneeId === u.id).length }))
      .sort((a, b) => b.open - a.open);

    const clientLoad = companies
      .map((c) => ({ c, open: active.filter((t) => t.companyId === c.id).length }))
      .sort((a, b) => b.open - a.open);

    const recent = tickets
      .flatMap((t) => t.events.map((e) => ({ e, t })))
      .sort((a, b) => b.e.createdAt.localeCompare(a.e.createdAt))
      .slice(0, 7);

    return {
      active,
      unassigned: active.filter((t) => !t.assigneeId).length,
      mine: active.filter((t) => t.assigneeId === user.id).length,
      this7,
      prev7,
      avgResponse,
      csat,
      rated: rated.length,
      slaMet,
      attention,
      volume,
      byCategory,
      workload,
      clientLoad,
      recent,
    };
  }, [tickets, users, companies, user.id, now]);

  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "Someone";
  const delta = stats.this7 - stats.prev7;
  const series = [
    { key: "created", label: "Created", color: "var(--chart-1)" },
    { key: "resolved", label: "Resolved", color: "var(--chart-2)" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description={`Here's what's happening across your clients today, ${format(new Date(), "EEEE d MMMM")}.`}
        actions={
          <Button asChild variant="outline">
            <Link href="/tickets">
              Open ticket queue
              <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Open tickets"
          value={stats.active.length.toString()}
          icon={Inbox}
          href="/tickets"
          sub={
            <>
              {stats.this7} new this week ·{" "}
              <span className={delta > 0 ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"}>
                {delta > 0 ? "+" : ""}
                {delta} vs last week
              </span>
            </>
          }
        />
        <StatTile
          label="Overdue or at risk"
          value={stats.attention.length.toString()}
          icon={AlertTriangle}
          tone="warning"
          href="/tickets?view=breaching"
          sub={`${stats.unassigned} unassigned · SLA met on ${Math.round(stats.slaMet)}% (30d)`}
        />
        <StatTile
          label="Avg. first response"
          value={formatHours(stats.avgResponse)}
          icon={Clock}
          href="/tickets"
          sub="Last 30 days, all priorities"
        />
        <StatTile
          label="Customer satisfaction"
          value={`${Math.round(stats.csat)}%`}
          icon={SmilePlus}
          href="/tickets?view=resolved"
          sub={`From ${stats.rated} ratings in the last 30 days`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Ticket volume</CardTitle>
            <CardDescription>Created vs resolved, last 14 days</CardDescription>
            <CardAction>
              <ChartLegend series={series} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <TrendChart data={stats.volume} series={series} xKey="day" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top categories</CardTitle>
            <CardDescription>Tickets raised in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList items={stats.byCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="gap-0 pb-0 xl:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              Needs attention
              {stats.attention.length > 0 && (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
                  {stats.attention.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Tickets that have breached or are close to breaching their SLA</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/tickets?view=breaching">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <div className="divide-y border-t">
            {stats.attention.slice(0, 6).map(({ t }) => {
              const company = companies.find((c) => c.id === t.companyId);
              return (
                <Link
                  key={t.id}
                  href={`/tickets/${t.id}`}
                  className="hover:bg-muted/40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-6 py-3 transition-colors sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono text-xs">{ticketRef(t.number)}</span>
                      <span className="truncate text-sm font-medium">{t.subject}</span>
                    </div>
                    <div className="text-muted-foreground mt-0.5 truncate text-xs">
                      {company?.name} · {t.assigneeId ? userName(t.assigneeId) : "Unassigned"}
                    </div>
                  </div>
                  <PriorityBadge priority={t.priority} className="hidden sm:inline-flex" />
                  <StatusBadge status={t.status} className="hidden sm:inline-flex" />
                  <SlaBadge ticket={t} className="w-28 justify-end" />
                </Link>
              );
            })}
            {stats.attention.length === 0 && (
              <div className="text-muted-foreground px-6 py-10 text-center text-sm">All tickets are within SLA. Nice work!</div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team workload</CardTitle>
            <CardDescription>Open tickets per engineer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.workload.map(({ u, open }) => (
              <div key={u.id} className="flex items-center gap-3">
                <UserAvatar name={u.name} />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{u.name}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">{open} open</span>
                  </div>
                  <Progress
                    value={Math.min(100, (open / 12) * 100)}
                    className="bg-muted h-1.5"
                    indicatorClassName="bg-[var(--chart-1)]"
                  />
                </div>
              </div>
            ))}
            <div className="text-muted-foreground flex items-center gap-2 border-t pt-4 text-xs">
              <UserX className="size-3.5" />
              {stats.unassigned} tickets waiting to be assigned
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clients by open tickets</CardTitle>
            <CardDescription>Where the team&apos;s time is going right now</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              labelWidth="14rem"
              items={stats.clientLoad.map(({ c, open }) => ({ label: c.name, value: open, hint: `${c.plan} plan` }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest updates across all tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l pl-5">
              {stats.recent.map(({ e, t }) => (
                <li key={e.id} className="relative">
                  <span className="bg-background absolute top-1 -left-[25px] grid size-2.5 place-items-center rounded-full border-2 border-[var(--chart-1)]" />
                  <p className="text-sm">
                    <span className="font-medium">{userName(e.actorId)}</span>{" "}
                    <span className="text-muted-foreground">{e.text} on</span>{" "}
                    <Link href={`/tickets/${t.id}`} className="font-medium hover:underline">
                      <TicketIcon className="text-muted-foreground mr-1 inline size-3.5" />
                      {ticketRef(t.number)}
                    </Link>
                  </p>
                  <p className="text-muted-foreground text-xs">{timeAgo(e.createdAt)}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
