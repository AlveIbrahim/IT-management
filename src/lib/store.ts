"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createSeed, DEFAULT_SETTINGS, type SeedData } from "./seed";
import { PRIORITY_META, STATUS_META } from "./constants";
import type { Company, ContentItem, Role, Settings, Ticket, User } from "./types";
import { uid } from "./utils";

/*
 * The whole demo runs in the browser. This store stands in for the backend:
 * it's seeded with realistic data and persisted to localStorage, so changes
 * survive a page refresh. "Reset demo data" restores the seed.
 */

type TicketPatch = Partial<Pick<Ticket, "status" | "priority" | "assigneeId" | "category" | "tags" | "subject">>;

export interface NewTicketInput {
  subject: string;
  body: string;
  priority: Ticket["priority"];
  category: string;
  channel: Ticket["channel"];
  requesterId: string;
  assigneeId?: string | null;
}

interface AppState extends SeedData {
  sessionUserId: string | null;

  login: (userId: string) => void;
  logout: () => void;

  createTicket: (input: NewTicketInput) => Ticket;
  updateTicket: (id: string, patch: TicketPatch) => void;
  bulkUpdateTickets: (ids: string[], patch: TicketPatch) => void;
  deleteTickets: (ids: string[]) => void;
  addMessage: (ticketId: string, body: string, internal: boolean) => void;
  rateTicket: (ticketId: string, rating: "positive" | "negative") => void;

  addUser: (input: Omit<User, "id" | "createdAt" | "lastActiveAt">) => User;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;

  addCompany: (input: Omit<Company, "id" | "createdAt">) => Company;
  updateCompany: (id: string, patch: Partial<Company>) => void;

  saveContent: (item: Partial<ContentItem> & Pick<ContentItem, "type" | "title">) => ContentItem;
  deleteContent: (id: string) => void;
  recordView: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  setPermission: (key: string, role: Role, value: boolean) => void;

  markNotificationsRead: () => void;
  resetDemo: () => void;
}

const nowIso = () => new Date().toISOString();

function describeChange(state: AppState, t: Ticket, patch: TicketPatch): string[] {
  const out: string[] = [];
  if (patch.status && patch.status !== t.status) {
    out.push(`changed status from ${STATUS_META[t.status].label} to ${STATUS_META[patch.status].label}`);
  }
  if (patch.priority && patch.priority !== t.priority) {
    out.push(`changed priority from ${PRIORITY_META[t.priority].label} to ${PRIORITY_META[patch.priority].label}`);
  }
  if (patch.assigneeId !== undefined && patch.assigneeId !== t.assigneeId) {
    const who = state.users.find((u) => u.id === patch.assigneeId);
    out.push(who ? `assigned this ticket to ${who.name}` : "unassigned this ticket");
  }
  if (patch.category && patch.category !== t.category) {
    out.push(`changed category to ${patch.category}`);
  }
  return out;
}

function applyPatch(state: AppState, t: Ticket, patch: TicketPatch): Ticket {
  const actor = state.sessionUserId ?? "u_admin";
  const now = nowIso();
  const events = describeChange(state, t, patch).map((text) => ({ id: uid("e"), actorId: actor, text, createdAt: now }));
  const next: Ticket = { ...t, ...patch, updatedAt: now, events: [...t.events, ...events] };
  if (patch.status && ["resolved", "closed"].includes(patch.status) && !t.resolvedAt) next.resolvedAt = now;
  if (patch.status && ["open", "in_progress", "waiting"].includes(patch.status)) next.resolvedAt = null;
  return next;
}

