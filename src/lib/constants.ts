import type { Channel, Plan, Priority, Role, TicketStatus, UserStatus } from "./types";

/*
 * className: soft badge · dot: small indicator · pill: solid group header (list view)
 * · ring: the clickable status circle on each list row.
 */
export const STATUS_META: Record<
  TicketStatus,
  { label: string; className: string; dot: string; pill: string; ring: string }
> = {
  open: {
    label: "Open",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
    dot: "bg-blue-500",
    pill: "bg-blue-600 text-white",
    ring: "border-blue-500",
  },
  in_progress: {
    label: "In progress",
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
    dot: "bg-violet-500",
    pill: "bg-violet-600 text-white",
    ring: "border-violet-500 bg-[linear-gradient(90deg,var(--color-violet-500)_50%,transparent_50%)]",
  },
  waiting: {
    label: "Waiting on customer",
    className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    dot: "bg-amber-500",
    pill: "bg-amber-400 text-amber-950",
    ring: "border-amber-500",
  },
  resolved: {
    label: "Resolved",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
    pill: "bg-emerald-600 text-white",
    ring: "border-emerald-500 bg-emerald-500",
  },
  closed: {
    label: "Closed",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-300 dark:border-zinc-500/30",
    dot: "bg-zinc-400",
    pill: "bg-zinc-500 text-white",
    ring: "border-zinc-400 bg-zinc-400",
  },
};

export const STATUS_ORDER: TicketStatus[] = ["open", "in_progress", "waiting", "resolved", "closed"];

export const PRIORITY_META: Record<Priority, { label: string; className: string; pill: string; weight: number }> = {
  low: { label: "Low", className: "text-zinc-600 dark:text-zinc-300", pill: "bg-zinc-500 text-white", weight: 0 },
  medium: { label: "Medium", className: "text-sky-700 dark:text-sky-300", pill: "bg-sky-600 text-white", weight: 1 },
  high: { label: "High", className: "text-orange-700 dark:text-orange-300", pill: "bg-orange-600 text-white", weight: 2 },
  urgent: { label: "Urgent", className: "text-red-700 dark:text-red-300", pill: "bg-red-600 text-white", weight: 3 },
};

export const PRIORITY_ORDER: Priority[] = ["urgent", "high", "medium", "low"];

export const CHANNEL_LABEL: Record<Channel, string> = {
  portal: "Client portal",
  email: "Email",
  phone: "Phone",
  chat: "Live chat",
};

export const ROLE_META: Record<Role, { label: string; description: string; className: string }> = {
  admin: {
    label: "Administrator",
    description: "Full access to every client, ticket, user, the CMS and settings.",
    className: "bg-primary/35 text-brand-ink border-brand-ink/20",
  },
  technician: {
    label: "Technician",
    description: "Works the ticket queue, writes knowledge base articles and views clients.",
    className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  },
  client: {
    label: "Client user",
    description: "Raises and tracks their own tickets and reads the knowledge base.",
    className: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-300 dark:border-zinc-500/30",
  },
};

export const USER_STATUS_META: Record<UserStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  invited: {
    label: "Invited",
    className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  suspended: {
    label: "Suspended",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  },
};

export const PLAN_META: Record<Plan, { className: string; price: number }> = {
  Essentials: { className: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-300", price: 35 },
  Business: { className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300", price: 55 },
  Enterprise: { className: "bg-primary/35 text-brand-ink border-brand-ink/20", price: 85 },
};

export const DEFAULT_CATEGORIES = [
  "Hardware",
  "Software",
  "Network & Wi-Fi",
  "Email & Microsoft 365",
  "Security",
  "Accounts & Access",
  "Printing",
  "Phones & VoIP",
  "New starter / Leaver",
  "Other",
];

export const KB_CATEGORIES = [
  "Getting started",
  "Microsoft 365",
  "Security",
  "Network & VPN",
  "Hardware & printing",
  "Accounts & passwords",
];

export const PERMISSIONS: { key: string; label: string; group: string }[] = [
  { key: "tickets.view_all", label: "View tickets for all clients", group: "Tickets" },
  { key: "tickets.assign", label: "Assign and re-assign tickets", group: "Tickets" },
  { key: "tickets.internal_notes", label: "Read and write internal notes", group: "Tickets" },
  { key: "tickets.delete", label: "Delete tickets", group: "Tickets" },
  { key: "users.view", label: "View users and clients", group: "Users" },
  { key: "users.manage", label: "Invite, edit and suspend users", group: "Users" },
  { key: "companies.manage", label: "Manage client companies", group: "Users" },
  { key: "cms.edit", label: "Create and edit content", group: "Content" },
  { key: "cms.publish", label: "Publish content", group: "Content" },
  { key: "reports.view", label: "View reports and dashboards", group: "Administration" },
  { key: "settings.manage", label: "Change branding, SLAs and settings", group: "Administration" },
];

export function homeFor(role: Role) {
  return role === "client" ? "/portal" : "/dashboard";
}
