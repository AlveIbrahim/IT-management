"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { useAppStore } from "@/lib/store";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ data */

/** Pages that sit in the main nav rather than under "Services". */
const COMPANY_SLUGS = ["about", "contact", "pricing"];

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
  const usersSupported = companies.reduce((sum, c) => sum + c.seats, 0);
  const urgentMinutes = Math.round(settings.sla.urgent.response * 60);

  // The public face of the service desk: active staff, lead first.
  const team = users.filter((u) => (u.role === "technician" || u.role === "admin") && u.status === "active");
  const lead = team.find((u) => /lead|manager/i.test(u.jobTitle)) ?? team[0] ?? null;

  return { pages, nav, services, company, settings, csat, usersSupported, urgentMinutes, team, lead };
}

export function pageHref(page: Pick<ContentItem, "slug">) {
  return page.slug === "home" ? "/site" : `/site/${page.slug}`;
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

/* -------------------------------------------------------------- layout */

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10", className)} {...props} />;
}

/** The small line above a heading, e.g. "DeskSupport client portal". */
export function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-lg leading-snug tracking-[-0.01em] md:text-[22px]", className)} {...props} />;
}

export const headingClass = {
  hero: "text-[2.6rem] leading-[1.04] font-medium tracking-[-0.035em] text-balance sm:text-6xl lg:text-[5.25rem] lg:leading-[1.02]",
  section: "text-[2.1rem] leading-[1.08] font-medium tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.6rem] lg:leading-[1.05]",
  sub: "text-2xl leading-[1.15] font-medium tracking-[-0.02em] md:text-[2rem]",
};

/* ------------------------------------------------------------- buttons */

export const siteButton = cva(
  "inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-[background-color,border-color,color,transform] duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        lime: "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--brand)_82%,white)] focus-visible:ring-primary/60 focus-visible:ring-offset-site-deep",
        lightOutline: "border border-white/35 text-white hover:border-white/70 hover:bg-white/[0.06] focus-visible:ring-white/50 focus-visible:ring-offset-site-deep",
        inkOutline: "border border-site-ink/30 text-site-ink hover:border-site-ink hover:bg-site-ink/[0.04] focus-visible:ring-site-ink/40",
        ink: "bg-site-ink text-white hover:bg-site-deep focus-visible:ring-site-ink/40",
      },
      size: {
        sm: "h-10 px-5 text-[15px]",
        md: "h-12 px-7 text-base",
        lg: "h-14 px-8 text-[17px]",
      },
    },
    defaultVariants: { variant: "lime", size: "md" },
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
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
