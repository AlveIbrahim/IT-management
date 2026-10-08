"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Columns3,
  Inbox,
  Layers,
  List,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/page-header";
import { NewTicketDialog } from "@/components/new-ticket-dialog";
import { PriorityBadge, StatusBadge } from "@/components/ticket-badges";
import { UserAvatar } from "@/components/user-avatar";
import { TicketBoard } from "@/components/ticket-board";
import { GroupedTicketList, type GroupBy } from "@/components/ticket-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from "@/lib/constants";
import { slaInfo, ticketRef, timeAgo } from "@/lib/format";
import { useNow } from "@/hooks/use-now";
import { useAppStore, useCan, useCurrentUser } from "@/lib/store";
import type { Priority, Ticket, TicketStatus } from "@/lib/types";

const ACTIVE: TicketStatus[] = ["open", "in_progress", "waiting"];

const VIEWS = [
  { key: "open", label: "All open" },
  { key: "mine", label: "Assigned to me" },
  { key: "unassigned", label: "Unassigned" },
  { key: "breaching", label: "Overdue / at risk" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All tickets" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];
type SortKey = "updated" | "created" | "priority" | "due";

const GROUP_LABEL: Record<GroupBy, string> = {
  status: "Status",
  priority: "Priority",
  assignee: "Assignee",
  none: "None",
};

function TicketsPageInner() {
  const user = useCurrentUser()!;
  const isClient = user.role === "client";
  return isClient ? <ClientTickets /> : <StaffTickets />;
}

function StaffTickets() {
  const user = useCurrentUser()!;
  const router = useRouter();
  const params = useSearchParams();
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const companies = useAppStore((s) => s.companies);
  const categories = useAppStore((s) => s.settings.categories);
  const bulkUpdate = useAppStore((s) => s.bulkUpdateTickets);
  const deleteTickets = useAppStore((s) => s.deleteTickets);
  const canAssign = useCan("tickets.assign");
  const canDelete = useCan("tickets.delete");

  const initialView = (VIEWS.find((v) => v.key === params.get("view"))?.key ?? "open") as ViewKey;
  const [view, setView] = useState<ViewKey>(initialView);
  const [layout, setLayout] = useState<"list" | "board">("list");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [assignee, setAssignee] = useState<string>("all");
  const [company, setCompany] = useState<string>(params.get("company") ?? "all");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [selected, setSelected] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>("status");
  const [newOpen, setNewOpen] = useState(false);

  const techs = users.filter((u) => u.role !== "client" && u.status === "active");
  const userName = (id: string | null) => (id ? (users.find((u) => u.id === id)?.name ?? "—") : "Unassigned");
  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "";

  const now = useNow();

  const counts = useMemo(() => {
    return {
      open: tickets.filter((t) => ACTIVE.includes(t.status)).length,
      mine: tickets.filter((t) => ACTIVE.includes(t.status) && t.assigneeId === user.id).length,
      unassigned: tickets.filter((t) => ACTIVE.includes(t.status) && !t.assigneeId).length,
      breaching: tickets.filter((t) => ACTIVE.includes(t.status) && ["breached", "at_risk"].includes(slaInfo(t, now).tone)).length,
      resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
      all: tickets.length,
    } satisfies Record<ViewKey, number>;
  }, [tickets, user.id, now]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = tickets.filter((t) => {
      if (layout === "list") {
        if (view === "open" && !ACTIVE.includes(t.status)) return false;
        if (view === "mine" && !(ACTIVE.includes(t.status) && t.assigneeId === user.id)) return false;
        if (view === "unassigned" && !(ACTIVE.includes(t.status) && !t.assigneeId)) return false;
        if (view === "breaching" && !(ACTIVE.includes(t.status) && ["breached", "at_risk"].includes(slaInfo(t, now).tone)))
          return false;
        if (view === "resolved" && !["resolved", "closed"].includes(t.status)) return false;
      } else if (t.status === "closed") return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (assignee === "none" && t.assigneeId) return false;
      if (assignee !== "all" && assignee !== "none" && t.assigneeId !== assignee) return false;
      if (company !== "all" && t.companyId !== company) return false;
      if (category !== "all" && t.category !== category) return false;
      if (q) {
        const hay = `${ticketRef(t.number)} ${t.subject} ${userName(t.requesterId)} ${companyName(t.companyId)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const sorters: Record<SortKey, (a: Ticket, b: Ticket) => number> = {
      updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      created: (a, b) => b.createdAt.localeCompare(a.createdAt),
      priority: (a, b) => PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight || a.dueAt.localeCompare(b.dueAt),
      due: (a, b) => a.dueAt.localeCompare(b.dueAt),
    };
    return list.sort(sorters[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, view, layout, query, priority, assignee, company, category, sort, user.id, users, companies, now]);

  const hasFilters = query || priority !== "all" || assignee !== "all" || company !== "all" || category !== "all";

  const clearFilters = () => {
    setQuery("");
    setPriority("all");
    setAssignee("all");
    setCompany("all");
    setCategory("all");
  };

  const changeView = (v: ViewKey) => {
    setView(v);
    setSelected([]);
    router.replace(v === "open" ? "/tickets" : `/tickets?view=${v}`, { scroll: false });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tickets"
        description="Every request from every client, in one queue."
        actions={
          <>
            <ToggleGroup type="single" value={layout} onValueChange={(v) => v && setLayout(v as "list" | "board")}>
              <ToggleGroupItem value="list" aria-label="List view">
                <List />
                List
              </ToggleGroupItem>
              <ToggleGroupItem value="board" aria-label="Board view">
                <Columns3 />
                Board
              </ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={() => setNewOpen(true)}>
              <Plus />
              New ticket
            </Button>
          </>
        }
      />

      {layout === "list" && (
        <Tabs value={view} onValueChange={(v) => changeView(v as ViewKey)}>
          <TabsList className="h-auto flex-wrap justify-start">
            {VIEWS.map((v) => (
              <TabsTrigger key={v.key} value={v.key} className="flex-none gap-2">
                {v.label}
                <span className="bg-muted-foreground/10 rounded px-1.5 text-[11px] tabular-nums">{counts[v.key]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by subject, ref, client…"
            className="pl-9"
          />
        </div>
        <Select value={priority} onValueChange={(v) => setPriority(v as Priority | "all")}>
          <SelectTrigger size="sm" className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any priority</SelectItem>
            {PRIORITY_ORDER.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_META[p].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any assignee</SelectItem>
            <SelectItem value="none">Unassigned</SelectItem>
            {techs.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={company} onValueChange={setCompany}>
          <SelectTrigger size="sm" className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger size="sm" className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X />
            Clear
          </Button>
        )}
        {layout === "list" && (
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Layers />
                  Group: {GROUP_LABEL[groupBy]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Group by</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                  {(Object.keys(GROUP_LABEL) as GroupBy[]).map((g) => (
                    <DropdownMenuRadioItem key={g} value={g}>
                      {GROUP_LABEL[g]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <DropdownMenuRadioItem value="updated">Last updated</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="created">Newest first</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="due">Due soonest</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {layout === "board" ? (
        <TicketBoard tickets={filtered} />
      ) : (
        <div className="space-y-4">
          {selected.length > 0 && (
            <div className="bg-card sticky top-[72px] z-10 flex flex-wrap items-center gap-2 rounded-xl border px-4 py-2 shadow-md">
              <span className="text-sm font-medium">{selected.length} selected</span>
              {canAssign && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus />
                      Assign
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {techs.map((u) => (
                      <DropdownMenuItem
                        key={u.id}
                        onSelect={() => {
                          bulkUpdate(selected, { assigneeId: u.id });
                          toast.success(`${selected.length} tickets assigned to ${u.name}`);
                          setSelected([]);
                        }}
                      >
                        <UserAvatar name={u.name} size="xs" />
                        {u.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Set status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {STATUS_ORDER.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onSelect={() => {
                        bulkUpdate(selected, { status: s });
                        toast.success(`${selected.length} tickets set to ${STATUS_META[s].label}`);
                        setSelected([]);
                      }}
                    >
                      <span className={`size-2 rounded-full ${STATUS_META[s].dot}`} />
                      {STATUS_META[s].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Set priority
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {PRIORITY_ORDER.map((p) => (
                    <DropdownMenuItem
                      key={p}
                      onSelect={() => {
                        bulkUpdate(selected, { priority: p });
                        toast.success(`${selected.length} tickets set to ${PRIORITY_META[p].label}`);
                        setSelected([]);
                      }}
                    >
                      <PriorityBadge priority={p} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    deleteTickets(selected);
                    toast.success(`${selected.length} tickets deleted`);
                    setSelected([]);
                  }}
                >
                  <Trash2 />
                  Delete
                </Button>
              )}
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected([])}>
                Clear selection
              </Button>
            </div>
          )}
          {filtered.length === 0 ? (
            <Card className="py-0">
              <EmptyState
                icon={Inbox}
                title="No tickets match"
                description="Try a different view or clear your filters."
                action={
                  hasFilters ? (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <GroupedTicketList
              key={`${view}-${groupBy}`}
              tickets={filtered}
              groupBy={groupBy}
              selected={selected}
              onSelectedChange={setSelected}
              defaultCollapsed={view === "all" ? ["closed"] : []}
              onNewTicket={() => setNewOpen(true)}
            />
          )}
        </div>
      )}

      <NewTicketDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

function ClientTickets() {
  const user = useCurrentUser()!;
  const router = useRouter();
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const [tab, setTab] = useState<"open" | "closed">("open");
  const [newOpen, setNewOpen] = useState(false);

  const mine = tickets
    .filter((t) => t.requesterId === user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const list = mine.filter((t) => (tab === "open" ? ACTIVE.includes(t.status) : !ACTIVE.includes(t.status)));
  const userName = (id: string | null) => (id ? (users.find((u) => u.id === id)?.name ?? "—") : "Not yet assigned");

  return (
    <div className="space-y-5">
      <PageHeader
        title="My tickets"
        description="Track the progress of everything you've asked us for."
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <Plus />
            Raise a ticket
          </Button>
        }
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as "open" | "closed")}>
        <TabsList>
          <TabsTrigger value="open">Open ({mine.filter((t) => ACTIVE.includes(t.status)).length})</TabsTrigger>
          <TabsTrigger value="closed">Resolved ({mine.filter((t) => !ACTIVE.includes(t.status)).length})</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-24 pl-4">Ref</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead className="pr-4 text-right">Last update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((t) => (
              <TableRow key={t.id} className="cursor-pointer" onClick={() => router.push(`/tickets/${t.id}`)}>
                <TableCell className="text-muted-foreground pl-4 font-mono text-xs">{ticketRef(t.number)}</TableCell>
                <TableCell className="max-w-[420px]">
                  <div className="truncate font-medium">{t.subject}</div>
                  <div className="text-muted-foreground text-xs">{t.category}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={t.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    {t.assigneeId && <UserAvatar name={userName(t.assigneeId)} size="sm" />}
                    <span className={t.assigneeId ? "" : "text-muted-foreground italic"}>{userName(t.assigneeId)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground pr-4 text-right text-xs">{timeAgo(t.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {list.length === 0 && (
          <EmptyState
            icon={Inbox}
            title={tab === "open" ? "No open tickets" : "No resolved tickets yet"}
            description={tab === "open" ? "Everything's working? Great. If not, raise a ticket and we'll help." : undefined}
            action={
              tab === "open" ? (
                <Button size="sm" onClick={() => setNewOpen(true)}>
                  <Plus />
                  Raise a ticket
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>
      <NewTicketDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense>
      <TicketsPageInner />
    </Suspense>
  );
}
