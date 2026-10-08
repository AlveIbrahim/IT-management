"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Monitor, Moon, RotateCcw, Sun, UserCog } from "lucide-react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_META, homeFor } from "@/lib/constants";
import { useAppStore, useCurrentUser } from "@/lib/store";

export const DEMO_ACCOUNTS = [
  { id: "u_admin", hint: "Sees everything: tickets, clients, users, CMS and settings" },
  { id: "u_james", hint: "Works the ticket queue and writes help articles" },
  { id: "u_oliverbennett", hint: "Client view: raise and track tickets, read help articles" },
];

export function UserMenu() {
  const user = useCurrentUser();
  const users = useAppStore((s) => s.users);
  const login = useAppStore((s) => s.login);
  const logout = useAppStore((s) => s.logout);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2">
          <UserAvatar name={user.name} size="sm" className="size-7" />
          <span className="hidden max-w-32 truncate text-sm font-medium md:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-muted-foreground truncate text-xs">{user.email}</div>
          <div className="text-muted-foreground mt-1 text-xs">{ROLE_META[user.role].label}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserCog />
              Switch demo user
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-60">
              {DEMO_ACCOUNTS.map((a) => {
                const u = users.find((x) => x.id === a.id);
                if (!u) return null;
                return (
                  <DropdownMenuItem
                    key={a.id}
                    onSelect={() => {
                      login(u.id);
                      router.push(homeFor(u.role));
                      toast.success(`Now viewing as ${u.name}`, { description: ROLE_META[u.role].label });
                    }}
                  >
                    <UserAvatar name={u.name} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-sm">{u.name}</div>
                      <div className="text-muted-foreground text-xs">{ROLE_META[u.role].label}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">
                  <Sun /> Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon /> Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Monitor /> System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            onSelect={() => {
              resetDemo();
              toast.success("Demo data reset", { description: "Everything is back to the original sample data." });
            }}
          >
            <RotateCcw />
            Reset demo data
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
