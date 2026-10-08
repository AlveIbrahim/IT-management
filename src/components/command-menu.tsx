"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BookOpen, Building2, FileText, LayoutDashboard, Plus, Settings, Ticket, User, Users } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { StatusBadge } from "@/components/ticket-badges";
import { ticketRef } from "@/lib/format";
import { useAppStore, useCurrentUser } from "@/lib/store";

export function CommandMenu({
  open,
  onOpenChange,
  onNewTicket,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewTicket: () => void;
}) {
  const router = useRouter();
  const user = useCurrentUser();
  const tickets = useAppStore((s) => s.tickets);
  const companies = useAppStore((s) => s.companies);
  const users = useAppStore((s) => s.users);
  const content = useAppStore((s) => s.content);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!user) return null;
  const isClient = user.role === "client";

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const visibleTickets = (isClient ? tickets.filter((t) => t.requesterId === user.id) : tickets)
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 40);
  const articles = content.filter((c) => c.type === "article" && (c.status === "published" || !isClient));

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search" description="Search everything">
      <CommandInput placeholder="Type to search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onNewTicket();
            }}
          >
            <Plus />
            {isClient ? "Raise a new ticket" : "Create ticket"}
          </CommandItem>
          {!isClient && (
            <>
              <CommandItem onSelect={() => go("/dashboard")}>
                <LayoutDashboard />
                Go to dashboard
              </CommandItem>
              <CommandItem onSelect={() => go("/users")}>
                <Users />
                Manage users
              </CommandItem>
              <CommandItem onSelect={() => go("/cms")}>
                <FileText />
                Open the CMS
              </CommandItem>
              <CommandItem onSelect={() => go("/settings")}>
                <Settings />
                Settings
              </CommandItem>
            </>
          )}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tickets">
          {visibleTickets.map((t) => (
            <CommandItem key={t.id} value={`${ticketRef(t.number)} ${t.subject}`} onSelect={() => go(`/tickets/${t.id}`)}>
              <Ticket />
              <span className="text-muted-foreground font-mono text-xs">{ticketRef(t.number)}</span>
              <span className="flex-1 truncate">{t.subject}</span>
              <StatusBadge status={t.status} className="hidden sm:inline-flex" />
            </CommandItem>
          ))}
        </CommandGroup>
        {!isClient && (
          <>
            <CommandGroup heading="Clients">
              {companies.map((c) => (
                <CommandItem key={c.id} value={`company ${c.name}`} onSelect={() => go(`/companies/${c.id}`)}>
                  <Building2 />
                  {c.name}
                  <span className="text-muted-foreground ml-auto text-xs">{c.city}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="People">
              {users.map((u) => (
                <CommandItem key={u.id} value={`user ${u.name} ${u.email}`} onSelect={() => go(`/users?user=${u.id}`)}>
                  <User />
                  {u.name}
                  <span className="text-muted-foreground ml-auto truncate text-xs">{u.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        <CommandGroup heading="Help articles">
          {articles.map((a) => (
            <CommandItem key={a.id} value={`article ${a.title}`} onSelect={() => go(`/knowledge-base/${a.slug}`)}>
              <BookOpen />
              {a.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
