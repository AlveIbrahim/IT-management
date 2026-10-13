"use client";

import Link from "next/link";
import { createElement, useState, useSyncExternalStore } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, Cloud, Headset, Layers, Menu, MonitorSmartphone, Phone, ShieldCheck, X } from "lucide-react";
import type { LucideProps } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { Container, SiteLink, pageHref, telHref, useSiteData } from "./site-kit";

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function useScrolled() {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 8,
    () => false,
  );
}

const SERVICE_ICONS: [RegExp, typeof Cloud][] = [
  [/secur|cyber/i, ShieldCheck],
  [/cloud|microsoft|365/i, Cloud],
  [/support|managed|helpdesk/i, MonitorSmartphone],
];

/** Icon for a service page, matched on words in its slug or title. */
export function ServiceIcon({ name, ...props }: LucideProps & { name: string }) {
  return createElement(SERVICE_ICONS.find(([re]) => re.test(name))?.[1] ?? Layers, props);
}

export function SiteLogo({ dark = false }: { dark?: boolean }) {
  const { settings } = useSiteData();
  return (
    <span className="flex items-center gap-2.5">
      <span className="bg-site-gradient grid size-9 place-items-center rounded-[11px] text-white shadow-[0_6px_16px_-6px_rgb(123_92_255/0.7)]">
        <Headset className="size-[19px]" />
      </span>
      <span className={cn("text-[19px] font-semibold tracking-[-0.03em]", dark ? "text-white" : "text-site-ink")}>{settings.brandName}</span>
    </span>
  );
}

const navLink =
  "relative inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-[15px] font-medium text-site-text transition-colors outline-none hover:bg-site-soft hover:text-site-ink focus-visible:ring-[3px] focus-visible:ring-site-blue/30 data-[current=true]:text-site-ink data-[state=open]:bg-site-soft data-[state=open]:text-site-ink";

