"use client";

import Link from "next/link";
import { createElement, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardCheck,
  Eye,
  Handshake,
  LifeBuoy,
  MessageSquareText,
  Minus,
  Phone,
  PoundSterling,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

import { parsePageBody, sectionIntro } from "@/lib/site-content";
import { useAppStore } from "@/lib/store";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

import { AccentTitle, CmsSections, CtaBand, Faq } from "./sections";
import { ServiceIcon } from "./site-shell";
import {
  Accent,
  Container,
  Eyebrow,
  Reveal,
  SectionIntro,
  SiteLink,
  pageHref,
  splitAccent,
  telHref,
  type,
  useSiteData,
  useSiteQuotes,
} from "./site-kit";
import { BrowserFrame, FloatCard, InitialsAvatar, PhotoFrame, UkMap, Wordmark } from "./visuals";

/* ------------------------------------------------------------- helpers */

const DESKTOP = "(min-width: 1024px)";

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

/** How far a section has travelled through the viewport, from 0 to 1. */
function useScrollProgress(ref: React.RefObject<HTMLElement | null>, startAt = 0.85, endAt = 0.25) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = vh * (startAt - endAt) + rect.height * 0.4;
      setProgress(Math.min(1, Math.max(0, (vh * startAt - rect.top) / span)));
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
  }, [ref, startAt, endAt]);
  return progress;
}

/** A live-looking ticket for the photo overlay: in progress, with a reply. */
function useSpotlightTicket() {
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  return useMemo(() => {
    const replied = tickets
      .filter((t) => (t.status === "in_progress" || t.status === "waiting") && t.assigneeId && t.firstResponseAt)
      .map((t) => ({ t, minutes: Math.max(1, Math.round((new Date(t.firstResponseAt!).getTime() - new Date(t.createdAt).getTime()) / 60000)) }))
      .sort((a, b) => a.minutes - b.minutes);
    const best = replied[0];
    if (!best) return null;
    const engineer = users.find((u) => u.id === best.t.assigneeId);
    return { ref: `DS-${best.t.number}`, subject: best.t.subject, engineer: engineer?.name ?? "Our team", minutes: best.minutes };
  }, [tickets, users]);
}

/* ---------------------------------------------------------------- hero */

