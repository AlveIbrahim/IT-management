"use client";

import { useId, useMemo, useState } from "react";
import { ClipboardCheck, LifeBuoy, Rocket, Sprout } from "lucide-react";

import { parsePageBody, sectionIntro } from "@/lib/site-content";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

import { HeroLeftArt, HeroRightArt, PointerArt, SealBadge } from "./illustrations";
import { ArtPanel, ChevronList, CmsSections, ContactSection, Laptop, Sticker, TeamMember, featureItems } from "./sections";
import { Container, Eyebrow, Reveal, SiteLink, headingClass, pageHref, telHref, useSiteData } from "./site-kit";

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

/* ---------------------------------------------------------------- hero */

function Hero({ heading, lead }: { heading: string; lead: string }) {
  const { settings, csat } = useSiteData();
  return (
    <section className="bg-site-deep relative overflow-hidden text-white">
      <div className="relative mx-auto max-w-[1680px]">
        <Container className="relative z-10 flex flex-col items-center pt-14 pb-12 text-center sm:pt-20 xl:min-h-[660px] xl:justify-center xl:py-20">
          <h1 className={cn(headingClass.hero, "site-enter text-site-mint max-w-[15ch]")}>{heading}</h1>
          <p
            className="site-enter mt-7 max-w-[36rem] text-lg leading-relaxed text-pretty text-white/80 md:text-xl md:leading-relaxed"
            style={{ animationDelay: "120ms" }}
          >
            {lead}
          </p>
          <div className="site-enter mt-10 flex flex-col items-center gap-x-6 gap-y-4 sm:flex-row" style={{ animationDelay: "220ms" }}>
            <SiteLink href="/site/contact" size="lg">
              Book a free IT review
            </SiteLink>
            <a href={telHref(settings.supportPhone)} className="text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline">
              or call {settings.supportPhone}
            </a>
          </div>
        </Container>

        <SealBadge
          text="CLIENT SATISFACTION • UK SERVICE DESK • "
          className="site-pop text-site-mint absolute top-10 right-[4%] z-20 hidden size-36 lg:grid xl:top-12 xl:right-[calc(50%-34rem)] xl:size-40"
        >
          <span className="text-site-deep block text-center leading-none">
            <span className="block text-[2.1rem] font-semibold tracking-[-0.04em]">{csat}%</span>
            <span className="mt-1 block text-[11px] font-medium tracking-wide uppercase">happy clients</span>
          </span>
        </SealBadge>

        <div className="pointer-events-none grid grid-cols-2 items-end gap-3 px-3 sm:px-8 xl:absolute xl:inset-x-0 xl:bottom-0 xl:block xl:px-0">
          <HeroLeftArt className="site-enter-left w-full max-w-[340px] justify-self-start xl:absolute xl:bottom-[-6px] xl:left-[1%] xl:w-[clamp(300px,24vw,470px)] xl:max-w-none" />
          <HeroRightArt
            className="site-enter-right w-full max-w-[340px] justify-self-end xl:absolute xl:right-[1%] xl:bottom-[-6px] xl:w-[clamp(300px,24vw,470px)] xl:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ services */

function ServiceTabs({ services }: { services: ContentItem[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const current = services[Math.min(active, services.length - 1)];
  const highlights = useMemo(
    () =>
      services.map(
        (s) =>
          parsePageBody(s.body)
            .sections.flatMap((x) => x.blocks)
            .find((b) => b.kind === "checklist")
            ?.items.slice(0, 3) ?? [],
      ),
    [services],
  );

  return (
    <section id="services" className="scroll-mt-24 py-24 lg:py-36">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Reveal>
            <Eyebrow className="text-site-text">What we do</Eyebrow>
          </Reveal>
          <div className="mt-6">
            {services.map((s, i) => {
              const open = i === active;
              return (
                <Reveal key={s.id} delay={i * 80} className="border-site-line border-b last:border-b-0">
                  <h3>
                    <button
                      type="button"
                      id={`${baseId}-tab-${i}`}
                      aria-expanded={open}
                      aria-controls={`${baseId}-panel-${i}`}
                      onClick={() => setActive(i)}
                      className={cn(
                        "w-full py-5 text-left text-[2rem] leading-[1.1] font-medium tracking-[-0.03em] transition-colors duration-300 outline-none focus-visible:underline sm:text-[2.6rem] lg:text-[2.9rem]",
                        open ? "text-site-ink" : "text-site-ink/25 hover:text-site-ink/55",
                      )}
                    >
                      {s.title}
                    </button>
                  </h3>
                  <div
                    id={`${baseId}-panel-${i}`}
                    role="region"
                    aria-labelledby={`${baseId}-tab-${i}`}
                    inert={!open}
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="text-site-text max-w-xl pt-1 text-lg leading-relaxed">{s.excerpt}</p>
                      {highlights[i].length > 0 && <ChevronList items={highlights[i].map((text) => ({ text }))} className="mt-6 gap-y-3" />}
                      <SiteLink href={pageHref(s)} className="mt-8 mb-8">
                        Learn more
                      </SiteLink>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
        <Reveal delay={120} className="lg:col-span-6">
          <div key={current?.id} className="site-swap">
            {current && <ArtPanel kind={`${current.slug} ${current.title}`} />}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------- portal */

function PortalShowcase() {
  const { settings } = useSiteData();
  return (
    <section className="pb-24 lg:pb-36">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <Reveal className="lg:col-span-7">
          <div className="bg-site-tint relative aspect-[6/5] overflow-hidden rounded-[2rem]">
            <Laptop
              variant="screen"
              src="/site/portal-home.webp"
              alt={`The ${settings.brandName} client portal: open tickets, account manager and response times`}
              sizes="(min-width: 1024px) 70vw, 140vw"
              className="absolute top-[15%] left-[13%] w-[138%]"
            />
          </div>
        </Reveal>
        <Reveal delay={120} className="lg:col-span-5">
          <Eyebrow>{settings.brandName} client portal</Eyebrow>
          <h2 className={cn(headingClass.section, "mt-4")}>IT support without blind spots</h2>
          <p className="text-site-text mt-8 text-lg leading-relaxed">
            Every request, update and fix in one place. With the <strong className="text-site-ink font-semibold">{settings.brandName} Client Portal</strong> you don&apos;t just hear that it&apos;s being handled: you see who&apos;s on it, what&apos;s been done and when it&apos;ll be fixed.
          </p>
          <SiteLink href="/login" className="mt-10">
            See the client portal
          </SiteLink>
        </Reveal>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------- why us */

function WhyUs({ title, intro, items }: { title: string; intro: string | null; items: { title: string; text: string }[] }) {
  const { settings, urgentMinutes } = useSiteData();
  return (
    <section className="bg-site-deep overflow-hidden py-24 text-white lg:py-36">
      <Container className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow className="text-white">Why {settings.brandName}</Eyebrow>
            <h2 className={cn(headingClass.section, "text-site-mint mt-4")}>{title}</h2>
            {intro && <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">{intro}</p>}
          </Reveal>
          <ChevronList tone="dark" items={featureItems(items)} className="mt-10" />
          <Reveal>
            <SiteLink href="/site/about" className="mt-12">
              More about us
            </SiteLink>
          </Reveal>
        </div>
        <Reveal delay={150} className="relative lg:col-span-7">
          <div className="relative mr-[-12%] ml-[16%] sm:mr-[-8%] lg:mr-[-14vw] lg:ml-[18%]">
            <Laptop
              src="/site/hub-tickets.webp"
              alt={`The ${settings.brandName} service desk: every ticket grouped by status with its SLA and engineer`}
              sizes="(min-width: 1024px) 60vw, 90vw"
            />
            <Sticker
              title={`${urgentMinutes} min!`}
              note="(urgent response time, and we mean it)"
              className="absolute -top-[18%] right-[16%] w-[34%] max-w-60 min-w-28 sm:right-[20%] lg:-top-[22%] lg:right-[27%]"
            />
          </div>
          <PointerArt className="absolute bottom-[-6%] left-[-4%] w-[38%] sm:w-[34%] lg:left-[-6%]" />
        </Reveal>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- steps */

function Steps() {
  const { settings } = useSiteData();
  return (
    <section className="py-24 lg:py-36">
      <Container className="max-w-4xl text-center">
        <Reveal>
          <span className="bg-site-tint text-site-ink mx-auto grid size-14 place-items-center rounded-full">
            <Sprout className="size-7" strokeWidth={1.75} />
          </span>
          <h2 className={cn(headingClass.section, "mt-8")}>Switching to {settings.brandName} is simple</h2>
          <p className="text-site-text mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
            No disruption and nothing lost along the way. Just better IT from the first day, with a team that tells you what it&apos;s doing.
          </p>
        </Reveal>
      </Container>
      <Container className="mt-16 lg:mt-20">
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 110} className="bg-site-soft relative rounded-[1.75rem] p-8 text-left lg:p-10">
              <div className="flex items-center justify-between">
                <span className="bg-primary text-primary-foreground grid size-12 place-items-center rounded-full">
                  <step.icon className="size-6" strokeWidth={1.75} />
                </span>
                <span className="text-site-ink/20 text-5xl font-medium tracking-[-0.04em] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-10 text-2xl font-medium tracking-[-0.02em]">{step.title}</h3>
              <p className="text-site-text mt-3 text-[17px] leading-relaxed">{step.text}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-14 text-center">
          <SiteLink href="/site/contact">Book your free IT review</SiteLink>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- team */

function TeamSection({ quote }: { quote: { text: string; cite: string | null } | null }) {
  const { team, pages, settings } = useSiteData();
  const about = pages.find((p) => p.slug === "about");
  const people = team.slice(0, 4);
  return (
    <section className="bg-site-deep overflow-hidden py-24 text-white lg:py-36">
      <Container className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <Eyebrow className="text-white">About us</Eyebrow>
          <h2 className={cn(headingClass.section, "text-site-mint mt-4")}>Real people who know your business</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            {about?.excerpt ??
              `${settings.brandName} is a UK team of engineers who'd rather prevent a problem than fix it. You'll always know who you're talking to.`}
          </p>
          {quote && (
            <figure className="border-primary mt-10 max-w-xl border-l-2 pl-6">
              <blockquote className="text-xl leading-snug md:text-2xl md:leading-snug">&ldquo;{quote.text}&rdquo;</blockquote>
              {quote.cite && <figcaption className="mt-4 text-white/60">{quote.cite}</figcaption>}
            </figure>
          )}
          {about && (
            <SiteLink href={pageHref(about)} className="mt-12">
              Meet the team
            </SiteLink>
          )}
        </Reveal>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 lg:col-span-6 lg:pl-8">
          {people.map((user, i) => (
            <Reveal key={user.id} delay={i * 100} className={cn(i % 2 === 1 && "sm:translate-y-16")}>
              <TeamMember user={user} size="lg" tone="dark" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- page */

export function HomePage({ page }: { page: ContentItem }) {
  const { services, settings } = useSiteData();
  const parsed = useMemo(() => parsePageBody(page.body), [page.body]);

  const featureSection = parsed.sections.find((s) => s.blocks.some((b) => b.kind === "features"));
  const why = featureSection ? sectionIntro(featureSection) : null;
  const whyFeatures = featureSection?.blocks.find((b) => b.kind === "features");
  const otherSections = parsed.sections.filter((s) => s !== featureSection);

  return (
    <>
      <Hero heading={parsed.heading ?? settings.tagline} lead={parsed.lead ?? page.excerpt} />
      {services.length > 0 && <ServiceTabs services={services} />}
      <PortalShowcase />
      {featureSection && whyFeatures?.kind === "features" && (
        <WhyUs title={featureSection.title ?? "Why businesses choose us"} intro={why?.intro ?? null} items={whyFeatures.items} />
      )}
      <CmsSections sections={otherSections} />
      <Steps />
      <TeamSection quote={parsed.quote} />
      <ContactSection />
    </>
  );
}
