"use client";

import { useMemo } from "react";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";

import { parsePageBody } from "@/lib/site-content";
import type { ContentItem } from "@/lib/types";

import { CmsSections, ContactSection, CtaBand, OtherServices, PageHero, QuoteBlock } from "./sections";
import { Reveal, SiteLink, scrollToId, telHref, useSiteData } from "./site-kit";
import { BrowserFrame, FloatCard, InitialsAvatar, PhotoFrame, UkMap } from "./visuals";

/** The hero picture for a page, chosen from words in its slug. */
function HeroVisual({ slug }: { slug: string }) {
  const { csat, urgentMinutes } = useSiteData();
  if (/cloud|microsoft|365/i.test(slug)) {
    return (
      <div className="relative">
        <BrowserFrame src="/site/app-dashboard.webp" alt="The DeskSupport dashboard showing tickets, response times and satisfaction" priority />
        <FloatCard className="site-float -bottom-6 left-4 w-56 sm:-left-6">
          <p className="text-site-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">Microsoft 365</p>
          <p className="text-site-ink mt-1 text-[13.5px] font-semibold">Mailboxes migrated, zero downtime</p>
        </FloatCard>
      </div>
    );
  }
  const photo = /secur|cyber/i.test(slug)
    ? { src: "/site/photos/server-racks.webp", alt: "Server racks with neatly patched network cables" }
    : /about/i.test(slug)
      ? { src: "/site/photos/engineers.webp", alt: "Two engineers working at their desks in a bright office" }
      : { src: "/site/photos/helping-hand.webp", alt: "Two colleagues working through a problem together at a desk" };
  return (
    <PhotoFrame src={photo.src} alt={photo.alt} className="aspect-[4/3.4]" sizes="(min-width: 1024px) 45vw, 100vw">
      <FloatCard className="site-float -bottom-6 left-4 w-56 sm:-left-6">
        <p className="text-site-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">Urgent response</p>
        <p className="text-site-ink mt-1 text-2xl font-semibold tracking-[-0.03em]">{urgentMinutes} minutes</p>
      </FloatCard>
      <FloatCard className="site-float-delay -top-5 right-4 w-48 sm:-right-6">
        <p className="text-site-ink flex items-center gap-2 text-[13.5px] font-semibold">
          <CheckCircle2 className="size-4 text-emerald-600" />
          {csat}% satisfaction
        </p>
      </FloatCard>
    </PhotoFrame>
  );
}

/** Staff portraits, placed under the About page's "team" section. */
function TeamPortraits() {
  const { team } = useSiteData();
  return (
    <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {team.map((user, i) => (
        <Reveal as="li" key={user.id} delay={i * 60} className="border-site-line rounded-[20px] border bg-white p-5">
          <InitialsAvatar name={user.name} index={i} className="size-12 text-[15px] ring-0" />
          <p className="text-site-ink mt-4 font-semibold tracking-[-0.01em]">{user.name}</p>
          <p className="text-site-muted text-[13.5px]">{user.jobTitle}</p>
        </Reveal>
      ))}
    </ul>
  );
}

export function ContentPage({ page }: { page: ContentItem }) {
  const { services, settings } = useSiteData();
  const parsed = useMemo(() => parsePageBody(page.body), [page.body]);
  const isService = services.some((s) => s.slug === page.slug);
  const teamIndex = page.slug === "about" ? parsed.sections.findIndex((s) => /team|people/i.test(s.title ?? "")) : -1;

  return (
    <>
      <PageHero
        trail={[{ label: "Home", href: "/site" }, ...(isService ? [{ label: "Services", href: "/site#services" }] : []), { label: page.title }]}
        title={parsed.heading ?? page.title}
        lead={parsed.lead ?? page.excerpt}
        visual={<HeroVisual slug={page.slug} />}
      >
        <SiteLink href="/site/contact" size="lg">
          Book a free IT review
          <ArrowRight className="arrow" />
        </SiteLink>
        <SiteLink href={telHref(settings.supportPhone)} variant="outline" size="lg">
          <Phone />
          {settings.supportPhone}
        </SiteLink>
      </PageHero>
      <CmsSections sections={parsed.sections} after={(i) => (i === teamIndex ? <TeamPortraits /> : null)} />
      {parsed.quote && <QuoteBlock quote={parsed.quote} />}
      {isService && <OtherServices current={page.slug} />}
      <CtaBand />
    </>
  );
}

export function ContactPage({ page }: { page: ContentItem }) {
  const { settings } = useSiteData();
  const parsed = useMemo(() => parsePageBody(page.body), [page.body]);
  return (
    <>
      <PageHero
        trail={[{ label: "Home", href: "/site" }, { label: page.title }]}
        title={parsed.heading ?? page.title}
        lead={parsed.lead ?? page.excerpt}
        visual={<UkMap className="mx-auto w-full max-w-[340px] lg:max-w-[420px]" />}
      >
        <SiteLink href="#contact" size="lg" onClick={(e) => scrollToId(e, "contact")}>
          Send an enquiry
          <ArrowRight className="arrow" />
        </SiteLink>
        <SiteLink href={telHref(settings.supportPhone)} variant="outline" size="lg">
          <Phone />
          {settings.supportPhone}
        </SiteLink>
      </PageHero>
      <CmsSections sections={parsed.sections} />
      <ContactSection />
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <PageHero
        trail={[{ label: "Home", href: "/site" }, { label: "Page not found" }]}
        title="Sorry, we can't find that page"
        lead="It may have moved, or the link might be out of date. Everything we do is one click away from the homepage."
      >
        <SiteLink href="/site" size="lg">
          Back to the homepage
          <ArrowRight className="arrow" />
        </SiteLink>
        <SiteLink href="/site/contact" variant="outline" size="lg">
          Contact us
        </SiteLink>
      </PageHero>
      <CtaBand />
    </>
  );
}
