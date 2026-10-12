"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowUpRight, ChevronDown, Headset, Menu, X } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { ServiceArt, serviceArtKind } from "./illustrations";
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

export function SiteLogo({ className }: { className?: string }) {
  const { settings } = useSiteData();
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-xl">
        <Headset className="size-[22px]" />
      </span>
      <span className="text-[21px] font-medium tracking-[-0.02em] text-white">{settings.brandName}</span>
    </span>
  );
}

const navLink =
  "relative inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[16px] text-white/80 transition-colors duration-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 data-[current=true]:text-white after:absolute after:inset-x-4 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity data-[current=true]:after:opacity-100";

function SiteHeader({ current }: { current: string }) {
  const scrolled = useScrolled();
  const { services, company, settings } = useSiteData();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = company.filter((p) => p.slug !== "contact");
  const onService = services.some((s) => s.slug === current);

  return (
    <header
      className={cn(
        "bg-site-deep sticky top-0 z-50 transition-shadow duration-300",
        scrolled && "shadow-[0_1px_0_0_rgb(255_255_255/0.08),0_12px_30px_-20px_rgb(0_0_0/0.6)]",
      )}
    >
      <Container className="flex h-[72px] items-center gap-4 lg:h-[88px]">
        <Link href="/site" aria-label={`${settings.brandName} home`} className="shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/50">
          <SiteLogo />
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center lg:flex">
          {services.length > 0 && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className={cn(navLink, "group")} data-current={onService}>
                Services
                <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={10}
                className="w-[min(560px,calc(100vw-2rem))] rounded-3xl border-0 p-3 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.45)]"
              >
                {services.map((s) => (
                  <DropdownMenuItem key={s.id} asChild className="font-display cursor-pointer items-center gap-4 rounded-2xl p-3">
                    <Link href={pageHref(s)}>
                      <span className="bg-site-sun-soft grid size-16 shrink-0 place-items-center rounded-xl p-1">
                        <ServiceArt kind={serviceArtKind(`${s.slug} ${s.title}`)} className="size-full" />
                      </span>
                      <span className="min-w-0">
                        <span className="text-site-ink block text-[17px] font-medium">{s.title}</span>
                        <span className="text-site-text mt-0.5 block text-sm leading-snug whitespace-normal">{s.excerpt}</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {links.map((p) => (
            <Link key={p.id} href={pageHref(p)} className={navLink} data-current={p.slug === current} aria-current={p.slug === current ? "page" : undefined}>
              {p.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <SiteLink href="/login" variant="lightOutline" size="sm" className="hidden sm:inline-flex">
            Client login
          </SiteLink>
          <SiteLink href="/site/contact" size="sm" className="hidden sm:inline-flex">
            Contact us
          </SiteLink>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid size-11 place-items-center rounded-full text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 lg:hidden"
          >
            <Menu className="size-6" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </Container>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" showCloseButton={false} className="bg-site-deep font-display w-full gap-0 border-0 p-0 text-white sm:max-w-md">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-[72px] items-center justify-between px-5">
            <SiteLogo />
            <SheetClose className="grid size-11 place-items-center rounded-full outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50">
              <X className="size-6" />
              <span className="sr-only">Close menu</span>
            </SheetClose>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 pt-6 pb-10">
            <p className="text-sm text-white/50">Services</p>
            <ul className="mt-2">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href={pageHref(s)}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between border-b border-white/10 py-4 text-2xl tracking-[-0.02em]"
                  >
                    {s.title}
                    <ArrowUpRight className="text-primary size-5" />
                  </Link>
                </li>
              ))}
              {links.map((p) => (
                <li key={p.id}>
                  <Link
                    href={pageHref(p)}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between border-b border-white/10 py-4 text-2xl tracking-[-0.02em]"
                  >
                    {p.title}
                    <ArrowUpRight className="text-primary size-5" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3">
              <SiteLink href="/site/contact" size="lg" onClick={() => setMenuOpen(false)}>
                Contact us
              </SiteLink>
              <SiteLink href="/login" variant="lightOutline" size="lg">
                Client login
              </SiteLink>
              <a href={telHref(settings.supportPhone)} className="mt-4 text-center text-white/70">
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
  const linkClass = "text-white/70 transition-colors hover:text-white";

  return (
    <footer className="bg-site-deep font-display text-white">
      <Container className="grid grid-cols-1 gap-12 pt-20 pb-14 sm:grid-cols-2 lg:grid-cols-12 lg:pt-24">
        <div className="lg:col-span-4">
          <SiteLogo />
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/70">{settings.tagline}.</p>
          <SiteLink href="/site/contact" className="mt-8">
            Book a free IT review
          </SiteLink>
        </div>
        <div className="lg:col-span-3">
          <h2 className="text-site-mint text-base">Services</h2>
          <ul className="mt-5 space-y-3">
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
          <h2 className="text-site-mint text-base">Company</h2>
          <ul className="mt-5 space-y-3">
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
        <div className="lg:col-span-3">
          <h2 className="text-site-mint text-base">Get in touch</h2>
          <ul className="mt-5 space-y-3">
            <li>
              <a href={telHref(settings.supportPhone)} className={linkClass}>
                {settings.supportPhone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.supportEmail}`} className={linkClass}>
                {settings.supportEmail}
              </a>
            </li>
            <li className="text-white/70">{settings.businessHours}</li>
          </ul>
        </div>
      </Container>
      <Container>
        <div className="flex flex-col gap-3 border-t border-white/10 py-8 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
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
    <div className="font-display text-site-ink flex min-h-svh flex-col bg-white">
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-[60] rounded-full px-5 py-2.5 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
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
