import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";

import type { Ticket } from "./types";

export const ticketRef = (n: number) => `DS-${n}`;

export function timeAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
}

export function formatDate(iso: string | null | undefined, pattern = "d MMM yyyy") {
  if (!iso) return "—";
  return format(new Date(iso), pattern);
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return `Today, ${format(d, "HH:mm")}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, "HH:mm")}`;
  return format(d, "d MMM, HH:mm");
}

function humanDuration(ms: number) {
  const mins = Math.round(Math.abs(ms) / 60_000);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ${mins % 60 ? `${mins % 60}m` : ""}`.trim();
  return `${Math.round(hours / 24)}d`;
}

export type SlaTone = "ok" | "at_risk" | "breached" | "met" | "missed" | "paused";

export function slaInfo(t: Ticket, now = Date.now()): { tone: SlaTone; label: string } {
  const due = new Date(t.dueAt).getTime();
  if (t.resolvedAt) {
    const resolved = new Date(t.resolvedAt).getTime();
    return resolved <= due ? { tone: "met", label: "SLA met" } : { tone: "missed", label: "SLA missed" };
  }
  // The SLA clock pauses while we're waiting on the customer.
  if (t.status === "waiting") return { tone: "paused", label: "SLA paused" };
  const left = due - now;
  if (left < 0) return { tone: "breached", label: `Overdue ${humanDuration(left)}` };
  const window = due - new Date(t.createdAt).getTime();
  if (left < Math.min(2 * 3_600_000, window * 0.25)) return { tone: "at_risk", label: `Due in ${humanDuration(left)}` };
  return { tone: "ok", label: `Due in ${humanDuration(left)}` };
}

export function hoursBetween(a: string, b: string) {
  return (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000;
}

export function formatHours(h: number) {
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 48) return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}
