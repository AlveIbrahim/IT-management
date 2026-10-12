"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Check, CircleCheck, ClipboardCheck, LifeBuoy, Rocket } from "lucide-react";

import { parsePageBody, sectionIntro } from "@/lib/site-content";
import type { ContentItem } from "@/lib/types";

import { HeroVisual } from "./hero-visual";
import { CmsSectionView, CtaSection, FeatureCards, Testimonial } from "./sections";
import {
  Container,
  CountUp,
  Eyebrow,
  Reveal,
  SectionHeading,
  SiteLink,
  PageIcon,
  pageHref,
  scrollToId,
  useSiteData,
} from "./site-kit";

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Free IT review",
    text: "We look at your devices, network, security and licences, then give you a clear, prioritised plan.",
  },
  {
    icon: Rocket,
    title: "Smooth onboarding",
    text: "We document everything, fix the urgent issues first and take over support with no downtime.",
  },
  {
    icon: LifeBuoy,
    title: "Ongoing support",
    text: "Unlimited helpdesk, proactive monitoring and regular reviews that keep improving your IT.",
  },
];

/** Splits a heading so its last words can be highlighted. */
function splitHeading(text: string) {
  const words = text.trim().split(/\s+/);
  const count = words.length >= 4 ? 2 : 1;
  return { head: words.slice(0, -count).join(" "), tail: words.slice(-count).join(" ") };
}

function ServiceCard({ page, index }: { page: ContentItem; index: number }) {
  const parsed = useMemo(() => parsePageBody(page.body), [page.body]);
  const highlights =
    parsed.sections.flatMap((s) => s.blocks).find((b) => b.kind === "checklist")?.items.slice(0, 3) ?? [];
  return (
    <Reveal delay={index * 90} className="h-full">
      <Link
        href={pageHref(page)}
        className="group bg-card hover:border-brand-ink/25 flex h-full flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(0_0_0/0.3)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="bg-primary/35 text-brand-ink group-hover:bg-primary group-hover:text-primary-foreground grid size-12 place-items-center rounded-xl transition-colors duration-300">
          <PageIcon slug={page.slug} className="size-6" />
        </span>
        <h3 className="font-display mt-7 text-xl font-semibold tracking-tight">{page.title}</h3>
        <p className="text-muted-foreground mt-2.5 text-[15px] leading-relaxed">{page.excerpt}</p>
        {highlights.length > 0 && (
          <ul className="mt-6 space-y-2.5 border-t pt-6 text-sm">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5">
                <Check className="text-brand-ink mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
                {h}
              </li>
            ))}
          </ul>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-semibold">
          Learn more
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </Reveal>
  );
}

