"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { timeAgo } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function NotificationsMenu() {
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationsRead);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell />
          {unread > 0 && (
            <span className="bg-destructive absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-semibold">Notifications</div>
          {unread > 0 && (
            <button onClick={markRead} className="text-brand-ink text-xs font-medium hover:underline">
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.slice(0, 8).map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className={cn("hover:bg-muted/60 flex gap-3 border-b px-4 py-3 last:border-0", !n.read && "bg-primary/15")}
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} />
              <div className="min-w-0">
                <p className="text-sm leading-snug">{n.text}</p>
                <p className="text-muted-foreground mt-1 text-xs">{timeAgo(n.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
