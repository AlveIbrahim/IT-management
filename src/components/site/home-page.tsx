"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown, ClipboardCheck, LifeBuoy, Rocket, Sprout } from "lucide-react";

import { parsePageBody, sectionIntro } from "@/lib/site-content";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

import { HeroLeftArt, HeroRightArt, PointerArt, SealBadge, ServiceArt, VineArt, serviceArtKind } from "./illustrations";
import { ArtPanel, ChevronList, CmsSections, ContactSection, Laptop, Sticker, TeamMember, featureItems } from "./sections";
import { Container, Eyebrow, Reveal, SiteLink, headingClass, pageHref, scrollToId, useSiteData } from "./site-kit";

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
  const { csat } = useSiteData();
  return (
    <section className="bg-site-deep relative isolate flex min-h-[calc(100svh-72px)] flex-col overflow-hidden text-white lg:min-h-[calc(100svh-88px)]">
      <Container className="relative z-10 flex flex-1 flex-col items-center justify-center pt-14 pb-10 text-center xl:pb-[17vh]">
        <h1 className="site-enter text-site-mint max-w-[16ch] text-[clamp(3rem,9vw,8.5rem)] leading-[0.92] font-normal tracking-[-0.045em] text-balance">
          {heading}
        </h1>
        <p
          className="site-enter mt-8 max-w-2xl text-lg leading-relaxed text-pretty text-white/80 md:text-xl md:leading-relaxed"
          style={{ animationDelay: "120ms" }}
        >
          {lead}
        </p>
        <SiteLink href="/site/contact" size="xl" className="site-enter mt-10" style={{ animationDelay: "220ms" }}>
          Book a free IT review
        </SiteLink>
        <a
          href="#services"
          onClick={(e) => scrollToId(e, "services")}
          className="site-enter mt-8 grid size-12 place-items-center rounded-full border border-white/40 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
          style={{ animationDelay: "320ms" }}
        >
          <ArrowDown className="size-5" />
          <span className="sr-only">Scroll to our services</span>
        </a>
      </Container>

      <SealBadge
        text="CLIENT SATISFACTION • UK SERVICE DESK • "
        className="site-pop text-site-mint absolute top-8 left-[3%] z-20 hidden size-32 xl:grid 2xl:size-40"
      >
        <span className="text-site-deep block text-center leading-none">
          <span className="block text-[1.9rem] font-semibold tracking-[-0.04em] 2xl:text-[2.1rem]">{csat}%</span>
          <span className="mt-1 block text-[10px] font-medium tracking-wide uppercase 2xl:text-[11px]">happy clients</span>
        </span>
      </SealBadge>

      <div className="pointer-events-none grid grid-cols-2 items-end gap-3 px-3 sm:px-8 xl:absolute xl:inset-x-0 xl:bottom-0 xl:block xl:px-0">
        <div className="relative w-full max-w-[340px] justify-self-start xl:absolute xl:bottom-[-6px] xl:left-[1%] xl:w-[clamp(320px,26vw,500px)] xl:max-w-none">
          <VineArt variant="left" className="absolute bottom-[62%] left-[-6%] hidden w-[78%] xl:block" />
          <HeroLeftArt className="site-enter-left relative w-full" />
        </div>
        <div className="relative w-full max-w-[340px] justify-self-end xl:absolute xl:right-[1%] xl:bottom-[-6px] xl:w-[clamp(320px,26vw,500px)] xl:max-w-none">
          <VineArt variant="right" className="absolute right-[-4%] bottom-[64%] hidden w-full xl:block" />
          <HeroRightArt className="site-enter-right relative w-full" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ services */

const DESKTOP = "(min-width: 1024px)";
const HEADER_OFFSET = 88;
const PANEL_TONES = ["bg-site-tint", "bg-site-sun-soft", "bg-[#d8efe8]"];

function subscribeDesktop(callback: () => void) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function useDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  );
}