export function HomePage({ page }: { page: ContentItem }) {
  const { services, settings, csat, usersSupported, urgentMinutes } = useSiteData();
  const parsed = useMemo(() => parsePageBody(page.body), [page.body]);

  const heading = splitHeading(parsed.heading ?? settings.tagline);
  const lead = parsed.lead ?? page.excerpt;
  const featureSection = parsed.sections.find((s) => s.blocks.some((b) => b.kind === "features"));
  const why = featureSection ? sectionIntro(featureSection) : null;
  const whyFeatures = featureSection?.blocks.find((b) => b.kind === "features");
  const otherSections = parsed.sections.filter((s) => s !== featureSection);

  const stats = [
    { value: urgentMinutes, suffix: " min", label: "Urgent response time" },
    { value: csat, suffix: "%", label: "Customer satisfaction" },
    { value: usersSupported, suffix: "+", label: "Users supported" },
    { text: "24/7", label: "Proactive monitoring" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-32 pb-8 md:pt-40 md:pb-12">
        <div aria-hidden className="site-grid-bg absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="absolute -top-48 right-[-15%] -z-10 size-[820px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_42%,transparent),transparent)] blur-2xl dark:opacity-45"
        />
        <Container className="grid grid-cols-1 items-center gap-x-12 gap-y-20 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="site-enter bg-background/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium backdrop-blur">
              <span className="relative flex size-2">
                <span className="bg-brand-ink/40 absolute inline-flex size-full animate-ping rounded-full motion-reduce:hidden" />
                <span className="bg-brand-ink relative inline-flex size-2 rounded-full" />
              </span>
              {settings.tagline}
            </p>
            <h1
              className="site-enter font-display mt-7 text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.5rem]"
              style={{ animationDelay: "80ms" }}
            >
              {heading.head} <span className="site-mark">{heading.tail}</span>
            </h1>
            <p
              className="site-enter text-muted-foreground mt-7 max-w-xl text-lg leading-relaxed text-pretty"
              style={{ animationDelay: "160ms" }}
            >
              {lead}
            </p>
            <div className="site-enter mt-10 flex flex-wrap gap-3 *:w-full sm:*:w-auto" style={{ animationDelay: "240ms" }}>
              <SiteLink href="/site/contact" size="lg">
                Get a free IT review
                <ArrowRight />
              </SiteLink>
              <SiteLink href="#services" variant="outline" size="lg" onClick={(e) => scrollToId(e, "services")}>
                Explore services
              </SiteLink>
            </div>
            <ul
              className="site-enter text-muted-foreground mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm"
              style={{ animationDelay: "320ms" }}
            >
              {[`${urgentMinutes}-minute urgent response`, "Fixed monthly pricing", "UK-based service desk"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CircleCheck className="text-brand-ink size-4" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="site-enter lg:col-span-6 lg:pl-6" style={{ animationDelay: "220ms" }}>
            <HeroVisual csat={csat} />
          </div>
        </Container>

        <Container className="mt-24 md:mt-32">
          <Reveal className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-2xl border lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-background/95 px-6 py-7 backdrop-blur lg:px-8 lg:py-9">
                <p className="font-display text-3xl font-semibold tracking-[-0.03em] md:text-[2.75rem] md:leading-none">
                  {"text" in s ? s.text : <CountUp value={s.value} suffix={s.suffix} />}
                </p>
                <p className="text-muted-foreground mt-2.5 text-sm">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section id="services" className="scroll-mt-20 py-24 md:py-32">
          <Container>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="Services"
                title="Everything your IT needs, under one roof"
                description="Pick a single service or let us run the lot. Either way, you get one accountable team."
              />
              <Reveal>
                <SiteLink href="/site/contact" variant="outline">
                  Talk to an expert
                  <ArrowRight />
                </SiteLink>
              </Reveal>
            </div>
            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <ServiceCard key={s.id} page={s} index={i} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Why us, from the CMS */}
      {featureSection && whyFeatures?.kind === "features" && (
        <section className="bg-sidebar relative isolate overflow-clip py-24 text-white md:py-32">
          <div aria-hidden className="site-grid-bg-dark absolute inset-0 -z-10 opacity-60" />
          <div
            aria-hidden
            className="absolute top-0 -left-40 -z-10 size-[640px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_24%,transparent),transparent)]"
          />
          <Container className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="self-start lg:sticky lg:top-32 lg:col-span-5">
              <Reveal>
                <Eyebrow dark>Why {settings.brandName}</Eyebrow>
                <h2 className="font-display mt-4 text-3xl leading-[1.1] font-semibold tracking-[-0.025em] text-balance md:text-[2.75rem]">
                  {featureSection.title ?? "Why businesses choose us"}
                </h2>
                {why?.intro && <p className="mt-5 text-lg leading-relaxed text-pretty text-white/70">{why.intro}</p>}
                <SiteLink href="/site/about" variant="onDark" className="mt-9">
                  More about us
                  <ArrowRight />
                </SiteLink>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <FeatureCards items={whyFeatures.items} dark />
            </div>
          </Container>
        </section>
      )}

      {/* Any other sections the editor adds */}
      {otherSections.length > 0 && (
        <section className="py-24 md:py-32">
          <Container className="max-w-4xl space-y-16">
            {otherSections.map((s, i) => (
              <CmsSectionView key={i} section={s} />
            ))}
          </Container>
        </section>
      )}

      {/* How it works */}
      <section className="py-24 md:py-32">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title={`Switching to ${settings.brandName} is simple`}
            description="No disruption, nothing lost along the way. Just better IT from day one."
          />
          <Reveal className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            <div aria-hidden className="bg-border absolute top-7 right-[16.66%] left-[16.66%] hidden h-px md:block">
              <div className="site-line bg-brand-ink/50 h-full" />
            </div>
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <span className="bg-primary text-primary-foreground ring-background relative z-10 mx-auto grid size-14 place-items-center rounded-full shadow-sm ring-8">
                  <step.icon className="size-6" />
                </span>
                <p className="text-brand-ink font-display mt-6 text-sm font-semibold tabular-nums">Step {i + 1}</p>
                <h3 className="font-display mt-1.5 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground mx-auto mt-3 max-w-xs leading-relaxed">{step.text}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {parsed.quote && <Testimonial quote={parsed.quote} />}

      <CtaSection />
    </>
  );
}
