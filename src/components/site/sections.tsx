"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Phone, Quote } from "lucide-react";

import type { CmsBlock, CmsSection, FeatureItem } from "@/lib/site-content";
import { cn } from "@/lib/utils";

import { Container, FeatureIcon, Reveal, SiteLink, useSiteData } from "./site-kit";

/* ---------------------------------------------------------- CMS blocks */

export function Checklist({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {items.map((item, i) => (
        <Reveal
          as="li"
          key={`${i}-${item}`}
          delay={i * 50}
          className="bg-card hover:border-brand-ink/30 flex items-start gap-3 rounded-xl border p-4 text-[15px] leading-snug transition-colors duration-200"
        >
          <span className="bg-primary text-primary-foreground mt-px grid size-5 shrink-0 place-items-center rounded-full">
            <Check className="size-3" strokeWidth={3} />
          </span>
          {item}
        </Reveal>
      ))}
    </ul>
  );
}

export function StepCards({ items }: { items: FeatureItem[] }) {
  return (
    <ol className={cn("grid grid-cols-1 gap-4", items.length % 3 === 0 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {items.map((item, i) => (
        <Reveal as="li" key={item.title} delay={i * 80} className="bg-card relative rounded-2xl border p-6">
          <span className="font-display text-brand-ink text-sm font-semibold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="font-display mt-3 text-lg font-semibold tracking-tight">{item.title}</h3>
          {item.text && <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">{item.text}</p>}
        </Reveal>
      ))}
    </ol>
  );
}

export function CmsBlocks({ blocks }: { blocks: CmsBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) =>
        block.kind === "checklist" ? (
          <Checklist key={i} items={block.items} />
        ) : block.kind === "features" ? (
          <StepCards key={i} items={block.items} />
        ) : (
          <Reveal key={i}>
            <div className="prose-content text-[16px] leading-[1.75]" dangerouslySetInnerHTML={{ __html: block.html }} />
          </Reveal>
        ),
      )}
    </div>
  );
}

export function CmsSectionView({ section }: { section: CmsSection }) {
  return (
    <section>
      {section.title && (
        <Reveal>
          <h2 className="font-display flex items-center gap-3 text-2xl font-semibold tracking-tight md:text-[1.75rem]">
            <span aria-hidden className="bg-primary h-7 w-1.5 rounded-full" />
            {section.title}
          </h2>
        </Reveal>
      )}
      <div className={section.title ? "mt-7" : undefined}>
        <CmsBlocks blocks={section.blocks} />
      </div>
    </section>
  );
}

/** Large feature cards for a dark section (home page "why us"). */
export function FeatureCards({ items, dark = false }: { items: FeatureItem[]; dark?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item, i) => (
          <Reveal
            key={item.title}
            delay={i * 90}
            className={cn(
              "group rounded-2xl border p-7 transition-colors duration-300",
              dark ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]" : "bg-card hover:border-brand-ink/30",
            )}
          >
            <span className="bg-primary text-primary-foreground grid size-11 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-6">
              <FeatureIcon title={item.title} className="size-5" />
            </span>
            <h3 className="font-display mt-6 text-lg font-semibold tracking-tight">{item.title}</h3>
            {item.text && (
              <p className={cn("mt-2 text-[15px] leading-relaxed", dark ? "text-white/65" : "text-muted-foreground")}>{item.text}</p>
            )}
          </Reveal>
      ))}
    </div>
  );
}

/* --------------------------------------------------------- testimonial */

export function Testimonial({ quote }: { quote: { text: string; cite: string | null } }) {
  return (
    <section className="bg-muted/40 border-y py-24 md:py-32">
      <Container className="max-w-4xl text-center">
        <Reveal>
          <span className="bg-primary text-primary-foreground mx-auto grid size-12 place-items-center rounded-full">
            <Quote className="size-5" />
          </span>
          <blockquote className="font-display mt-8 text-2xl leading-snug font-medium tracking-[-0.015em] text-balance md:text-[2.25rem] md:leading-[1.25]">
            “{quote.text}”
          </blockquote>
          {quote.cite && <p className="text-muted-foreground mt-8 text-sm font-medium tracking-wide">{quote.cite}</p>}
        </Reveal>
      </Container>
    </section>
  );
}

