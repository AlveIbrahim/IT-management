"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  ExternalLink,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Newspaper,
  Plus,
  Search,
  Settings,
  Ticket,
  Users,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { CommandMenu } from "@/components/command-menu";
import { NewTicketDialog } from "@/components/new-ticket-dialog";
import { NotificationsMenu } from "@/components/notifications-menu";
import { UserMenu } from "@/components/user-menu";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore, useCan, useCurrentUser, useMounted } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  badge?: "open-tickets" | "my-open-tickets";
  external?: boolean;
}

const staffNav: { heading: string; items: NavItem[] }[] = [
  { heading: "Overview", items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    heading: "Service desk",
    items: [
      { href: "/tickets", label: "Tickets", icon: Ticket, badge: "open-tickets" },
      { href: "/knowledge-base", label: "Knowledge base", icon: BookOpen },
    ],
  },
  {
    heading: "Customers",
    items: [
      { href: "/companies", label: "Clients", icon: Building2, permission: "users.view" },
      { href: "/users", label: "Users & roles", icon: Users, permission: "users.view" },
    ],
  },
  {
    heading: "Content",
    items: [
      { href: "/cms", label: "Content (CMS)", icon: Newspaper, permission: "cms.edit" },
      { href: "/site", label: "View website", icon: ExternalLink, external: true },
    ],
  },
  { heading: "Admin", items: [{ href: "/settings", label: "Settings", icon: Settings, permission: "settings.manage" }] },
];

const clientNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Support",
    items: [
      { href: "/portal", label: "Home", icon: Home },
      { href: "/tickets", label: "My tickets", icon: Ticket, badge: "my-open-tickets" },
      { href: "/knowledge-base", label: "Help articles", icon: BookOpen },
    ],
  },
];

const CLIENT_ROUTES = ["/portal", "/tickets", "/knowledge-base"];

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const allowed = useCan(item.permission ?? "__none__");
  const user = useCurrentUser();
  const openCount = useAppStore((s) => {
    if (item.badge === "open-tickets")
      return s.tickets.filter((t) => ["open", "in_progress", "waiting"].includes(t.status)).length;
    if (item.badge === "my-open-tickets" && user)
      return s.tickets.filter(
        (t) => t.companyId === user.companyId && t.requesterId === user.id && !["resolved", "closed"].includes(t.status),
      ).length;
    return 0;
  });
  if (item.permission && !allowed) return null;
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className={cn("size-4 shrink-0", active ? "text-sidebar-primary-foreground" : "opacity-70")} />
      <span className="flex-1 truncate">{item.label}</span>
      {openCount > 0 && (
        <span
          className={cn(
            "rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums",
            active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-accent text-sidebar-foreground",
          )}
        >
          {openCount}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const groups = role === "client" ? clientNav : staffNav;
  const phone = useAppStore((s) => s.settings.supportPhone);
  const hours = useAppStore((s) => s.settings.businessHours);
  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo inverted suffix={role === "client" ? "Client portal" : "Service hub"} />
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.heading} className="space-y-1">
            <div className="text-sidebar-foreground/45 px-3 pb-1 text-[11px] font-semibold tracking-wider uppercase">
              {g.heading}
            </div>
            {g.items.map((item) => (
              <NavLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>
      <div className="border-sidebar-border m-3 rounded-lg border p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <LifeBuoy className="size-4" />
          {role === "client" ? "Need us urgently?" : "Service desk line"}
        </div>
        <p className="text-sidebar-foreground/60 mt-1 text-xs">
          {phone} · {hours}
        </p>
      </div>
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-svh">
      <div className="bg-sidebar hidden w-64 lg:block" />
      <div className="flex-1 space-y-6 p-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newTicketOpen, setNewTicketOpen] = useState(false);

  const blocked = !!user && user.role === "client" && !CLIENT_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (!mounted) return;
    if (!user) router.replace("/login");
    else if (blocked) router.replace("/portal");
  }, [mounted, user, blocked, router]);

  if (!mounted || !user || blocked) return <ShellSkeleton />;

  return (
    <div className="flex min-h-svh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent role={user.role} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent role={user.role} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="bg-background/85 sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu />
            <span className="sr-only">Open navigation</span>
          </Button>
          <button
            onClick={() => setSearchOpen(true)}
            className="text-muted-foreground hover:bg-muted/60 bg-muted/40 flex h-9 w-full max-w-md min-w-0 items-center gap-2 rounded-md border px-3 text-sm transition-colors"
          >
            <Search className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">
              {user.role === "client" ? "Search help articles and tickets…" : "Search tickets, clients, users, articles…"}
            </span>
            <kbd className="bg-background hidden rounded border px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <Button size="sm" onClick={() => setNewTicketOpen(true)} className="hidden sm:inline-flex">
              <Plus />
              {user.role === "client" ? "Get help" : "New ticket"}
            </Button>
            <Button size="icon" onClick={() => setNewTicketOpen(true)} className="sm:hidden">
              <Plus />
              <span className="sr-only">New ticket</span>
            </Button>
            {user.role !== "client" && <NotificationsMenu />}
            <UserMenu />
          </div>
        </header>

        {user.role === "client" && <AnnouncementBanner />}

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} onNewTicket={() => setNewTicketOpen(true)} />
      <NewTicketDialog open={newTicketOpen} onOpenChange={setNewTicketOpen} />
    </div>
  );
}
