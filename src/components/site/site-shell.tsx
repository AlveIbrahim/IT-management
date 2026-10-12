"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowRight, ChevronDown, Clock, Mail, Menu, Phone } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { Container, PageIcon, SiteLink, pageHref, useSiteData } from "./site-kit";

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function useScrolled() {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 12,
    () => false,
  );
}

const navLink =
  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 after:absolute after:inset-x-4 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-ink after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100";

function SiteHeader({ current }: { current: string }) {
  const scrolled = useScrolled();
  const { services, company, settings } = useSiteData();
  const [menuOpen, setMenuOpen] = useState(false);
  const onService = services.some((s) => s.slug === current);
  const tel = `tel:${settings.supportPhone.replace(/\s/g, "")}`;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "bg-background/80 border-border shadow-[0_10px_30px_-18px_rgb(0_0_0/0.25)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-[72px] items-center gap-6">
        <Link href="/site" aria-label={`${settings.brandName} home`} className="rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <Logo />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center lg:flex">
          {services.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  navLink,
                  "group inline-flex items-center gap-1 data-[state=open]:text-foreground",
                  onService ? "text-foreground after:scale-x-100" : "text-muted-foreground",
                )}
              >
                Services
                <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={14} className="w-[min(440px,calc(100vw-2rem))] rounded-2xl p-2 shadow-xl">
                {services.map((s) => (
                    <DropdownMenuItem key={s.id} asChild className="cursor-pointer items-start gap-3.5 rounded-xl p-3">
                      <Link href={pageHref(s)}>
                        <span className="bg-primary/35 grid size-10 shrink-0 place-items-center rounded-lg">
                          <PageIcon slug={s.slug} className="text-brand-ink size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="text-foreground block text-sm font-semibold">{s.title}</span>
                          <span className="text-muted-foreground mt-0.5 block text-[13px] leading-snug whitespace-normal">{s.excerpt}</span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                ))}
                <div className="bg-muted/70 mt-1 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-[13px]">
                  <span className="text-muted-foreground">Not sure what you need?</span>
                  <Link href="/site/contact" className="text-brand-ink inline-flex items-center gap-1 font-semibold hover:underline">
                    Book a free IT review
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {company.map((p) => (
            <Link
              key={p.id}
              href={pageHref(p)}
              aria-current={p.slug === current ? "page" : undefined}
              className={cn(navLink, p.slug === current ? "text-foreground after:scale-x-100" : "text-muted-foreground")}
            >
              {p.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <a
            href={tel}
            className="text-muted-foreground hover:text-foreground mr-2 hidden items-center gap-2 text-sm font-medium transition-colors xl:inline-flex"
          >
            <Phone className="size-4" />
            {settings.supportPhone}
          </a>
          <SiteLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Client login
          </SiteLink>
          <SiteLink href="/site/contact" size="sm" className="hidden sm:inline-flex">
            Free IT review
            <ArrowRight />
          </SiteLink>
          <Button variant="ghost" size="icon" className="rounded-full lg:hidden" onClick={() => setMenuOpen(true)}>
            <Menu />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </Container>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-[72px] items-center border-b px-6">
            <Logo />
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-6">
            <p className="text-muted-foreground px-2 pb-2 text-xs font-semibold tracking-[0.08em] uppercase">Services</p>
            {services.map((s) => (
                <Link
                  key={s.id}
                  href={pageHref(s)}
                  onClick={() => setMenuOpen(false)}
                  className="hover:bg-muted flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors"
                >
                  <span className="bg-primary/35 grid size-9 place-items-center rounded-lg">
                    <PageIcon slug={s.slug} className="text-brand-ink size-[18px]" />
                  </span>
                  <span className="font-medium">{s.title}</span>
                </Link>
            ))}
            <div className="my-4 border-t" />
            {company.map((p) => (
              <Link
                key={p.id}
                href={pageHref(p)}
                onClick={() => setMenuOpen(false)}
                className="hover:bg-muted block rounded-xl px-2 py-2.5 font-medium transition-colors"
              >
                {p.title}
              </Link>
            ))}
          </nav>
          <div className="space-y-3 border-t p-6">
            <a href={tel} className="text-muted-foreground flex items-center gap-2 text-sm">
              <Phone className="size-4" />
              {settings.supportPhone}
            </a>
            <div className="grid grid-cols-2 gap-2">
              <SiteLink href="/login" variant="outline" size="md">
                Client login
              </SiteLink>
              <SiteLink href="/site/contact" size="md" onClick={() => setMenuOpen(false)}>
                IT review
              </SiteLink>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function SiteFooter() {
  const { services, company, settings } = useSiteData();
  const tel = `tel:${settings.supportPhone.replace(/\s/g, "")}`;
  const linkClass = "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <footer className="border-t">
      <Container className="grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="space-y-6 md:col-span-5">
          <Logo />
          <p className="text-muted-foreground max-w-sm text-[15px] leading-relaxed">
            {settings.tagline}. Helpdesk, devices, cloud and cyber security, all looked after by one team.
          </p>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={tel} className={cn(linkClass, "inline-flex items-center gap-2.5")}>
                <Phone className="size-4" />
                {settings.supportPhone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.supportEmail}`} className={cn(linkClass, "inline-flex items-center gap-2.5")}>
                <Mail className="size-4" />
                {settings.supportEmail}
              </a>
            </li>
            <li className="text-muted-foreground inline-flex items-center gap-2.5">
              <Clock className="size-4" />
              {settings.businessHours}
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <h3 className="text-sm font-semibold">Services</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={pageHref(s)} className={linkClass}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {company.map((p) => (
              <li key={p.id}>
                <Link href={pageHref(p)} className={linkClass}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold">Clients</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/login" className={linkClass}>
                Client portal
              </Link>
            </li>
            <li>
              <Link href="/login" className={linkClass}>
                Raise a ticket
              </Link>
            </li>
            <li>
              <a href={tel} className={linkClass}>
                Call the service desk
              </a>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t">
        <Container className="text-muted-foreground flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
          </p>
          <p>Website content managed in the {settings.brandName} Hub CMS.</p>
        </Container>
      </div>
    </footer>
  );
}

export function SiteShell({ current, children }: { current: string; children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-[60] rounded-full px-4 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader current={current} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