function SiteHeader({ current }: { current: string }) {
  const scrolled = useScrolled();
  const { services, company, settings } = useSiteData();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = company.filter((p) => p.slug !== "contact");
  const contact = company.find((p) => p.slug === "contact");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled ? "border-site-line/80 border-b bg-white/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-[76px] items-center gap-3">
        <Link href="/site" aria-label={`${settings.brandName} home`} className="shrink-0 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-site-blue/30">
          <SiteLogo />
        </Link>

        <nav aria-label="Main" className="ml-8 hidden items-center gap-0.5 lg:flex">
          {services.length > 0 && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className={cn(navLink, "group")} data-current={services.some((s) => s.slug === current)}>
                Services
                <ChevronDown className="size-4 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={12}
                className="border-site-line grid w-[min(720px,calc(100vw-2rem))] grid-cols-[1.35fr_1fr] gap-2 rounded-[22px] p-2.5 font-sans shadow-[0_40px_80px_-30px_rgb(10_17_40/0.35)]"
              >
                <div className="p-1">
                  <p className="text-site-muted px-3 pt-2 pb-2 font-mono text-[11px] tracking-[0.14em] uppercase">Services</p>
                  {services.map((s) => (
                    <DropdownMenuItem key={s.id} asChild className="cursor-pointer items-start gap-3.5 rounded-2xl p-3 focus:bg-site-soft">
                      <Link href={pageHref(s)}>
                        <span className="bg-site-tint text-site-blue grid size-10 shrink-0 place-items-center rounded-xl">
                          <ServiceIcon name={`${s.slug} ${s.title}`} className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="text-site-ink block text-[15px] font-semibold">{s.title}</span>
                          <span className="text-site-muted mt-0.5 block text-[13px] leading-snug whitespace-normal">{s.excerpt}</span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuItem asChild className="cursor-pointer p-0 focus:bg-transparent">
                  <Link
                    href="/login"
                    className="bg-site-night group/feature relative flex flex-col justify-end overflow-hidden rounded-2xl p-5 text-white"
                  >
                    <span aria-hidden className="site-drift absolute -top-16 -right-10 size-56 rounded-full bg-[radial-gradient(closest-side,rgb(123_92_255/0.55),transparent)]" />
                    <span aria-hidden className="absolute -bottom-20 -left-10 size-56 rounded-full bg-[radial-gradient(closest-side,rgb(255_106_61/0.4),transparent)]" />
                    <span className="relative font-mono text-[11px] tracking-[0.14em] text-white/60 uppercase">Client portal</span>
                    <span className="relative mt-2 text-lg leading-snug font-semibold">Every ticket, in plain sight.</span>
                    <span className="relative mt-1 text-[13px] leading-snug text-white/65">Raise, track and approve requests in one place.</span>
                    <span className="relative mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium">
                      Open the portal
                      <ArrowRight className="size-3.5 transition-transform group-hover/feature:translate-x-0.5" />
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {links.map((p) => (
            <Link key={p.id} href={pageHref(p)} className={navLink} data-current={p.slug === current} aria-current={p.slug === current ? "page" : undefined}>
              {p.title}
            </Link>
          ))}
          {contact && (
            <Link href={pageHref(contact)} className={navLink} data-current={current === "contact"} aria-current={current === "contact" ? "page" : undefined}>
              {contact.title}
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a href={telHref(settings.supportPhone)} className="text-site-text hover:text-site-ink mr-2 hidden items-center gap-2 text-[14px] font-medium xl:inline-flex">
            <Phone className="size-4" />
            {settings.supportPhone}
          </a>
          <SiteLink href="/login" variant="outline" size="sm" className="hidden sm:inline-flex">
            Client login
          </SiteLink>
          <SiteLink href="/site/contact" variant="dark" size="sm" className="hidden sm:inline-flex">
            Book a free review
          </SiteLink>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="text-site-ink hover:bg-site-soft grid size-11 place-items-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-site-blue/30 lg:hidden"
          >
            <Menu className="size-6" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </Container>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" showCloseButton={false} className="w-full gap-0 border-0 bg-white p-0 font-sans sm:max-w-md">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-[76px] items-center justify-between px-5">
            <SiteLogo />
            <SheetClose className="hover:bg-site-soft grid size-11 place-items-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-site-blue/30">
              <X className="size-6" />
              <span className="sr-only">Close menu</span>
            </SheetClose>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 pt-4 pb-10">
            <p className="text-site-muted font-mono text-[11px] tracking-[0.14em] uppercase">Services</p>
            <ul className="mt-2">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={pageHref(s)} onClick={() => setMenuOpen(false)} className="border-site-line flex items-center gap-3 border-b py-4">
                    <span className="bg-site-tint text-site-blue grid size-10 place-items-center rounded-xl">
                      <ServiceIcon name={`${s.slug} ${s.title}`} className="size-5" />
                    </span>
                    <span className="text-site-ink text-lg font-semibold tracking-[-0.02em]">{s.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6">
              {company.map((p) => (
                <li key={p.id}>
                  <Link
                    href={pageHref(p)}
                    onClick={() => setMenuOpen(false)}
                    className="border-site-line text-site-ink flex items-center justify-between border-b py-4 text-lg font-semibold tracking-[-0.02em]"
                  >
                    {p.title}
                    <ArrowUpRight className="text-site-muted size-5" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3">
              <SiteLink href="/site/contact" size="lg" onClick={() => setMenuOpen(false)}>
                Book a free IT review
                <ArrowRight className="arrow" />
              </SiteLink>
              <SiteLink href="/login" variant="outline" size="lg">
                Client login
              </SiteLink>
              <a href={telHref(settings.supportPhone)} className="text-site-text mt-3 text-center">
                Or call {settings.supportPhone}
              </a>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function SiteFooter() {
  const { services, company, settings } = useSiteData();
  const linkClass = "text-white/60 transition-colors hover:text-white";
  return (
    <footer className="bg-site-night relative isolate overflow-hidden text-white">
      <div aria-hidden className="site-grid-lines-dark absolute inset-0 -z-10 opacity-60" />
      <div aria-hidden className="absolute -top-40 left-1/2 -z-10 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(47_91_255/0.22),transparent)]" />
      <Container className="grid grid-cols-2 gap-10 pt-20 pb-12 lg:grid-cols-12">
        <div className="col-span-2 lg:col-span-4">
          <SiteLogo dark />
          <p className="mt-5 max-w-xs leading-relaxed text-white/60">{settings.tagline}. Helpdesk, devices, cloud and cyber security from one accountable team.</p>
          <a href={telHref(settings.supportPhone)} className="mt-6 inline-flex items-center gap-2 text-lg font-semibold tracking-[-0.01em]">
            <Phone className="text-site-ember size-4" />
            {settings.supportPhone}
          </a>
        </div>
        <div className="lg:col-span-3">
          <h2 className="font-mono text-[11px] tracking-[0.14em] text-white/45 uppercase">Services</h2>
          <ul className="mt-5 space-y-3 text-[15px]">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={pageHref(s)} className={linkClass}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h2 className="font-mono text-[11px] tracking-[0.14em] text-white/45 uppercase">Company</h2>
          <ul className="mt-5 space-y-3 text-[15px]">
            {company.map((p) => (
              <li key={p.id}>
                <Link href={pageHref(p)} className={linkClass}>
                  {p.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login" className={linkClass}>
                Client portal
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-2 lg:col-span-3">
          <h2 className="font-mono text-[11px] tracking-[0.14em] text-white/45 uppercase">Get in touch</h2>
          <ul className="mt-5 space-y-3 text-[15px]">
            <li>
              <a href={`mailto:${settings.supportEmail}`} className={linkClass}>
                {settings.supportEmail}
              </a>
            </li>
            <li className="text-white/60">{settings.businessHours}</li>
            <li className="text-white/60">Service desk based in the UK</li>
          </ul>
        </div>
      </Container>
      <Container>
        <div className="flex flex-col gap-3 border-t border-white/10 py-8 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
          </p>
          <p>This website is managed in the {settings.brandName} Hub CMS.</p>
        </div>
      </Container>
    </footer>
  );
}

export function SiteShell({ current, children }: { current: string; children: React.ReactNode }) {
  return (
    <div className="text-site-ink flex min-h-svh flex-col bg-white font-sans antialiased">
      <a
        href="#main"
        className="bg-site-ink sr-only z-[60] rounded-full px-5 py-2.5 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
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
