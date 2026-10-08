"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Headset, Mail, Phone, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore, useMounted } from "@/lib/store";
import { cn } from "@/lib/utils";

/** The public marketing website, rendered from pages managed in the CMS. */
export function PublicSite({ slug }: { slug: string }) {
  const mounted = useMounted();
  const content = useAppStore((s) => s.content);
  const settings = useAppStore((s) => s.settings);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const pages = content.filter((c) => c.type === "page" && c.status === "published");
  const nav = pages.filter((p) => p.showInNav && p.slug !== "home");
  const page = pages.find((p) => p.slug === slug);
  const isHome = slug === "home";
  const services = nav.filter((p) => !["about", "contact"].includes(p.slug));

  return (
    <div className="bg-background min-h-svh">
      <header className="bg-background/90 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/site">
            <Logo />
          </Link>
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {nav.map((p) => (
              <Link
                key={p.id}
                href={`/site/${p.slug}`}
                className={cn(
                  "text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  p.slug === slug && "text-foreground",
                )}
              >
                {p.title}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}>
                <Phone />
                {settings.supportPhone}
              </a>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">Client login</Link>
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t px-4 py-2 md:hidden">
          {nav.map((p) => (
            <Link key={p.id} href={`/site/${p.slug}`} className="text-muted-foreground shrink-0 rounded-md px-2 py-1 text-sm">
              {p.title}
            </Link>
          ))}
        </nav>
      </header>

      {isHome && (
        <section className="bg-sidebar relative overflow-hidden text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(50% 70% at 15% 0%, color-mix(in oklch, var(--brand) 65%, transparent), transparent 70%), radial-gradient(40% 60% at 100% 100%, color-mix(in oklch, var(--brand) 40%, transparent), transparent 70%)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-28">
            <div className="space-y-6">
              <p className="text-sm font-medium tracking-wide text-white/60 uppercase">{settings.brandName}</p>
              <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">{settings.tagline}</h1>
              <p className="max-w-xl text-lg text-white/70">{page?.excerpt}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/site/contact">
                    Get a free IT review
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/login">Existing client? Log in</Link>
                </Button>
              </div>
            </div>
            <div className="grid content-center gap-3">
              {[
                { icon: Clock, title: "30-minute response", text: "on urgent issues, every time" },
                { icon: ShieldCheck, title: "Security first", text: "MFA, EDR and backups as standard" },
                { icon: Headset, title: "UK-based service desk", text: settings.businessHours },
              ].map((f) => (
                <div key={f.title} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <span className="grid size-10 place-items-center rounded-lg bg-white/10">
                    <f.icon className="size-5" />
                  </span>
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-sm text-white/60">{f.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!isHome && page && (
        <section className="bg-muted/40 border-b">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <p className="text-brand-ink text-sm font-medium">{settings.brandName}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">{page.title}</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-lg">{page.excerpt}</p>
          </div>
        </section>
      )}

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {page ? (
          <div
            className={cn("prose-content mx-auto max-w-3xl", isHome && "[&>h1:first-child]:hidden [&>h1:first-child+p]:hidden")}
            dangerouslySetInnerHTML={{ __html: isHome ? page.body : page.body.replace(/^<h1>.*?<\/h1>/, "") }}
          />
        ) : (
          <div className="py-20 text-center">
            <h1 className="text-2xl font-semibold">Page not found</h1>
            <p className="text-muted-foreground mt-2">This page doesn&apos;t exist or hasn&apos;t been published yet.</p>
            <Button asChild className="mt-6">
              <Link href="/site">Go to the homepage</Link>
            </Button>
          </div>
        )}

        {isHome && services.length > 0 && (
          <div className="mt-16 space-y-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight">What we do</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {services.map((s) => (
                <Link key={s.id} href={`/site/${s.slug}`} className="bg-card hover:border-brand-ink/40 group space-y-3 rounded-xl border p-6 transition-colors">
                  <CheckCircle2 className="text-brand-ink size-6" />
                  <div className="text-lg font-semibold">{s.title}</div>
                  <p className="text-muted-foreground text-sm">{s.excerpt}</p>
                  <span className="text-brand-ink inline-flex items-center gap-1 text-sm font-medium">
                    Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <section className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Ready for IT that just works?</h2>
            <p className="text-muted-foreground mt-1">Talk to our team – no hard sell, just honest advice.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <a href={`mailto:${settings.supportEmail}`}>
                <Mail />
                {settings.supportEmail}
              </a>
            </Button>
            <Button asChild>
              <Link href="/site/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo inverted />
          <p className="text-white/50">
            © {new Date().getFullYear()} {settings.brandName}. Content managed in the {settings.brandName} CMS.
          </p>
        </div>
      </footer>
    </div>
  );
}
