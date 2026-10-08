"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Lock,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Phone,
  RotateCcw,
  Send,
  StickyNote,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/page-header";
import { PriorityBadge, SlaBadge, StatusBadge } from "@/components/ticket-badges";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CHANNEL_LABEL, PRIORITY_META, PRIORITY_ORDER, ROLE_META, STATUS_META, STATUS_ORDER } from "@/lib/constants";
import { formatDateTime, slaInfo, ticketRef, timeAgo } from "@/lib/format";
import { useAppStore, useCan, useCurrentUser } from "@/lib/store";
import type { Priority, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const CANNED = [
  {
    title: "Remote session request",
    body: "Hi {first}, thanks for getting in touch. Could you let me know a good time for a quick remote session so I can take a look? Thanks",
  },
  {
    title: "Please restart and retry",
    body: "Hi {first}, could you please save your work, restart your computer and try again? Let me know if the problem is still there.",
  },
  {
    title: "Fixed – please confirm",
    body: "Hi {first}, I've applied a fix on our side. Could you try again and confirm everything is working? I'll mark this as resolved for now.",
  },
  {
    title: "Escalated to 2nd line",
    body: "Hi {first}, I've escalated this to our 2nd line team, who will be in touch shortly. Thanks for your patience.",
  },
];

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useCurrentUser()!;
  const ticket = useAppStore((s) => s.tickets.find((t) => t.id === id));
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const companies = useAppStore((s) => s.companies);
  const categories = useAppStore((s) => s.settings.categories);
  const clientCanClose = useAppStore((s) => s.settings.clientCanCloseTickets);
  const csatEnabled = useAppStore((s) => s.settings.csatEnabled);
  const updateTicket = useAppStore((s) => s.updateTicket);
  const addMessage = useAppStore((s) => s.addMessage);
  const rateTicket = useAppStore((s) => s.rateTicket);
  const deleteTickets = useAppStore((s) => s.deleteTickets);
  const canAssign = useCan("tickets.assign");
  const canNotes = useCan("tickets.internal_notes");
  const canDelete = useCan("tickets.delete");

  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [draft, setDraft] = useState("");

  const isClient = user.role === "client";
  const requester = users.find((u) => u.id === ticket?.requesterId);
  const company = companies.find((c) => c.id === ticket?.companyId);
  const assignee = users.find((u) => u.id === ticket?.assigneeId);
  const techs = users.filter((u) => u.role !== "client" && u.status === "active");

  const timeline = useMemo(() => {
    if (!ticket) return [];
    const msgs = ticket.messages
      .filter((m) => !(isClient && m.internal))
      .map((m) => ({ kind: "message" as const, at: m.createdAt, m }));
    const evts = isClient ? [] : ticket.events.map((e) => ({ kind: "event" as const, at: e.createdAt, e }));
    return [...msgs, ...evts].sort((a, b) => a.at.localeCompare(b.at));
  }, [ticket, isClient]);

  if (!ticket || (isClient && ticket.requesterId !== user.id)) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Ticket not found"
        description="It may have been deleted, or you don't have access to it."
        action={
          <Button asChild variant="outline">
            <Link href="/tickets">Back to tickets</Link>
          </Button>
        }
      />
    );
  }

  const userById = (uid: string) => users.find((u) => u.id === uid);
  const otherTickets = tickets
    .filter((t) => t.companyId === ticket.companyId && t.id !== ticket.id && ["open", "in_progress", "waiting"].includes(t.status))
    .slice(0, 4);
  const sla = slaInfo(ticket);
  const firstName = requester?.name.replace(/^(Dr\.|Mrs\.|Mr\.)\s/, "").split(" ")[0] ?? "there";
  const isOpen = ["open", "in_progress", "waiting"].includes(ticket.status);

  const send = (nextStatus?: TicketStatus) => {
    if (!draft.trim()) return;
    const internal = mode === "note" && !isClient;
    addMessage(ticket.id, draft.trim(), internal);
    if (nextStatus) updateTicket(ticket.id, { status: nextStatus });
    setDraft("");
    toast.success(internal ? "Internal note added" : isClient ? "Reply sent to the service desk" : `Reply sent to ${requester?.name}`, {
      description: nextStatus ? `Status set to ${STATUS_META[nextStatus].label}` : undefined,
    });
  };

  const setField = (patch: Parameters<typeof updateTicket>[1], label: string) => {
    updateTicket(ticket.id, patch);
    toast.success(label);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link href="/tickets" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="size-4" />
          {isClient ? "My tickets" : "Tickets"}
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
              <span className="font-mono">{ticketRef(ticket.number)}</span>
              <span>·</span>
              <span>Opened {timeAgo(ticket.createdAt)}</span>
              <span>·</span>
              <span>via {CHANNEL_LABEL[ticket.channel]}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={ticket.status} />
              {!isClient && <PriorityBadge priority={ticket.priority} />}
              {!isClient && <SlaBadge ticket={ticket} />}
              {ticket.tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  #{t}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!isClient && isOpen && (
              <Button onClick={() => setField({ status: "resolved" }, `${ticketRef(ticket.number)} marked as resolved`)}>
                <CheckCircle2 />
                Resolve
              </Button>
            )}
            {!isOpen && (
              <Button variant="outline" onClick={() => setField({ status: "open" }, "Ticket reopened")}>
                <RotateCcw />
                Reopen
              </Button>
            )}
            {isClient && isOpen && clientCanClose && (
              <Button variant="outline" onClick={() => setField({ status: "resolved" }, "Thanks! We've marked this as resolved.")}>
                <CheckCircle2 />
                It&apos;s fixed – close ticket
              </Button>
            )}
            {!isClient && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => toast.info("Copied link to ticket")}>Copy link</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast.info("Merge tickets", { description: "Coming in the full build." })}>
                    Merge with another ticket
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setField({ status: "closed" }, "Ticket closed")}>Close ticket</DropdownMenuItem>
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => {
                          deleteTickets([ticket.id]);
                          toast.success(`${ticketRef(ticket.number)} deleted`);
                          router.push("/tickets");
                        }}
                      >
                        <Trash2 />
                        Delete ticket
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          {isClient && csatEnabled && ["resolved", "closed"].includes(ticket.status) && (
            <Card className="border-brand-ink/30 bg-primary/20 py-4">
              <CardContent className="flex flex-col gap-3 px-5 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="font-medium">How did we do?</div>
                  <p className="text-muted-foreground text-sm">Your feedback helps us improve our service.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={ticket.satisfaction === "positive" ? "default" : "outline"}
                    onClick={() => {
                      rateTicket(ticket.id, "positive");
                      toast.success("Thanks for your feedback!");
                    }}
                  >
                    <ThumbsUp />
                    Good
                  </Button>
                  <Button
                    variant={ticket.satisfaction === "negative" ? "default" : "outline"}
                    onClick={() => {
                      rateTicket(ticket.id, "negative");
                      toast.success("Thanks – a manager will review this ticket.");
                    }}
                  >
                    <ThumbsDown />
                    Not good
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {timeline.map((item) => {
              if (item.kind === "event") {
                const actor = userById(item.e.actorId);
                return (
                  <div key={item.e.id} className="text-muted-foreground flex items-center gap-2 pl-2 text-xs">
                    <Zap className="size-3.5" />
                    <span>
                      <span className="text-foreground font-medium">{actor?.name ?? "System"}</span> {item.e.text}
                    </span>
                    <span>· {formatDateTime(item.e.createdAt)}</span>
                  </div>
                );
              }
              const m = item.m;
              const author = userById(m.authorId);
              const staff = author?.role !== "client";
              return (
                <div key={m.id} className="flex gap-3">
                  <UserAvatar name={author?.name ?? "?"} size="lg" className="mt-1 hidden sm:flex" />
                  <div
                    className={cn(
                      "min-w-0 flex-1 rounded-xl border p-4",
                      m.internal
                        ? "border-amber-200 bg-amber-50/70 dark:border-amber-500/25 dark:bg-amber-500/10"
                        : staff
                          ? "bg-card"
                          : "bg-muted/40",
                    )}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold">{author?.name ?? "Unknown"}</span>
                      {author && (
                        <span className="text-muted-foreground text-xs">
                          {staff ? (author.role === "admin" ? "DeskSupport" : `${author.jobTitle}`) : company?.name}
                        </span>
                      )}
                      {m.internal && (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300"
                        >
                          <Lock />
                          Internal note
                        </Badge>
                      )}
                      <span className="text-muted-foreground ml-auto text-xs">{formatDateTime(m.createdAt)}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="gap-0 overflow-hidden py-0">
            {!isClient && canNotes && (
              <div className="flex border-b">
                <button
                  onClick={() => setMode("reply")}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                    mode === "reply" ? "border-brand-ink text-foreground" : "text-muted-foreground border-transparent",
                  )}
                >
                  <MessageSquare className="size-4" />
                  Reply to {firstName}
                </button>
                <button
                  onClick={() => setMode("note")}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                    mode === "note" ? "border-amber-500 text-foreground" : "text-muted-foreground border-transparent",
                  )}
                >
                  <StickyNote className="size-4" />
                  Internal note
                </button>
              </div>
            )}
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                isClient
                  ? "Add a reply or more details…"
                  : mode === "note"
                    ? "Only your team can see internal notes…"
                    : `Write a reply to ${firstName}…`
              }
              className={cn(
                "min-h-32 resize-none rounded-none border-0 px-4 py-3 shadow-none focus-visible:ring-0",
                mode === "note" && !isClient && "bg-amber-50/50 dark:bg-amber-500/5",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
              }}
            />
            <div className="bg-muted/30 flex flex-wrap items-center gap-2 border-t px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.info("Attachments", { description: "File uploads arrive with the backend build." })}
              >
                <Paperclip />
                Attach
              </Button>
              {!isClient && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Zap />
                      Canned replies
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel>Insert a saved reply</DropdownMenuLabel>
                    {CANNED.map((c) => (
                      <DropdownMenuItem
                        key={c.title}
                        onSelect={() => {
                          setMode("reply");
                          setDraft(c.body.replace("{first}", firstName));
                        }}
                      >
                        {c.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <div className="ml-auto flex items-center">
                <Button
                  size="sm"
                  disabled={!draft.trim()}
                  onClick={() => send()}
                  className={cn(!isClient && mode === "reply" && "rounded-r-none")}
                >
                  <Send />
                  {mode === "note" && !isClient ? "Add note" : "Send"}
                </Button>
                {!isClient && mode === "reply" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" disabled={!draft.trim()} className="border-primary-foreground/20 rounded-l-none border-l px-2">
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => send("waiting")}>Send and wait on customer</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => send("resolved")}>Send and resolve</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {!isClient ? (
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="text-sm">Properties</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Select
                    value={ticket.status}
                    onValueChange={(v) => setField({ status: v as TicketStatus }, `Status changed to ${STATUS_META[v as TicketStatus].label}`)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className={cn("size-2 rounded-full", STATUS_META[s].dot)} />
                          {STATUS_META[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-muted-foreground text-xs">Priority</Label>
                  <Select
                    value={ticket.priority}
                    onValueChange={(v) => setField({ priority: v as Priority }, `Priority changed to ${PRIORITY_META[v as Priority].label}`)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_ORDER.map((p) => (
                        <SelectItem key={p} value={p}>
                          <PriorityBadge priority={p} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-muted-foreground text-xs">Assignee</Label>
                  <Select
                    value={ticket.assigneeId ?? "none"}
                    disabled={!canAssign}
                    onValueChange={(v) => {
                      const next = v === "none" ? null : v;
                      setField({ assigneeId: next }, next ? `Assigned to ${userById(next)?.name}` : "Ticket unassigned");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {techs.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          <UserAvatar name={u.name} size="xs" />
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!canAssign && <p className="text-muted-foreground text-xs">Your role can&apos;t re-assign tickets.</p>}
                  {canAssign && ticket.assigneeId !== user.id && (
                    <button
                      className="text-brand-ink w-fit text-xs font-medium hover:underline"
                      onClick={() => setField({ assigneeId: user.id }, "Assigned to you")}
                    >
                      Assign to me
                    </button>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-muted-foreground text-xs">Category</Label>
                  <Select value={ticket.category} onValueChange={(v) => setField({ category: v }, `Category changed to ${v}`)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="text-sm">Ticket details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <Row label="Status">
                  <StatusBadge status={ticket.status} />
                </Row>
                <Row label="Engineer">
                  {assignee ? (
                    <span className="flex items-center gap-2">
                      <UserAvatar name={assignee.name} size="xs" />
                      {assignee.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Being assigned</span>
                  )}
                </Row>
                <Row label="Priority">{PRIORITY_META[ticket.priority].label}</Row>
                <Row label="Category">{ticket.category}</Row>
                <Row label="Opened">{formatDateTime(ticket.createdAt)}</Row>
              </CardContent>
            </Card>
          )}

          {!isClient && (
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="size-4" />
                  SLA
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <Row label="Resolution due">
                  <span className="text-right">
                    {formatDateTime(ticket.dueAt)}
                    <br />
                    <SlaBadge ticket={ticket} />
                  </span>
                </Row>
                <Row label="First response">
                  {ticket.firstResponseAt ? formatDateTime(ticket.firstResponseAt) : <span className="text-amber-700 dark:text-amber-300">Awaiting</span>}
                </Row>
                {ticket.resolvedAt && <Row label="Resolved">{formatDateTime(ticket.resolvedAt)}</Row>}
                <Row label="Outcome">
                  <span className={cn(sla.tone === "breached" || sla.tone === "missed" ? "text-red-700 dark:text-red-300" : "")}>
                    {
                      {
                        met: "Within SLA",
                        missed: "Missed",
                        breached: "Breached",
                        paused: "Paused – waiting on customer",
                        at_risk: "At risk",
                        ok: "On track",
                      }[sla.tone]
                    }
                  </span>
                </Row>
              </CardContent>
            </Card>
          )}

          {!isClient && requester && (
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="text-sm">Requester</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <UserAvatar name={requester.name} size="lg" />
                  <div className="min-w-0">
                    <div className="font-medium">{requester.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {requester.jobTitle} · {ROLE_META[requester.role].label}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href={`mailto:${requester.email}`} className="text-muted-foreground hover:text-foreground flex items-center gap-2 truncate">
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">{requester.email}</span>
                  </a>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Phone className="size-4" />
                    {requester.phone}
                  </div>
                  {company && (
                    <Link href={`/companies/${company.id}`} className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                      <Building2 className="size-4" />
                      {company.name}
                      <Badge variant="outline" className="ml-auto font-normal">
                        {company.plan}
                      </Badge>
                    </Link>
                  )}
                </div>
                {otherTickets.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-muted-foreground text-xs font-medium">Other open tickets for {company?.name}</div>
                      {otherTickets.map((t) => (
                        <Link key={t.id} href={`/tickets/${t.id}`} className="hover:bg-muted/50 -mx-2 flex items-center gap-2 rounded-md px-2 py-1.5">
                          <span className={cn("size-2 shrink-0 rounded-full", STATUS_META[t.status].dot)} />
                          <span className="truncate">{t.subject}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