function pickAssignee(state: AppState): string | null {
  const techs = state.users.filter((u) => u.role === "technician" && u.status === "active");
  if (!techs.length) return null;
  const load = (id: string) =>
    state.tickets.filter((t) => t.assigneeId === id && ["open", "in_progress", "waiting"].includes(t.status)).length;
  return techs.sort((a, b) => load(a.id) - load(b.id))[0].id;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      sessionUserId: null,

      login: (userId) =>
        set((s) => ({
          sessionUserId: userId,
          users: s.users.map((u) => (u.id === userId ? { ...u, lastActiveAt: nowIso() } : u)),
        })),
      logout: () => set({ sessionUserId: null }),

      createTicket: (input) => {
        const state = get();
        const requester = state.users.find((u) => u.id === input.requesterId)!;
        const actor = state.sessionUserId ?? requester.id;
        const now = Date.now();
        const sla = state.settings.sla[input.priority];
        const assigneeId =
          input.assigneeId !== undefined ? input.assigneeId : state.settings.autoAssign ? pickAssignee(state) : null;
        const number = state.nextTicketNumber;
        const events: Ticket["events"] = [
          { id: uid("e"), actorId: actor, text: "created this ticket", createdAt: new Date(now).toISOString() },
        ];
        if (assigneeId) {
          const tech = state.users.find((u) => u.id === assigneeId);
          events.push({
            id: uid("e"),
            actorId: actor,
            text: `${state.settings.autoAssign && input.assigneeId === undefined ? "auto-assigned" : "assigned"} this ticket to ${tech?.name}`,
            createdAt: new Date(now + 1000).toISOString(),
          });
        }
        const ticket: Ticket = {
          id: `t_${number}`,
          number,
          subject: input.subject,
          status: "open",
          priority: input.priority,
          category: input.category,
          channel: input.channel,
          requesterId: requester.id,
          companyId: requester.companyId ?? state.companies[0].id,
          assigneeId,
          tags: [],
          createdAt: new Date(now).toISOString(),
          updatedAt: new Date(now).toISOString(),
          dueAt: new Date(now + sla.resolve * 3_600_000).toISOString(),
          firstResponseAt: null,
          resolvedAt: null,
          satisfaction: null,
          messages: [
            { id: uid("m"), authorId: actor, body: input.body, internal: false, createdAt: new Date(now).toISOString() },
          ],
          events,
        };
        const company = state.companies.find((c) => c.id === ticket.companyId);
        set((s) => ({
          tickets: [...s.tickets, ticket],
          nextTicketNumber: number + 1,
          notifications: [
            {
              id: uid("n"),
              text: `New ${PRIORITY_META[ticket.priority].label.toLowerCase()} priority ticket from ${company?.name ?? requester.name}: ${ticket.subject}`,
              href: `/tickets/${ticket.id}`,
              createdAt: ticket.createdAt,
              read: false,
            },
            ...s.notifications,
          ],
        }));
        return ticket;
      },

      updateTicket: (id, patch) =>
        set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? applyPatch(s, t, patch) : t)) })),

      bulkUpdateTickets: (ids, patch) =>
        set((s) => ({ tickets: s.tickets.map((t) => (ids.includes(t.id) ? applyPatch(s, t, patch) : t)) })),

      deleteTickets: (ids) => set((s) => ({ tickets: s.tickets.filter((t) => !ids.includes(t.id)) })),

      addMessage: (ticketId, body, internal) =>
        set((s) => {
          const actorId = s.sessionUserId ?? "u_admin";
          const actor = s.users.find((u) => u.id === actorId);
          const isStaff = actor?.role !== "client";
          const now = nowIso();
          return {
            tickets: s.tickets.map((t) => {
              if (t.id !== ticketId) return t;
              const next: Ticket = {
                ...t,
                updatedAt: now,
                messages: [...t.messages, { id: uid("m"), authorId: actorId, body, internal, createdAt: now }],
              };
              if (isStaff && !internal && !t.firstResponseAt) next.firstResponseAt = now;
              // A customer reply moves a ticket back into the queue.
              if (!isStaff && (t.status === "waiting" || t.status === "resolved")) {
                return applyPatch(s, next, { status: "open" });
              }
              if (isStaff && !internal && t.status === "open") {
                return applyPatch(s, next, { status: "in_progress" });
              }
              return next;
            }),
          };
        }),

      rateTicket: (ticketId, rating) =>
        set((s) => ({ tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, satisfaction: rating } : t)) })),

      addUser: (input) => {
        const user: User = { ...input, id: uid("u"), createdAt: nowIso(), lastActiveAt: null };
        set((s) => ({ users: [...s.users, user] }));
        return user;
      },
      updateUser: (id, patch) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
      deleteUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

      addCompany: (input) => {
        const company: Company = { ...input, id: uid("c"), createdAt: nowIso() };
        set((s) => ({ companies: [...s.companies, company] }));
        return company;
      },
      updateCompany: (id, patch) =>
        set((s) => ({ companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

      saveContent: (item) => {
        const s = get();
        const now = nowIso();
        const existing = item.id ? s.content.find((c) => c.id === item.id) : undefined;
        const id = existing?.id ?? uid(item.type === "page" ? "p" : item.type === "article" ? "kb" : "an");
        const merged: ContentItem = {
          slug: "",
          excerpt: "",
          body: "",
          status: "draft",
          authorId: s.sessionUserId ?? "u_admin",
          publishedAt: null,
          category: null,
          views: 0,
          helpful: 0,
          seoTitle: "",
          seoDescription: "",
          level: null,
          showInNav: false,
          ...existing,
          ...item,
          id,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        if (merged.status === "published" && !merged.publishedAt) merged.publishedAt = now;
        if (merged.status === "draft") merged.publishedAt = null;
        set((st) => ({
          content: existing ? st.content.map((c) => (c.id === merged.id ? merged : c)) : [...st.content, merged],
        }));
        return merged;
      },
      deleteContent: (id) => set((s) => ({ content: s.content.filter((c) => c.id !== id) })),
      recordView: (id) =>
        set((s) => ({ content: s.content.map((c) => (c.id === id ? { ...c, views: c.views + 1 } : c)) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setPermission: (key, role, value) =>
        set((s) => ({ permissions: { ...s.permissions, [key]: { ...s.permissions[key], [role]: value } } })),

      markNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      resetDemo: () => set((s) => ({ ...createSeed(), sessionUserId: s.sessionUserId })),
    }),
    {
      name: "desksupport-demo",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      // v2 switched the default brand from blue to DeskSupport green; move browsers still on the old default.
      migrate: (persisted, version) => {
        const state = persisted as Partial<AppState>;
        if (version < 2 && state.settings?.brandColor === "#1d5fd1") {
          state.settings = { ...state.settings, brandColor: DEFAULT_SETTINGS.brandColor };
        }
        return state as AppState;
      },
    },
  ),
);

const subscribeNoop = () => () => {};

/** True once we're rendering in the browser (and the persisted store has loaded). */
export function useMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function useCurrentUser() {
  return useAppStore((s) => s.users.find((u) => u.id === s.sessionUserId) ?? null);
}

export function useCan(permission: string) {
  return useAppStore((s) => {
    const user = s.users.find((u) => u.id === s.sessionUserId);
    if (!user) return false;
    return s.permissions[permission]?.[user.role] ?? false;
  });
}
