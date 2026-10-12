"use client";

import Link from "next/link";
import { createElement, useEffect, useRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Activity,
  Cloud,
  Handshake,
  Headset,
  Layers,
  LifeBuoy,
  MessageSquare,
  MonitorSmartphone,
  PoundSterling,
  ScanSearch,
  ShieldCheck,
  Users,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

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

  const pages = content.filter((c) => c.type === "page" && c.status === "published");
  const nav = pages.filter((p) => p.showInNav && p.slug !== "home");
  const services = nav.filter((p) => !COMPANY_SLUGS.includes(p.slug));
  const company = nav.filter((p) => COMPANY_SLUGS.includes(p.slug));

  const rated = tickets.filter((t) => t.satisfaction);
  const csat = rated.length ? Math.round((rated.filter((t) => t.satisfaction === "positive").length / rated.length) * 100) : 98;
  const usersSupported = companies.reduce((sum, c) => sum + c.seats, 0);
  const urgentMinutes = Math.round(settings.sla.urgent.response * 60);

  return { pages, nav, services, company, settings, csat, usersSupported, urgentMinutes };
}

export function pageHref(page: Pick<ContentItem, "slug">) {
  return page.slug === "home" ? "/site" : `/site/${page.slug}`;
}

const PAGE_ICONS: Record<string, LucideIcon> = {
  "managed-it-support": MonitorSmartphone,
  "cyber-security": ShieldCheck,
  "cloud-microsoft-365": Cloud,
  about: Users,
  contact: MessageSquare,
};

export function pageIcon(slug: string): LucideIcon {
  return PAGE_ICONS[slug] ?? Layers;
}

const FEATURE_ICONS: [RegExp, LucideIcon][] = [
  [/fast|response|quick|speed/i, Zap],
  [/pric|cost|fee|budget/i, PoundSterling],
  [/monitor|proactive|prevent/i, Activity],
  [/people|human|team|real|local/i, Users],
  [/secur|protect|safe/i, ShieldCheck],
  [/cloud|microsoft/i, Cloud],
  [/plain|english|jargon|clear/i, MessageSquare],
  [/partner/i, Handshake],
  [/assess|review|audit/i, ScanSearch],
  [/respond|recover|fix/i, LifeBuoy],
  [/ticket|help|support/i, Headset],
];

export function featureIcon(title: string): LucideIcon {
  return FEATURE_ICONS.find(([re]) => re.test(title))?.[1] ?? Layers;
}

/** Icon for a CMS page, picked from a fixed map by slug. */
export function PageIcon({ slug, ...props }: LucideProps & { slug: string }) {
  return createElement(pageIcon(slug), props);
}

/** Icon for a feature, picked from a fixed map by keywords in its title. */
export function FeatureIcon({ title, ...props }: LucideProps & { title: string }) {
  return createElement(featureIcon(title), props);
}

/* -------------------------------------------------------------- layout */

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-6 lg:px-8", className)} {...props} />;
}

export function Eyebrow({ children, dark = false, className }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.08em] uppercase",
        dark ? "text-primary" : "text-brand-ink",
        className,
      )}
    >
      <span className={cn("h-px w-6", dark ? "bg-primary" : "bg-brand-ink")} />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2 className="font-display mt-4 text-3xl leading-[1.1] font-semibold tracking-[-0.025em] text-balance md:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className={cn("mt-5 text-lg leading-relaxed text-pretty", dark ? "text-white/70" : "text-muted-foreground")}>
          {description}
        </p>
      )}
    </Reveal>
  );
}

/* ------------------------------------------------------------- buttons */

export const siteButton = cva(
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg:last-child]:translate-x-0.5",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_1px_0_0_rgb(255_255_255/0.4)_inset,0_6px_20px_-8px_color-mix(in_oklch,var(--brand)_80%,transparent)] hover:bg-primary/90 hover:shadow-[0_1px_0_0_rgb(255_255_255/0.4)_inset,0_10px_28px_-8px_color-mix(in_oklch,var(--brand)_90%,transparent)]",
        outline: "border bg-background/70 text-foreground backdrop-blur hover:bg-muted",
        dark: "bg-foreground text-background hover:bg-foreground/90",
        onDark: "border border-white/20 bg-white/5 text-white hover:border-white/35 hover:bg-white/10",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[15px]",
        lg: "h-12 px-7 text-[15px]",
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

/** Counts up to `value` once visible; shows the final value straight away for reduced motion. */
export function CountUp({ value, suffix = "", duration = 1400 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (reduce) {
          setShown(value);
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} aria-label={`${value}${suffix}`} className="tabular-nums">
      <span aria-hidden>
        {shown}
        {suffix}
      </span>
    </span>
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
