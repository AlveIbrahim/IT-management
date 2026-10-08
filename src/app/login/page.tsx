"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, Ticket, Users } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { UserAvatar } from "@/components/user-avatar";
import { DEMO_ACCOUNTS } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_META, homeFor } from "@/lib/constants";
import { useAppStore, useCurrentUser, useMounted } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const mounted = useMounted();
  const current = useCurrentUser();
  const users = useAppStore((s) => s.users);
  const settings = useAppStore((s) => s.settings);
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState("sarah.mitchell@desksupport.co.uk");
  const [password, setPassword] = useState("demo1234");

  useEffect(() => {
    if (mounted && current) router.replace(homeFor(current.role));
  }, [mounted, current, router]);

  const signIn = (userId: string) => {
    const u = users.find((x) => x.id === userId)!;
    login(u.id);
    toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
    router.push(homeFor(u.role));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) {
      toast.error("We couldn't find that account", { description: "Try one of the demo accounts below." });
      return;
    }
    if (u.status === "suspended") {
      toast.error("This account has been suspended");
      return;
    }
    signIn(u.id);
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <div className="bg-sidebar relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 10%, color-mix(in oklch, var(--brand) 55%, transparent), transparent 70%), radial-gradient(50% 40% at 90% 90%, color-mix(in oklch, var(--brand) 35%, transparent), transparent 70%)",
          }}
        />
        <div className="relative">
          <Logo inverted suffix="Service hub" />
        </div>
        <div className="relative mt-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl leading-tight font-semibold tracking-tight">
              One place for your service desk, clients and content.
            </h1>
            <p className="text-lg text-white/70">{settings.tagline}.</p>
          </div>
          <ul className="space-y-4">
            {[
              { icon: Ticket, text: "Ticketing with SLAs, internal notes and a client portal" },
              { icon: Users, text: "Users, client companies, roles and permissions" },
              { icon: ShieldCheck, text: "CMS for your website, help articles and service alerts" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/85">
                <span className="grid size-9 place-items-center rounded-lg bg-white/10">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-16 text-sm text-white/50">
          © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Logo suffix="Service hub" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-muted-foreground text-sm">Use your work email to access the service hub.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 pl-9" />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-primary text-xs font-medium hover:underline"
                  onClick={() => toast.info("Password reset email sent", { description: "Demo only – no email is sent." })}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="h-10 w-full">
              Sign in
              <ArrowRight />
            </Button>
          </form>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Demo accounts</span>
              <div className="bg-border h-px flex-1" />
            </div>
            <div className="grid gap-2">
              {mounted &&
                DEMO_ACCOUNTS.map((a) => {
                  const u = users.find((x) => x.id === a.id);
                  if (!u) return null;
                  return (
                    <button
                      key={a.id}
                      onClick={() => signIn(u.id)}
                      className="hover:border-primary/50 hover:bg-accent/50 group flex items-center gap-3 rounded-lg border p-3 text-left transition-colors"
                    >
                      <UserAvatar name={u.name} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{u.name}</span>
                          <span className="text-muted-foreground text-xs">· {ROLE_META[u.role].label}</span>
                        </div>
                        <p className="text-muted-foreground truncate text-xs">{a.hint}</p>
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-primary size-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
            </div>
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="size-3.5" />
              Demo mode: everything is stored in your browser. No real data is sent anywhere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
