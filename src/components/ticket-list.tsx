"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";

import { PriorityBadge, SlaBadge, StatusBadge } from "@/components/ticket-badges";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from "@/lib/constants";
import { ticketRef, timeAgo } from "@/lib/format";
import { useAppStore, useCan } from "@/lib/store";
import type { Ticket } from "@/lib/types";
import { cn } from "@/lib/utils";

export type GroupBy = "status" | "priority" | "assignee" | "none";

type TicketPatch = Parameters<ReturnType<typeof useAppStore.getState>["updateTicket"]>[1];

interface Group {
  key: string;
  label: string;
  pill?: string;
  avatar?: string;
  tickets: Ticket[];
  /** Applied to a ticket dropped into this group. */
  patch?: TicketPatch;
}

const PREVIEW = 20;

/** ClickUp-style list: tickets clustered into collapsible groups. */
export function GroupedTicketList({
  tickets,
  groupBy,
  selected,
  onSelectedChange,
  defaultCollapsed = [],
  onNewTicket,
}: {
  tickets: Ticket[];
  groupBy: GroupBy;
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  defaultCollapsed?: string[];
  onNewTicket?: () => void;
}) {
  const users = useAppStore((s) => s.users);
  const companies = useAppStore((s) => s.companies);
  const updateTicket = useAppStore((s) => s.updateTicket);
  const canAssign = useCan("tickets.assign");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(defaultCollapsed.map((k) => [k, true])),
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [overGroup, setOverGroup] = useState<string | null>(null);

  const techs = users.filter((u) => u.role !== "client" && u.status === "active").sort((a, b) => a.name.localeCompare(b.name));

  let groups: Group[];
  if (groupBy === "status") {
    groups = STATUS_ORDER.map((s) => ({
      key: s,
      label: STATUS_META[s].label,
      pill: STATUS_META[s].pill,
      tickets: tickets.filter((t) => t.status === s),
      patch: { status: s },
    }));
  } else if (groupBy === "priority") {
    groups = PRIORITY_ORDER.map((p) => ({
      key: p,
      label: PRIORITY_META[p].label,
      pill: PRIORITY_META[p].pill,
      tickets: tickets.filter((t) => t.priority === p),
      patch: { priority: p },
    }));
  } else if (groupBy === "assignee") {
    groups = [
      {
        key: "unassigned",
        label: "Unassigned",
        pill: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100",
        tickets: tickets.filter((t) => !t.assigneeId),
        patch: canAssign ? { assigneeId: null } : undefined,
      },
      ...techs.map((u) => ({
        key: u.id,
        label: u.name,
        avatar: u.name,
        tickets: tickets.filter((t) => t.assigneeId === u.id),
        patch: canAssign ? { assigneeId: u.id } : undefined,
      })),
    ];
  } else {
    groups = [{ key: "all", label: "All tickets", pill: "bg-foreground text-background", tickets }];
  }
  groups = groups.filter((g) => g.tickets.length > 0);

  const userName = (id: string | null) => (id ? (users.find((u) => u.id === id)?.name ?? "—") : "Unassigned");
  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "";

  const drop = (group: Group) => {
    const t = tickets.find((x) => x.id === dragId);
    setDragId(null);
    setOverGroup(null);
    if (!t || !group.patch) return;
    const [key, value] = Object.entries(group.patch)[0] as [keyof Ticket, unknown];
    if (t[key] === value) return;
    updateTicket(t.id, group.patch);
    toast.success(`${ticketRef(t.number)} moved to ${group.label}`);
  };

  const showStatus = groupBy !== "status";
  const showPriority = groupBy !== "priority";
  const showAssignee = groupBy !== "assignee";

  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const isCollapsed = !!collapsed[g.key];
        const rows = expanded[g.key] ? g.tickets : g.tickets.slice(0, PREVIEW);
        const ids = g.tickets.map((t) => t.id);
        const picked = ids.filter((id) => selected.includes(id)).length;
        return (
          <section
            key={g.key}
            onDragOver={(e) => {
              if (!g.patch || !dragId) return;
              e.preventDefault();
              setOverGroup(g.key);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverGroup((o) => (o === g.key ? null : o));
            }}
            onDrop={() => drop(g)}
            className={cn(
              "rounded-xl transition-colors",
              overGroup === g.key && "bg-primary/15 outline-brand-ink/50 outline-2 outline-offset-4 outline-dashed",
            )}
          >
            <div className="flex items-center gap-2 px-1 pb-2">
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !isCollapsed }))}
                className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-6 place-items-center rounded-md"
                aria-label={isCollapsed ? `Expand ${g.label}` : `Collapse ${g.label}`}
                aria-expanded={!isCollapsed}
              >
                <ChevronDown className={cn("size-4 transition-transform", isCollapsed && "-rotate-90")} />
              </button>
              {g.avatar ? (
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <UserAvatar name={g.avatar} size="sm" />
                  {g.label}
                </span>
              ) : (
                <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase", g.pill)}>
                  {g.label}
                </span>
              )}
              <span className="text-muted-foreground text-sm tabular-nums">{g.tickets.length}</span>
              {groupBy === "status" && g.key === "open" && onNewTicket && (
                <Button variant="ghost" size="sm" className="text-muted-foreground ml-1 h-7" onClick={onNewTicket}>
                  <Plus />
                  New ticket
                </Button>
              )}
            </div>

            {!isCollapsed && (
              <div className="bg-card overflow-x-auto rounded-xl border shadow-xs">
                <table className="w-full min-w-[880px] table-fixed text-sm">
                  <colgroup>
                    <col className="w-11" />
                    <col className="w-[92px]" />
                    <col />
                    {showStatus && <col className="w-[170px]" />}
                    {showPriority && <col className="w-[100px]" />}
                    {showAssignee && <col className="w-[170px]" />}
                    <col className="w-[140px]" />
                    <col className="w-[124px]" />
                  </colgroup>
                  <thead>
                    <tr className="text-muted-foreground border-b text-left text-xs">
                      <th className="py-2 pl-4 font-medium">
                        <Checkbox
                          checked={picked === 0 ? false : picked === ids.length ? true : "indeterminate"}
                          onCheckedChange={(c) =>
                            onSelectedChange(
                              c === true
                                ? Array.from(new Set([...selected, ...ids]))
                                : selected.filter((id) => !ids.includes(id)),
                            )
                          }
                          aria-label={`Select all in ${g.label}`}
                        />
                      </th>
                      <th className="px-3 py-2 font-medium">Ref</th>
                      <th className="px-3 py-2 font-medium">Subject</th>
                      {showStatus && <th className="px-3 py-2 font-medium">Status</th>}
                      {showPriority && <th className="px-3 py-2 font-medium">Priority</th>}
                      {showAssignee && <th className="px-3 py-2 font-medium">Assignee</th>}
                      <th className="px-3 py-2 font-medium">SLA</th>
                      <th className="py-2 pr-4 pl-3 text-right font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((t) => (
                      <TicketRow
                        key={t.id}
                        ticket={t}
                        selected={selected.includes(t.id)}
                        onSelect={(c) => onSelectedChange(c ? [...selected, t.id] : selected.filter((x) => x !== t.id))}
                        draggable={!!g.patch}
                        dragging={dragId === t.id}
                        onDragStart={() => setDragId(t.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverGroup(null);
                        }}
                        requester={userName(t.requesterId)}
                        company={companyName(t.companyId)}
                        assignee={t.assigneeId ? userName(t.assigneeId) : null}
                        columns={{ status: showStatus, priority: showPriority, assignee: showAssignee }}
                      />
                    ))}
                  </tbody>
                </table>
                {g.tickets.length > PREVIEW && (
                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [g.key]: !e[g.key] }))}
                    className="text-muted-foreground hover:bg-muted/50 hover:text-foreground w-full border-t px-4 py-2.5 text-left text-xs font-medium"
                  >
                    {expanded[g.key] ? "Show less" : `Show ${g.tickets.length - PREVIEW} more`}
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function TicketRow({
  ticket: t,
  selected,
  onSelect,
  draggable,
  dragging,
  onDragStart,
  onDragEnd,
  requester,
  company,
  assignee,
  columns,
}: {
  ticket: Ticket;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  draggable: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  requester: string;
  company: string;
  assignee: string | null;
  columns: { status: boolean; priority: boolean; assignee: boolean };
}) {
  const router = useRouter();
  const updateTicket = useAppStore((s) => s.updateTicket);

  return (
    <tr
      data-state={selected ? "selected" : undefined}
      onClick={() => router.push(`/tickets/${t.id}`)}
      className={cn(
        "group/row hover:bg-muted/50 data-[state=selected]:bg-primary/15 cursor-pointer border-b transition-colors last:border-0",
        dragging && "opacity-40",
      )}
    >
      <td className="relative py-2.5 pl-4" onClick={(e) => e.stopPropagation()}>
        {draggable && (
          <div
            draggable
            onDragStart={(e) => {
              // Browsers only complete a drop when the drag carries data.
              e.dataTransfer.setData("text/plain", t.id);
              e.dataTransfer.effectAllowed = "move";
              const row = e.currentTarget.closest("tr");
              if (row) e.dataTransfer.setDragImage(row, 24, 20);
              onDragStart();
            }}
            onDragEnd={onDragEnd}
            className="text-muted-foreground absolute top-1/2 left-0.5 -translate-y-1/2 cursor-grab opacity-0 transition-opacity group-hover/row:opacity-100 active:cursor-grabbing"
            title="Drag to another group"
            aria-hidden
          >
            <GripVertical className="size-3.5" />
          </div>
        )}
        <Checkbox checked={selected} onCheckedChange={(c) => onSelect(c === true)} aria-label={`Select ${ticketRef(t.number)}`} />
      </td>
      <td className="text-muted-foreground px-3 py-2.5 font-mono text-xs">{ticketRef(t.number)}</td>
      <td className="px-3 py-2.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button
                className={cn(
                  "mt-0.5 size-3.5 shrink-0 rounded-full border-2 transition-transform hover:scale-125",
                  STATUS_META[t.status].ring,
                )}
                aria-label={`Status: ${STATUS_META[t.status].label}. Change status`}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Change status</DropdownMenuLabel>
              {STATUS_ORDER.map((s) => (
                <DropdownMenuItem
                  key={s}
                  disabled={s === t.status}
                  onSelect={() => {
                    updateTicket(t.id, { status: s });
                    toast.success(`${ticketRef(t.number)} moved to ${STATUS_META[s].label}`);
                  }}
                >
                  <span className={cn("size-3 rounded-full border-2", STATUS_META[s].ring)} />
                  {STATUS_META[s].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="min-w-0">
            <Link
              href={`/tickets/${t.id}`}
              className="block truncate font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            >
              {t.subject}
            </Link>
            <div className="text-muted-foreground truncate text-xs">
              {requester} · {company}
            </div>
          </div>
        </div>
      </td>
      {columns.status && (
        <td className="px-3 py-2.5">
          <StatusBadge status={t.status} />
        </td>
      )}
      {columns.priority && (
        <td className="px-3 py-2.5">
          <PriorityBadge priority={t.priority} />
        </td>
      )}
      {columns.assignee && (
        <td className="px-3 py-2.5">
          {assignee ? (
            <div className="flex min-w-0 items-center gap-2">
              <UserAvatar name={assignee} size="sm" />
              <span className="truncate">{assignee}</span>
            </div>
          ) : (
            <span className="text-muted-foreground italic">Unassigned</span>
          )}
        </td>
      )}
      <td className="px-3 py-2.5">
        <SlaBadge ticket={t} />
      </td>
      <td className="text-muted-foreground py-2.5 pr-4 pl-3 text-right text-xs whitespace-nowrap">{timeAgo(t.updatedAt)}</td>
    </tr>
  );
}