/**
 * On desktop the services pin in place while the page scrolls past them,
 * bringing each one forward in turn. On smaller screens they simply stack.
 */
function ServiceScroller({ services }: { services: ContentItem[] }) {
  const desktop = useDesktop();
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = services.length;
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

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!desktop || !track || !pin) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const travel = track.offsetHeight - pin.offsetHeight;
      const progress = travel > 0 ? Math.min(0.999, Math.max(0, (HEADER_OFFSET - track.getBoundingClientRect().top) / travel)) : 0;
      setActive(Math.floor(progress * count));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [desktop, count]);

  const jumpTo = (index: number) => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!track || !pin) return;
    const top = track.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    const travel = track.offsetHeight - pin.offsetHeight;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top + ((index + 0.5) / count) * travel, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section id="services" className="scroll-mt-[88px]">
      <div ref={trackRef} className="relative" style={desktop ? { height: `calc(${count} * 70svh + 100svh - ${HEADER_OFFSET}px)` } : undefined}>
        <div ref={pinRef} className={desktop ? "sticky top-[88px] flex h-[calc(100svh-88px)] items-center" : "py-20"}>
          <Container className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Eyebrow className="text-site-text">What we do</Eyebrow>
              <ol className="mt-6 space-y-14 lg:mt-8 lg:space-y-2">
                {services.map((s, i) => {
                  const open = !desktop || i === active;
                  return (
                    <li key={s.id}>
                      <h3>
                        <button
                          type="button"
                          onClick={() => jumpTo(i)}
                          disabled={!desktop}
                          aria-current={desktop && open ? "step" : undefined}
                          className={cn(
                            "text-left text-[2.3rem] leading-[1.05] font-normal tracking-[-0.035em] transition-colors duration-500 outline-none focus-visible:underline disabled:cursor-default sm:text-5xl lg:text-[3.4rem] xl:text-[3.9rem]",
                            open ? "text-site-ink" : "text-site-ink/20 hover:text-site-ink/45",
                          )}
                        >
                          {s.title}
                        </button>
                      </h3>
                      <div
                        inert={!open}
                        className={cn(
                          "grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="text-site-text max-w-xl pt-4 text-lg leading-relaxed">{s.excerpt}</p>
                          {highlights[i].length > 0 && (
                            <ChevronList items={highlights[i].map((text) => ({ text }))} className="mt-6 gap-y-3" />
                          )}
                          <SiteLink href={pageHref(s)} size="lg" className="mt-8 mb-3">
                            Learn more
                          </SiteLink>
                          {!desktop && <ArtPanel kind={`${s.slug} ${s.title}`} className={cn("mt-8", PANEL_TONES[i % PANEL_TONES.length])} />}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
            {desktop && (
              <div className="lg:col-span-6">
                <div
                  className={cn(
                    "relative mx-auto aspect-square w-full max-w-[min(100%,calc(100svh-220px))] rounded-[2rem] transition-colors duration-700",
                    PANEL_TONES[active % PANEL_TONES.length],
                  )}
                >
                  {services.map((s, i) => (
                    <div
                      key={s.id}
                      className={cn(
                        "absolute inset-[10%] transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        i === active ? "scale-100 opacity-100" : "scale-90 opacity-0",
                      )}
                    >
                      <ServiceArt kind={serviceArtKind(`${s.slug} ${s.title}`)} className="size-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </div>
      </div>
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
          <div className="relative ml-[16%] lg:ml-[18%]">
            <Laptop
              src="/site/hub-tickets.webp"
              alt={`The ${settings.brandName} service desk: every ticket grouped by status with its SLA and engineer`}
              sizes="(min-width: 1024px) 60vw, 90vw"
            />
            <Sticker
              title={`${urgentMinutes} min!`}
              note="(urgent response time, and we mean it)"
              className="absolute -top-[20%] -right-[2%] w-[32%] max-w-56 min-w-28 lg:-top-[24%]"
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
      {services.length > 0 && <ServiceScroller services={services} />}
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