function Hero({ heading, lead }: { heading: string; lead: string }) {
  const { settings, csat, ratings, urgentMinutes, services, team } = useSiteData();
  const { head, tail, stop } = splitAccent(heading, 2);
  return (
    <section className="relative isolate -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#eef2ff_0%,#f6f8fd_60%,#ffffff_100%)]" />
      <div aria-hidden className="site-grid-lines absolute inset-0 -z-10" />
      <div aria-hidden className="site-drift absolute -top-48 -left-40 -z-10 size-[44rem] rounded-full bg-[radial-gradient(closest-side,rgb(123_92_255/0.16),transparent)]" />
      <div aria-hidden className="absolute -right-40 bottom-[-10rem] -z-10 size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_106_61/0.14),transparent)]" />

      <Container className="grid grid-cols-1 items-center gap-10 pt-10 lg:grid-cols-12 lg:gap-6 lg:pt-12">
        <div className="lg:col-span-7 lg:pb-10">
          <Eyebrow className="site-enter">Managed IT &amp; cyber security for UK businesses</Eyebrow>
          <h1 className={cn(type.display, "site-enter mt-6")} style={{ animationDelay: "80ms" }}>
            {head} <Accent>{tail}</Accent>
            {stop}
          </h1>
          <p className={cn(type.lead, "site-enter text-site-text mt-6 max-w-xl")} style={{ animationDelay: "160ms" }}>
            {lead}
          </p>
          <div className="site-enter mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
            <SiteLink href="/site/contact" size="lg">
              Book a free IT review
              <ArrowRight className="arrow" />
            </SiteLink>
            <SiteLink href={telHref(settings.supportPhone)} variant="outline" size="lg">
              <Phone />
              {settings.supportPhone}
            </SiteLink>
          </div>
          <div className="site-enter mt-10 flex items-center gap-4" style={{ animationDelay: "320ms" }}>
            <div className="flex -space-x-2.5">
              {team.slice(0, 4).map((u, i) => (
                <InitialsAvatar key={u.id} name={u.name} index={i} className="size-10 text-[12.5px]" />
              ))}
            </div>
            <p className="text-site-text text-[14px] leading-snug">
              <span className="text-site-ink font-semibold">Real engineers, not a call centre.</span>
              <br />
              Urgent issues picked up within {urgentMinutes} minutes.
            </p>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <UkMap className="site-enter mx-auto w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[400px]" />
          <FloatCard className="site-float top-[4%] left-0 hidden w-48 sm:block lg:-left-6">
            <p className="text-site-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">Client satisfaction</p>
            <p className="text-site-ink mt-1 flex items-end gap-1.5 text-3xl font-semibold tracking-[-0.04em]">
              {csat}%
              <span className="text-site-ember mb-1.5 flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-3 fill-current" />
                ))}
              </span>
            </p>
            <p className="text-site-muted mt-0.5 text-[12px]">From {ratings} ticket ratings</p>
          </FloatCard>
        </div>
      </Container>

      {services.length > 0 && (
        <Container className="pt-6 pb-16 lg:pb-20">
          <div className="site-enter flex flex-wrap gap-3" style={{ animationDelay: "420ms" }}>
            {services.map((s) => (
              <Link
                key={s.id}
                href={pageHref(s)}
                className="group border-site-line hover:border-site-ink/20 inline-flex h-12 items-center gap-2.5 rounded-full border bg-white/85 pr-4 pl-2 text-[15px] font-medium shadow-[0_8px_20px_-14px_rgb(10_17_40/0.4)] backdrop-blur transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-16px_rgb(10_17_40/0.45)]"
              >
                <span className="bg-site-tint text-site-blue grid size-8 place-items-center rounded-full">
                  <ServiceIcon name={`${s.slug} ${s.title}`} className="size-4" />
                </span>
                {s.title}
                <ArrowUpRight className="text-site-muted size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </Container>
      )}
    </section>
  );
}

/* --------------------------------------------------------------- trust */

function TrustStrip() {
  const { clients, usersSupported } = useSiteData();
  if (clients.length === 0) return null;
  const names = clients.map((c) => c.name);
  return (
    <section className="border-site-line border-y bg-white py-9">
      <Container className="flex flex-col items-center gap-6 lg:flex-row lg:gap-12">
        <p className="text-site-muted shrink-0 text-center text-[14px] leading-snug lg:max-w-[13rem] lg:text-left">
          Trusted by <span className="text-site-ink font-semibold">{clients.length} UK organisations</span> and {usersSupported}+ people
        </p>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <div className="site-marquee text-site-ink/55 flex w-max items-center gap-14 pr-14">
            {[...names, ...names].map((name, i) => (
              <span key={i} aria-hidden={i >= names.length || undefined}>
                <Wordmark name={name} index={i % names.length} />
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ approach */

function Approach() {
  const { settings, csat, urgentMinutes, usersSupported } = useSiteData();
  const spotlight = useSpotlightTicket();
  const stats = [
    { value: `${usersSupported}+`, label: "People supported" },
    { value: `${urgentMinutes} min`, label: "Urgent response" },
    { value: `${csat}%`, label: "Client satisfaction" },
    { value: "24/7", label: "Proactive monitoring" },
  ];
  return (
    <section className="py-24 lg:py-32">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="relative lg:col-span-6">
          <PhotoFrame
            src="/site/photos/support-desk.webp"
            alt="An engineer working through a problem with a colleague at her desk"
            className="aspect-[5/4]"
          >
            {spotlight && (
              <FloatCard className="site-float right-3 bottom-6 w-[min(250px,70%)] sm:-right-8">
                <p className="text-site-muted flex items-center justify-between font-mono text-[10.5px] tracking-[0.08em] uppercase">
                  {spotlight.ref}
                  <span className="text-site-violet">In progress</span>
                </p>
                <p className="text-site-ink mt-1.5 line-clamp-2 text-[13.5px] leading-snug font-semibold">{spotlight.subject}</p>
                <div className="mt-3 flex items-center gap-2">
                  <InitialsAvatar name={spotlight.engineer} index={1} className="size-7 text-[10px] ring-2" />
                  <p className="text-site-text text-[12px]">
                    {spotlight.engineer.split(" ")[0]} replied in {spotlight.minutes} min
                  </p>
                </div>
              </FloatCard>
            )}
          </PhotoFrame>
        </Reveal>
        <div className="lg:col-span-6">
          <Reveal>
            <Eyebrow>The {settings.brandName} way</Eyebrow>
            <h2 className={cn(type.h2, "mt-5")}>
              Managed IT, <Accent>without the ticket queue.</Accent>
            </h2>
            <p className={cn(type.lead, "text-site-text mt-6")}>
              You get a small team of engineers who know your setup, your people and your history. They pick up the phone, fix the problem and explain it in plain English, and they keep an eye on everything in between.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <dl className="border-site-line mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t pt-8 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-site-muted font-mono text-[11px] tracking-[0.08em] uppercase">{s.label}</dt>
                  <dd className="text-site-ink mt-2 text-[2rem] leading-none font-semibold tracking-[-0.04em]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ services */

function ServicesGrid() {
  const { services } = useSiteData();
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
  if (services.length === 0) return null;
  return (
    <section id="services" className="bg-site-soft scroll-mt-20 py-24 lg:py-32">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            eyebrow="What we do"
            title={
              <>
                Everything your business runs on, <Accent>looked after.</Accent>
              </>
            }
            intro="Pick one service or let us run the lot. Either way you get one accountable team and one number to call."
          />
          <Reveal>
            <SiteLink href="/site/contact" variant="outline">
              Talk to an engineer
              <ArrowRight className="arrow" />
            </SiteLink>
          </Reveal>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 90} className="h-full">
              <Link
                href={pageHref(s)}
                className="group border-site-line hover:border-site-blue/30 relative flex h-full flex-col overflow-hidden rounded-[24px] border bg-white p-7 shadow-[0_1px_2px_rgb(10_17_40/0.04)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(10_17_40/0.35)] focus-visible:ring-[3px] focus-visible:ring-site-blue/30"
              >
                <span
                  aria-hidden
                  className="bg-site-gradient absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                />
                <div className="flex items-center justify-between">
                  <span className="bg-site-tint text-site-blue group-hover:bg-site-blue grid size-12 place-items-center rounded-2xl transition-colors duration-300 group-hover:text-white">
                    <ServiceIcon name={`${s.slug} ${s.title}`} className="size-6" />
                  </span>
                  <span className="text-site-muted font-mono text-[11px] tracking-[0.1em]">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className={cn(type.h3, "mt-8 text-[1.35rem]")}>{s.title}</h3>
                <p className="text-site-text mt-2.5 text-[15px] leading-relaxed">{s.excerpt}</p>
                {highlights[i].length > 0 && (
                  <ul className="border-site-line mt-6 space-y-2.5 border-t pt-6 text-[14.5px]">
                    {highlights[i].map((h) => (
                      <li key={h} className="text-site-text flex items-start gap-2.5">
                        <Check className="text-site-blue mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <span className="text-site-ink mt-auto inline-flex items-center gap-1.5 pt-8 text-[14.5px] font-semibold">
                  Learn more
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={services.length * 90} className={cn("h-full", services.length % 3 === 0 && "md:col-span-2 lg:col-span-3")}>
            <Link
              href="/site/contact"
              className="group bg-site-night relative isolate flex h-full min-h-64 flex-col justify-end overflow-hidden rounded-[24px] p-7 text-white outline-none focus-visible:ring-[3px] focus-visible:ring-site-blue/40 sm:p-9"
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-[url('/site/photos/server-racks.webp')] bg-cover bg-center opacity-55 transition-transform duration-700 group-hover:scale-105"
              />
              <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(7_12_31/0.95)_25%,rgb(7_12_31/0.5)_65%,rgb(47_91_255/0.35))]" />
              <span className="font-mono text-[11px] tracking-[0.14em] text-white/60 uppercase">Not sure where to start?</span>
              <span className="mt-3 max-w-xl text-2xl leading-tight font-semibold tracking-[-0.03em] sm:text-3xl">
                Book a free IT review and get a clear, prioritised plan for your business.
              </span>
              <span className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium">
                Book your review
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------- product */

const PRODUCT_STEPS = [
  {
    eyebrow: "Raise it",
    title: "Ask for help your way",
    text: "Portal, email or phone. Every request becomes a ticket with a reference, so nothing slips through the cracks.",
    src: "/site/app-portal.webp",
    alt: "The client portal home page with a search box, open tickets and the account manager's details",
  },
  {
    eyebrow: "Track it",
    title: "See exactly where it's up to",
    text: "Live status, who's on it and when it's due. No chasing, no guessing, no 'we'll get back to you'.",
    src: "/site/app-tickets.webp",
    alt: "The service desk ticket list grouped by status, with priority, engineer and SLA for each ticket",
  },
  {
    eyebrow: "Prove it",
    title: "Know your IT is working",
    text: "Clear reporting on response times, satisfaction and trends across your business, every month.",
    src: "/site/app-dashboard.webp",
    alt: "The dashboard with open tickets, response times, satisfaction and a ticket volume chart",
  },
];

/** On desktop the screenshots pin while the steps scroll past; on mobile they stack. */
function ProductShowcase() {
  const desktop = useDesktop();
  const { settings } = useSiteData();
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = PRODUCT_STEPS.length;

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!desktop || !track || !pin) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const travel = track.offsetHeight - pin.offsetHeight;
      const progress = travel > 0 ? Math.min(0.999, Math.max(0, (76 - track.getBoundingClientRect().top) / travel)) : 0;
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
    const top = track.getBoundingClientRect().top + window.scrollY - 76;
    const travel = track.offsetHeight - pin.offsetHeight;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top + ((index + 0.5) / count) * travel, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="bg-site-night relative isolate overflow-x-clip text-white">
      <div aria-hidden className="site-grid-lines-dark absolute inset-0 -z-10" />
      <div aria-hidden className="absolute top-0 left-1/2 -z-10 h-[36rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(47_91_255/0.22),transparent)]" />
      <Container className="pt-24 lg:pt-32">
        <SectionIntro
          dark
          eyebrow={`The ${settings.brandName} client portal`}
          title={
            <>
              One place for every request, <Accent>in plain sight.</Accent>
            </>
          }
          intro="Your team raises issues in seconds and sees progress in real time. You see the numbers that prove it's working."
        />
      </Container>
      <div ref={trackRef} className="relative" style={desktop ? { height: `calc(${count} * 60svh + 100svh - 76px)` } : undefined}>
        <div ref={pinRef} className={desktop ? "sticky top-[76px] flex h-[calc(100svh-76px)] items-center" : "pt-12 pb-24"}>
          <Container className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <ol className="space-y-12 lg:col-span-4 lg:space-y-3">
              {PRODUCT_STEPS.map((step, i) => {
                const on = !desktop || i === active;
                return (
                  <li key={step.title}>
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      disabled={!desktop}
                      aria-current={desktop && on ? "step" : undefined}
                      className={cn(
                        "w-full rounded-2xl border p-6 text-left transition-[background-color,border-color,opacity] duration-500 outline-none focus-visible:ring-[3px] focus-visible:ring-white/30 disabled:cursor-default",
                        on ? "border-white/15 bg-white/[0.06] opacity-100" : "border-transparent opacity-45 hover:opacity-75",
                      )}
                    >
                      <span className="text-site-ember font-mono text-[11px] tracking-[0.14em] uppercase">
                        {String(i + 1).padStart(2, "0")} · {step.eyebrow}
                      </span>
                      <span className="mt-2 block text-xl font-semibold tracking-[-0.02em]">{step.title}</span>
                      <span
                        className={cn(
                          "grid transition-[grid-template-rows] duration-500",
                          on ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        <span className="overflow-hidden">
                          <span className="mt-2 block text-[15px] leading-relaxed text-white/65">{step.text}</span>
                        </span>
                      </span>
                    </button>
                    {!desktop && <BrowserFrame src={step.src} alt={step.alt} className="mt-5" sizes="100vw" />}
                  </li>
                );
              })}
            </ol>
            {desktop && (
              <div className="relative lg:col-span-8">
                <div aria-hidden className="bg-site-gradient absolute -inset-6 -z-10 rounded-[40px] opacity-25 blur-3xl" />
                <div className="relative aspect-[16/10.9]">
                  {PRODUCT_STEPS.map((step, i) => (
                    <div
                      key={step.src}
                      className={cn(
                        "absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        i === active ? "translate-y-0 scale-100 opacity-100" : i < active ? "-translate-y-6 scale-[0.97] opacity-0" : "translate-y-6 scale-[0.97] opacity-0",
                      )}
                    >
                      <BrowserFrame src={step.src} alt={step.alt} sizes="(min-width: 1024px) 62vw, 100vw" />
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

/* ------------------------------------------------------------ security */

const CONTROLS = [
  "Cyber Essentials readiness",
  "MFA on every account",
  "Protection on every device",
  "Encrypted, tested backups",
  "Patching, handled",
  "Phishing awareness training",
];

function Security() {
  const { pages } = useSiteData();
  const cyber = pages.find((p) => /cyber|secur/i.test(p.slug));
  return (
    <section className="relative isolate overflow-hidden py-24 lg:py-32">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#ffffff,#f3f5ff_45%,#fff4ef)]" />
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Reveal>
            <Eyebrow>Security by default</Eyebrow>
            <h2 className={cn(type.h2, "mt-5")}>
              Secure IT, <Accent>built for accountability.</Accent>
            </h2>
            <p className={cn(type.lead, "text-site-text mt-6")}>
              Every plan includes the protections insurers and regulators expect, documented and reviewed with you. When something suspicious happens, an engineer who knows your systems responds.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <ul className="mt-9 flex flex-wrap gap-2.5">
              {CONTROLS.map((c) => (
                <li
                  key={c}
                  className="border-site-line text-site-ink inline-flex items-center gap-2 rounded-full border bg-white/80 px-3.5 py-2 text-[13.5px] font-medium backdrop-blur"
                >
                  <ShieldCheck className="text-site-blue size-4" />
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <SiteLink href="/site/contact">
                Get a security review
                <ArrowRight className="arrow" />
              </SiteLink>
              {cyber && (
                <SiteLink href={pageHref(cyber)} variant="outline">
                  About cyber security
                </SiteLink>
              )}
            </div>
          </Reveal>
        </div>
        <Reveal delay={120} className="relative lg:col-span-6">
          <PhotoFrame src="/site/photos/engineers.webp" alt="Two engineers working at their desks in a bright office" className="aspect-[4/3.3]">
            <FloatCard className="site-float -top-5 left-4 w-60 sm:-left-8">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-rose-50 text-rose-600">
                  <ShieldAlert className="size-4" />
                </span>
                <div>
                  <p className="text-site-ink text-[13.5px] font-semibold">Phishing email blocked</p>
                  <p className="text-site-muted text-[12px]">Quarantined before delivery</p>
                </div>
              </div>
            </FloatCard>
            <FloatCard className="site-float-delay right-4 -bottom-5 w-56 sm:-right-8">
              <p className="text-site-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">Patch status</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-site-ink text-[13.5px] font-semibold">All devices up to date</p>
                <Check className="size-4 text-emerald-600" strokeWidth={3} />
              </div>
              <div className="bg-site-tint mt-2.5 h-1.5 overflow-hidden rounded-full">
                <div className="bg-site-gradient h-full w-full" />
              </div>
            </FloatCard>
          </PhotoFrame>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ problems */

const FALLBACK_REASONS = [
  { title: "We spot problems before you do", text: "Servers, Wi-Fi, backups and devices are monitored around the clock, so most issues are fixed before anyone notices." },
  { title: "A named engineer, not a queue", text: "A small team learns your setup, your people and your history." },
  { title: "One fixed monthly fee", text: "Simple per-user pricing agreed up front. No hourly bills and no surprise invoices." },
  { title: "Plain English, always", text: "We explain what happened, what we did and what we'd recommend next." },
];

const REASON_ICONS: [RegExp, typeof Eye][] = [
  [/fast|response|quick|speed/i, Zap],
  [/pric|cost|fee|budget|bill/i, PoundSterling],
  [/monitor|proactive|spot|watch/i, Eye],
  [/people|human|team|real|engineer|named/i, Handshake],
  [/secur|protect|safe/i, ShieldCheck],
  [/plain|english|jargon|clear/i, MessageSquareText],
];

function ReasonIcon({ title, className }: { title: string; className?: string }) {
  return createElement(REASON_ICONS.find(([re]) => re.test(title))?.[1] ?? Sparkles, { className });
}

/** The CMS "why us" bullets as a swipeable row of cards. */
function Problems({ title, intro, items }: { title: string; intro: string | null; items: { title: string; text: string }[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 320) + 20), behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <section className="overflow-hidden py-24 lg:py-32">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro eyebrow="Why it works" title={<AccentTitle text={title} />} intro={intro} />
          <Reveal className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="border-site-line text-site-ink hover:bg-site-soft grid size-12 place-items-center rounded-full border bg-white outline-none focus-visible:ring-[3px] focus-visible:ring-site-blue/30"
            >
              <ArrowLeft className="size-5" />
              <span className="sr-only">Previous</span>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="bg-site-ink grid size-12 place-items-center rounded-full text-white outline-none hover:bg-[#162043] focus-visible:ring-[3px] focus-visible:ring-site-blue/30"
            >
              <ArrowRight className="size-5" />
              <span className="sr-only">Next</span>
            </button>
          </Reveal>
        </div>
      </Container>
      <div
        ref={scroller}
        className="mt-12 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:scroll-px-8 sm:px-8 lg:scroll-px-[max(2rem,calc((100vw-1240px)/2+2rem))] lg:px-[max(2rem,calc((100vw-1240px)/2+2rem))] [&::-webkit-scrollbar]:hidden"
      >
        <div
          data-card
          className="relative isolate flex min-h-[340px] w-[82vw] max-w-[360px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[24px] p-7 text-white"
        >
          <span aria-hidden className="absolute inset-0 -z-10 bg-[url('/site/photos/patch-panel.webp')] bg-cover bg-center" />
          <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(7_12_31/0.1),rgb(7_12_31/0.88))]" />
          <span className="font-mono text-[11px] tracking-[0.14em] text-white/70 uppercase">Proactive by design</span>
          <p className="mt-3 text-[1.35rem] leading-snug font-semibold tracking-[-0.02em]">Most issues are fixed before your team ever sees them.</p>
        </div>
        {items.map((p, i) => {
          const featured = i === 1;
          return (
            <div
              key={p.title}
              data-card
              className={cn(
                "flex min-h-[340px] w-[82vw] max-w-[340px] shrink-0 snap-start flex-col rounded-[24px] p-7",
                featured ? "bg-site-gradient text-white shadow-[0_30px_60px_-30px_rgb(123_92_255/0.7)]" : "border-site-line border bg-white",
              )}
            >
              <span className={cn("grid size-11 place-items-center rounded-2xl", featured ? "bg-white/20" : "bg-site-tint text-site-blue")}>
                <ReasonIcon title={p.title} className="size-5" />
              </span>
              <p className={cn("mt-auto text-[1.3rem] leading-snug font-semibold tracking-[-0.02em]", !featured && "text-site-ink")}>{p.title}</p>
              {p.text && <p className={cn("mt-3 text-[15px] leading-relaxed", featured ? "text-white/85" : "text-site-text")}>{p.text}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- statement */

function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref, 0.9, 0.35);
  const text =
    "Fast, friendly support from real engineers. One fixed monthly price. Security that's built in, not bolted on. And a team that tells you what it's doing.";
  const words = text.split(" ");
  return (
    <section className="bg-site-night relative isolate overflow-hidden py-28 text-white lg:py-40">
      <div aria-hidden className="site-grid-lines-dark absolute inset-0 -z-10" />
      <div aria-hidden className="site-drift absolute -bottom-40 -left-20 -z-10 size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_106_61/0.28),transparent)]" />
      <div aria-hidden className="absolute -top-40 -right-20 -z-10 size-[44rem] rounded-full bg-[radial-gradient(closest-side,rgb(47_91_255/0.3),transparent)]" />
      <svg aria-hidden viewBox="0 0 1200 400" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 -z-10 h-[38%] w-full opacity-70">
        <defs>
          <linearGradient id="trail" x1="0" x2="1">
            <stop offset="0" stopColor="#ff6a3d" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ff6a3d" />
            <stop offset="1" stopColor="#7b5cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M-50 ${380 - i * 22} C 300 ${400 - i * 30}, 700 ${200 - i * 26}, 1250 ${240 - i * 30}`}
            pathLength={1}
            className="site-trail"
            style={{ animationDelay: `${-i * 1.4}s` }}
            stroke="url(#trail)"
            strokeWidth={1.4}
            fill="none"
          />
        ))}
      </svg>
      <Container className="max-w-5xl text-center">
        <Eyebrow dark className="justify-center">
          Our promise
        </Eyebrow>
        <div ref={ref}>
          <p className="mt-8 text-[1.85rem] leading-[1.2] font-semibold tracking-[-0.03em] text-balance sm:text-4xl lg:text-[3.1rem] lg:leading-[1.15]">
            {words.map((word, i) => (
              <span
                key={i}
                className="scroll-word transition-opacity duration-300"
                style={{ opacity: Math.min(1, Math.max(0.18, progress * words.length * 1.15 - i)) }}
              >
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <SiteLink href="/site/contact" size="lg">
            Book a free IT review
            <ArrowRight className="arrow" />
          </SiteLink>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------- comparison */

function Comparison() {
  const { settings, urgentMinutes } = useSiteData();
  const rows: [string, string, string, string][] = [
    ["Response time", `${urgentMinutes}-minute urgent response`, "When they're free", "Depends on one person"],
    ["Pricing", "Fixed monthly, per user", "Hourly and unpredictable", "Salary, training and tools"],
    ["Monitoring", "24/7 and proactive", "—", "Office hours only"],
    ["Security", "Built into every plan", "Extra cost", "Depends on their skills"],
    ["Holiday and sickness cover", "A whole team", "—", "—"],
    ["Reporting", "Monthly, in plain English", "—", "Varies"],
    ["Client portal", "Included", "—", "Rarely"],
  ];
  const cell = (value: string, featured = false) =>
    value === "—" ? (
      <span className="text-site-muted/70 inline-flex items-center gap-2">
        <Minus className="size-4" />
        Not included
      </span>
    ) : (
      <span className={cn("inline-flex items-start gap-2", featured && "text-site-ink font-medium")}>
        {featured && <Check className="text-site-blue mt-0.5 size-4 shrink-0" strokeWidth={2.75} />}
        {value}
      </span>
    );
  return (
    <section className="bg-site-soft py-24 lg:py-32">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            eyebrow={`${settings.brandName} vs the alternatives`}
            title={
              <>
                When break-fix <Accent>stops making sense.</Accent>
              </>
            }
            intro="Ad-hoc contractors and a single in-house hire both leave gaps. Here's how a managed service compares."
          />
          <Reveal>
            <SiteLink href="/site/contact">
              Talk to an expert
              <ArrowRight className="arrow" />
            </SiteLink>
          </Reveal>
        </div>
        <Reveal className="border-site-line mt-14 overflow-x-auto rounded-[24px] border bg-white shadow-[0_30px_60px_-40px_rgb(10_17_40/0.3)]">
          <table className="w-full min-w-[760px] border-collapse text-left text-[14.5px]">
            <thead>
              <tr>
                <th scope="col" className="bg-site-ink w-[22%] px-6 py-5 font-mono text-[11px] font-medium tracking-[0.12em] text-white/60 uppercase">
                  What you get
                </th>
                <th scope="col" className="bg-site-gradient w-[28%] px-6 py-5 text-[15px] font-semibold text-white">
                  {settings.brandName}
                </th>
                <th scope="col" className="bg-site-ink w-[25%] px-6 py-5 text-[15px] font-semibold text-white/85">
                  Break-fix contractor
                </th>
                <th scope="col" className="bg-site-ink w-[25%] px-6 py-5 text-[15px] font-semibold text-white/85">
                  In-house hire
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, ours, breakFix, inHouse]) => (
                <tr key={label} className="border-site-line border-t">
                  <th scope="row" className="text-site-ink px-6 py-4.5 font-semibold">
                    {label}
                  </th>
                  <td className="bg-site-tint/60 px-6 py-4.5">{cell(ours, true)}</td>
                  <td className="text-site-text px-6 py-4.5">{cell(breakFix)}</td>
                  <td className="text-site-text px-6 py-4.5">{cell(inHouse)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------- testimonials */

function Testimonials() {
  const quotes = useSiteQuotes();
  const { csat, ratings } = useSiteData();
  return (
    <section className="bg-site-night relative isolate overflow-hidden py-24 text-white lg:py-32">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_15%_110%,rgb(255_106_61/0.35),transparent),radial-gradient(50rem_30rem_at_90%_-10%,rgb(47_91_255/0.4),transparent)]" />
      <Container>
        <SectionIntro
          dark
          align="center"
          eyebrow="Client stories"
          title={
            <>
              What our clients <Accent>say.</Accent>
            </>
          }
        />
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {quotes.slice(0, 2).map((q, i) => (
            <Reveal
              key={q.text}
              delay={i * 100}
              as="article"
              className="flex flex-col rounded-[24px] border border-white/12 bg-white/[0.06] p-7 backdrop-blur-md"
            >
              <span className="text-site-ember flex gap-0.5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="size-4 fill-current" />
                ))}
              </span>
              <blockquote className="mt-6 text-xl leading-snug font-medium tracking-[-0.015em]">&ldquo;{q.text}&rdquo;</blockquote>
              <p className="mt-auto pt-8 text-[14px] font-semibold text-white/80">{q.cite}</p>
            </Reveal>
          ))}
          <Reveal delay={200} as="article" className="bg-site-gradient flex flex-col justify-between rounded-[24px] p-7 shadow-[0_30px_60px_-30px_rgb(255_106_61/0.6)]">
            <p className="font-mono text-[11px] tracking-[0.14em] text-white/80 uppercase">Rated by the people we help</p>
            <div>
              <p className="text-7xl leading-none font-semibold tracking-[-0.05em]">{csat}%</p>
              <p className="mt-3 text-[15px] leading-relaxed text-white/85">
                of ticket ratings are positive, from {ratings} ratings left by our clients&apos; staff.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- steps */

const STEPS = [
  { icon: ClipboardCheck, title: "Free IT review", text: "We look at your devices, network, security and licences, then give you a clear, prioritised plan." },
  { icon: Rocket, title: "Smooth onboarding", text: "We document everything, fix the urgent issues first and take over support with no downtime." },
  { icon: LifeBuoy, title: "Ongoing support", text: "Unlimited helpdesk, proactive monitoring and regular reviews that keep improving your IT." },
];

function Steps() {
  const { settings } = useSiteData();
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            eyebrow="How it works"
            title={
              <>
                Switching takes <Accent>three steps.</Accent>
              </>
            }
            intro={`Moving to ${settings.brandName} is planned around you, with nothing lost along the way.`}
          />
          <Reveal>
            <SiteLink href="/site/contact">
              Start with a free review
              <ArrowRight className="arrow" />
            </SiteLink>
          </Reveal>
        </div>
        <ol className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.title}
              as="li"
              delay={i * 100}
              className="border-site-line group relative rounded-[24px] border bg-white p-7 transition-shadow duration-500 hover:shadow-[0_30px_60px_-35px_rgb(10_17_40/0.35)]"
            >
              <div className="flex items-center justify-between">
                <span className="bg-site-soft text-site-muted rounded-full px-3 py-1 font-mono text-[11px] tracking-[0.1em] uppercase">Step {i + 1}</span>
                <span className="bg-site-tint text-site-blue grid size-11 place-items-center rounded-2xl">
                  <step.icon className="size-5" />
                </span>
              </div>
              <h3 className={cn(type.h3, "mt-10 text-[1.35rem]")}>{step.title}</h3>
              <p className="text-site-text mt-2.5 leading-relaxed">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- page */

export function HomePage({ page }: { page: ContentItem }) {
  const { settings, urgentMinutes } = useSiteData();
  const parsed = useMemo(() => parsePageBody(page.body), [page.body]);
  // The CMS "why us" list (bold-led bullets) drives the "why it works" cards;
  // any other sections the editor adds appear further down.
  const featureSection = parsed.sections.find((s) => s.blocks.some((b) => b.kind === "features"));
  const why = featureSection ? sectionIntro(featureSection) : null;
  const whyFeatures = featureSection?.blocks.find((b) => b.kind === "features");
  const otherSections = parsed.sections.filter((s) => s !== featureSection);

  return (
    <>
      <Hero heading={parsed.heading ?? settings.tagline} lead={parsed.lead ?? page.excerpt} />
      <TrustStrip />
      <Approach />
      <ServicesGrid />
      <ProductShowcase />
      <Security />
      <Problems
        title={featureSection?.title ?? "Built to fix what break-fix IT gets wrong"}
        intro={why?.intro ?? null}
        items={whyFeatures?.kind === "features" ? whyFeatures.items : FALLBACK_REASONS}
      />
      <Statement />
      <Comparison />
      <Testimonials />
      <Steps />
      <CmsSections sections={otherSections} />
      <Faq
        items={[
          {
            q: "How quickly will you respond?",
            a: `Urgent issues are picked up within ${urgentMinutes} minutes during service hours (${settings.businessHours}). Everything else is answered the same working day, and you can follow progress in the client portal.`,
          },
          {
            q: "How is pricing worked out?",
            a: "A fixed monthly fee per user, agreed up front after your free review. Projects such as office moves are quoted separately, so there are no surprises.",
          },
          {
            q: "Will you work with our existing setup?",
            a: "Yes. We start by documenting what you already have and only recommend changes that save you time, money or risk.",
          },
          {
            q: "Can we keep our in-house IT person?",
            a: "Of course. Many teams use us alongside an internal IT lead for extra hands, specialist skills and holiday cover.",
          },
          {
            q: "How do our staff raise a ticket?",
            a: "Through the client portal, by email or by phone. Every request gets a reference number so it can be followed to the finish.",
          },
        ]}
      />
      <CtaBand />
    </>
  );
}
