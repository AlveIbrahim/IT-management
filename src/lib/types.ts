export type Role = "admin" | "technician" | "client";
export type UserStatus = "active" | "invited" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string | null;
  jobTitle: string;
  phone: string;
  status: UserStatus;
  mfa: boolean;
  createdAt: string;
  lastActiveAt: string | null;
}

export type Plan = "Essentials" | "Business" | "Enterprise";
export type CompanyStatus = "active" | "onboarding" | "paused";

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  city: string;
  plan: Plan;
  status: CompanyStatus;
  seats: number;
  devices: number;
  accountManagerId: string;
  createdAt: string;
}

export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Channel = "portal" | "email" | "phone" | "chat";

export interface TicketMessage {
  id: string;
  authorId: string;
  body: string;
  internal: boolean;
  createdAt: string;
}

export interface TicketEvent {
  id: string;
  actorId: string;
  text: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  number: number;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  category: string;
  channel: Channel;
  requesterId: string;
  companyId: string;
  assigneeId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  satisfaction: "positive" | "negative" | null;
  messages: TicketMessage[];
  events: TicketEvent[];
}

export type ContentType = "page" | "article" | "announcement";
export type ContentStatus = "draft" | "published" | "scheduled";
export type AnnouncementLevel = "info" | "maintenance" | "incident";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: ContentStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  category: string | null;
  views: number;
  helpful: number;
  seoTitle: string;
  seoDescription: string;
  level: AnnouncementLevel | null;
  showInNav: boolean;
}

export interface SlaTarget {
  response: number;
  resolve: number;
}

export interface Settings {
  brandName: string;
  brandColor: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  portalWelcome: string;
  sla: Record<Priority, SlaTarget>;
  categories: string[];
  autoAssign: boolean;
  csatEnabled: boolean;
  clientCanCloseTickets: boolean;
}

export interface Notification {
  id: string;
  text: string;
  href: string;
  createdAt: string;
  read: boolean;
}

export type PermissionMatrix = Record<string, Record<Role, boolean>>;
