import { AlertTriangle, ArrowDown, ArrowUp, ChevronsUp, CircleCheck, CirclePause, CircleX, Clock, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PRIORITY_META, STATUS_META } from "@/lib/constants";
import { slaInfo } from "@/lib/format";
import type { Priority, Ticket, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", meta.className, className)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}

const priorityIcon: Record<Priority, typeof ArrowUp> = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  urgent: ChevronsUp,
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_META[priority];
  const Icon = priorityIcon[priority];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", meta.className, className)}>
      <Icon className="size-3.5" />
      {meta.label}
    </span>
  );
}

export function SlaBadge({ ticket, className }: { ticket: Ticket; className?: string }) {
  const sla = slaInfo(ticket);
  const styles = {
    ok: "text-muted-foreground",
    at_risk: "text-amber-700 dark:text-amber-300",
    breached: "text-red-700 dark:text-red-300",
    met: "text-emerald-700 dark:text-emerald-300",
    missed: "text-red-700 dark:text-red-300",
    paused: "text-muted-foreground",
  }[sla.tone];
  const Icon = { ok: Clock, at_risk: Clock, breached: AlertTriangle, met: CircleCheck, missed: CircleX, paused: CirclePause }[sla.tone];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap", styles, className)}>
      <Icon className="size-3.5" />
      {sla.label}
    </span>
  );
}
