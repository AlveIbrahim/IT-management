"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { PriorityBadge, SlaBadge } from "@/components/ticket-badges";
import { UserAvatar } from "@/components/user-avatar";
import { STATUS_META } from "@/lib/constants";
import { ticketRef } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import type { Ticket, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMNS: TicketStatus[] = ["open", "in_progress", "waiting", "resolved"];

export function TicketBoard({ tickets }: { tickets: Ticket[] }) {
  const users = useAppStore((s) => s.users);
  const companies = useAppStore((s) => s.companies);
  const updateTicket = useAppStore((s) => s.updateTicket);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<TicketStatus | null>(null);

  const drop = (status: TicketStatus) => {
    const t = tickets.find((x) => x.id === dragId);
    setOver(null);
    setDragId(null);
    if (!t || t.status === status) return;
    updateTicket(t.id, { status });
    toast.success(`${ticketRef(t.number)} moved to ${STATUS_META[status].label}`);
  };

  return (
    <div className="grid gap-4 overflow-x-auto pb-2 md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((status) => {
        const items = tickets
          .filter((t) => t.status === status)
          .sort((a, b) => (status === "resolved" ? b.updatedAt.localeCompare(a.updatedAt) : a.dueAt.localeCompare(b.dueAt)));
        const shown = status === "resolved" ? items.slice(0, 15) : items;
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(status);
            }}
            onDragLeave={() => setOver((o) => (o === status ? null : o))}
            onDrop={() => drop(status)}
            className={cn(
              "bg-muted/40 flex min-h-[420px] flex-col rounded-xl border border-transparent p-2 transition-colors",
              over === status && "border-brand-ink/40 bg-primary/20 border-dashed",
            )}
          >
            <div className="flex items-center gap-2 px-2 py-2">
              <span className={cn("size-2 rounded-full", STATUS_META[status].dot)} />
              <span className="text-sm font-semibold">{STATUS_META[status].label}</span>
              <span className="text-muted-foreground ml-auto text-xs tabular-nums">{items.length}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {shown.map((t) => {
                const assignee = users.find((u) => u.id === t.assigneeId);
                return (
                  <Link
                    key={t.id}
                    href={`/tickets/${t.id}`}
                    draggable
                    onDragStart={(e) => {
                      setDragId(t.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOver(null);
                    }}
                    className={cn(
                      "bg-card hover:border-brand-ink/40 block cursor-grab space-y-2.5 rounded-lg border p-3 shadow-xs transition-all active:cursor-grabbing",
                      dragId === t.id && "opacity-40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground font-mono text-[11px]">{ticketRef(t.number)}</span>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <div className="line-clamp-2 text-sm leading-snug font-medium">{t.subject}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {companies.find((c) => c.id === t.companyId)?.name}
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t pt-2.5">
                      <SlaBadge ticket={t} />
                      {assignee ? (
                        <UserAvatar name={assignee.name} size="sm" />
                      ) : (
                        <span className="text-muted-foreground text-[11px] italic">Unassigned</span>
                      )}
                    </div>
                  </Link>
                );
              })}
              {items.length === 0 && (
                <div className="text-muted-foreground grid flex-1 place-items-center rounded-lg border border-dashed p-6 text-xs">
                  Drop tickets here
                </div>
              )}
              {items.length > shown.length && (
                <div className="text-muted-foreground px-2 py-1 text-center text-xs">+ {items.length - shown.length} more</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
