"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { parsePageBody } from "@/lib/site-content";
import { useAppStore } from "@/lib/store";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ data */

/** Pages that sit in the main nav rather than under "Services". */
const COMPANY_SLUGS = ["about", "contact", "pricing"];

export interface SiteQuote {
  text: string;
  cite: string | null;
  page: string;
}

export function useSiteData() {
  const content = useAppStore((s) => s.content);
  const settings = useAppStore((s) => s.settings);
  const tickets = useAppStore((s) => s.tickets);
  const companies = useAppStore((s) => s.companies);
  const users = useAppStore((s) => s.users);

  const pages = content.filter((c) => c.type === "page" && c.status === "published");
  const nav = pages.filter((p) => p.showInNav && p.slug !== "home");
  const services = nav.filter((p) => !COMPANY_SLUGS.includes(p.slug));
  const company = nav.filter((p) => COMPANY_SLUGS.includes(p.slug));

  const rated = tickets.filter((t) => t.satisfaction);
  const csat = rated.length ? Math.round((rated.filter((t) => t.satisfaction === "positive").length / rated.length) * 100) : 98;
  const clients = companies.filter((c) => c.status !== "paused");
  const usersSupported = clients.reduce((sum, c) => sum + c.seats, 0);
  const urgentMinutes = Math.round(settings.sla.urgent.response * 60);

  // The public face of the service desk: active staff, lead first.
  const team = users.filter((u) => (u.role === "technician" || u.role === "admin") && u.status === "active");
  const lead = team.find((u) => /lead|manager/i.test(u.jobTitle)) ?? team[0] ?? null;

  return { pages, nav, services, company, settings, csat, ratings: rated.length, clients, usersSupported, urgentMinutes, team, lead };
}

/** Client quotes from every published page, for testimonial sections. */
export function useSiteQuotes(): SiteQuote[] {
  const content = useAppStore((s) => s.content);
  const pages = content.filter((c) => c.type === "page" && c.status === "published");
  return pages.flatMap((p) => {
    const quote = parsePageBody(p.body).quote;
    return quote?.cite ? [{ ...quote, page: p.title }] : [];
  });
}

export function pageHref(page: Pick<ContentItem, "slug">) {
  return page.slug === "home" ? "/site" : `/site/${page.slug}`;
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

/** Splits text so its last words can be set as an accent. */
export function splitAccent(text: string, words = 2) {
  const parts = text.trim().replace(/[.!]$/, "").split(/\s+/);
  const count = Math.min(words, Math.max(1, parts.length - 1));
  return { head: parts.slice(0, -count).join(" "), tail: parts.slice(-count).join(" "), stop: /[.!]$/.test(text.trim()) ? text.trim().slice(-1) : "" };
}

/* -------------------------------------------------------------- layout */

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1240px] px-5 sm:px-8", className)} {...props} />;
}

/** Small mono label above a heading, with a signal dot. */
export function Eyebrow({ className, dark = false, children }: { className?: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[12px] font-medium tracking-[0.14em] uppercase",
        dark ? "text-white/70" : "text-site-muted",
        className,
      )}
    >
      <span className="bg-site-ember size-1.5 rounded-full shadow-[0_0_0_3px_color-mix(in_oklch,var(--site-ember)_20%,transparent)]" />
      {children}
    </p>
  );
}

/** Serif italic, gradient-filled words inside a sans headline. */
export function Accent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-gradient font-serif text-[1.08em] font-normal tracking-[-0.01em] italic", className)}>
      {children}
    </span>
  );
}

export const type = {
  display: "text-[2.7rem] leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.4rem] lg:leading-[1]",
  h2: "text-[2rem] leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-[2.6rem] lg:text-[3.1rem] lg:leading-[1.04]",
  h3: "text-xl leading-snug font-semibold tracking-[-0.02em]",
  lead: "text-lg leading-relaxed text-pretty md:text-[1.2rem] md:leading-relaxed",
};

/** Eyebrow, heading and intro for a section. */
export function SectionIntro({
  eyebrow,
  title,
  intro,
  align = "left",
  dark = false,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2 className={cn(type.h2, "mt-5", dark ? "text-white" : "text-site-ink")}>{title}</h2>
      {intro && <p className={cn(type.lead, "mt-5", dark ? "text-white/65" : "text-site-text")}>{intro}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------- buttons */

export const siteButton = cva(
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-visible:ring-[3px] focus-visible:ring-site-blue/35 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg.arrow]:translate-x-0.5",
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(100deg,#ff6a3d,#f0516b)] text-white shadow-[0_1px_0_0_rgb(255_255_255/0.25)_inset,0_10px_24px_-10px_rgb(255_106_61/0.75)] hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgb(255_255_255/0.25)_inset,0_16px_32px_-12px_rgb(255_106_61/0.85)]",
        dark: "bg-site-ink text-white shadow-[0_10px_24px_-12px_rgb(10_17_40/0.6)] hover:-translate-y-0.5 hover:bg-[#162043]",
        outline: "border border-site-line bg-white text-site-ink hover:border-site-ink/25 hover:bg-site-soft",
        glass: "border border-white/15 bg-white/[0.06] text-white backdrop-blur hover:border-white/30 hover:bg-white/[0.12]",
        white: "bg-white text-site-ink hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgb(0_0_0/0.5)]",
      },
      size: {
        sm: "h-10 px-4.5 text-[14px]",
        md: "h-12 px-6 text-[15px]",
        lg: "h-14 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type SiteLinkProps = React.ComponentProps<"a"> & VariantProps<typeof siteButton> & { href: string };

/** Pill-shaped call to action: a Next link for pages, a plain anchor for #, tel: and mailto:. */
export function SiteLink({ href, variant, size, className, ...props }: SiteLinkProps) {
  const classes = cn(siteButton({ variant, size }), className);
  if (/^(#|tel:|mailto:|https?:)/.test(href)) return <a href={href} className={classes} {...props} />;
  return <Link href={href} className={classes} {...props} />;
}

/* -------------------------------------------------------------- motion */

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({
  delay = 0,
  className,
  children,
  style,
  as = "div",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { delay?: number; as?: "div" | "section" | "li" | "article" }) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.visible = "true";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = "true";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? { transitionDelay: `${delay}ms`, ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Smooth-scrolls to an in-page anchor, jumping instead when motion is reduced. */
export function scrollToId(event: React.MouseEvent, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