export function QuoteCard({ quote }: { quote: { text: string; cite: string | null } }) {
  return (
    <Reveal className="bg-muted/50 relative overflow-hidden rounded-2xl border p-8">
      <Quote aria-hidden className="text-primary absolute -top-2 right-4 size-24 opacity-40" />
      <blockquote className="font-display relative text-xl leading-snug font-medium text-balance sm:pr-20">“{quote.text}”</blockquote>
      {quote.cite && <p className="text-muted-foreground relative mt-5 text-sm font-medium">{quote.cite}</p>}
    </Reveal>
  );
}

/* ---------------------------------------------------------------- CTA */

export function CtaSection() {
  const { settings } = useSiteData();
  return (
    <section className="py-20 md:py-28">
      <Container>
        <Reveal className="bg-sidebar relative isolate overflow-hidden rounded-[2rem] px-6 py-16 text-center text-white sm:px-12 md:py-24">
          <div aria-hidden className="site-grid-bg-dark absolute inset-0 -z-10" />
          <div
            aria-hidden
            className="site-drift absolute -inset-1/2 -z-10 bg-[radial-gradient(closest-side_at_30%_40%,color-mix(in_oklch,var(--brand)_32%,transparent),transparent_70%)]"
          />
          <h2 className="font-display mx-auto max-w-3xl text-3xl leading-[1.1] font-semibold tracking-[-0.025em] text-balance md:text-5xl">
            Let&apos;s make IT the easy part of your business
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            Book a free, no-obligation IT review. We&apos;ll show you exactly where you can save time, money and risk.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 *:w-full sm:*:w-auto">
            <SiteLink href="/site/contact" size="lg">
              Book a free IT review
              <ArrowRight />
            </SiteLink>
            <SiteLink href={`tel:${settings.supportPhone.replace(/\s/g, "")}`} variant="onDark" size="lg">
              <Phone />
              {settings.supportPhone}
            </SiteLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------ inner page hero */

export function PageHero({
  trail,
  title,
  lead,
  icon: Icon,
  children,
}: {
  trail: { label: string; href?: string }[];
  title: string;
  lead?: string | null;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b pt-32 pb-16 md:pt-40 md:pb-24">
      <div aria-hidden className="site-grid-bg absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden
        className="absolute -top-40 right-[-10%] -z-10 size-[620px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_38%,transparent),transparent)] blur-2xl dark:opacity-45"
      />
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <nav aria-label="Breadcrumb" className="site-enter text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm">
            {trail.map((crumb, i) => (
              <span key={crumb.label} className="inline-flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5 opacity-60" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={i === trail.length - 1 ? "text-foreground font-medium" : undefined}>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1
            className="site-enter font-display mt-6 text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance md:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            {title}
          </h1>
          {lead && (
            <p
              className="site-enter text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed text-pretty md:text-xl md:leading-relaxed"
              style={{ animationDelay: "160ms" }}
            >
              {lead}
            </p>
          )}
          {children && (
            <div className="site-enter mt-9 flex flex-wrap gap-3 *:w-full sm:*:w-auto" style={{ animationDelay: "240ms" }}>
              {children}
            </div>
          )}
        </div>
        <div className="hidden justify-end lg:col-span-4 lg:flex">
          <div className="site-enter" style={{ animationDelay: "200ms" }}>
            <div className="site-float bg-card relative grid size-56 place-items-center rounded-[2.5rem] border shadow-[0_40px_80px_-40px_rgb(0_0_0/0.35)]">
              <div aria-hidden className="bg-primary/50 absolute inset-8 rounded-[2rem] blur-2xl" />
              <span className="bg-primary text-primary-foreground relative grid size-24 place-items-center rounded-3xl shadow-lg">
                <Icon className="size-11" strokeWidth={1.6} />
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
