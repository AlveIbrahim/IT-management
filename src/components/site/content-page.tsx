"use client";

import { useMemo } from "react";
import { Phone } from "lucide-react";

import { parsePageBody } from "@/lib/site-content";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Avatar, avatarLook } from "./illustrations";
import { ArtPanel, CmsSections, ContactSection, OtherServices, PageHero, QuoteBlock, Sticker, TeamMember } from "./sections";
import { Container, Reveal, SiteLink, headingClass, scrollToId, telHref, useSiteData } from "./site-kit";

/** Four portraits on a sunny square: the About page's hero art. */
function TeamArt() {
  const { team } = useSiteData();
  return (
    <div className="bg-site-sun-soft relative grid aspect-square grid-cols-2 place-items-center gap-4 rounded-[2rem] p-[12%]">
      {team.slice(0, 4).map((user, i) => (
        <Avatar
          key={user.id}
          look={avatarLook(user.id)}
          className={cn("w-full max-w-44", i % 2 === 1 && "translate-y-[18%]", i < 2 && "-translate-y-[6%]")}
        />
      ))}
    </div>
  );
}

/** The service desk lead, saying hello: the Contact page's hero art. */
function ContactArt() {
  const { lead, settings } = useSiteData();
  if (!lead) return null;
  return (
    <div className="relative mx-auto max-w-md pt-8 pb-4">
      <Avatar look={avatarLook(lead.id)} className="mx-auto w-[62%]" />
      <div
        className="site-pop text-site-ink absolute top-0 left-0 max-w-[15rem] rounded-3xl rounded-bl-md bg-white px-5 py-4 text-lg leading-snug shadow-[0_20px_40px_-20px_rgb(0_0_0/0.5)]"
        style={{ animationDelay: "500ms" }}
      >
        Hi, I&apos;m {lead.name.split(" ")[0]}. How can we help?
      </div>
      <Sticker
        title="Free!"
        note={`(IT review, no strings at ${settings.brandName})`}
        className="absolute right-0 bottom-0 w-[34%] min-w-28"
      />
    </div>
  );
}

/** Staff portraits, placed under the About page's "team" section. */
function TeamPortraits() {
  const { team } = useSiteData();
  return (
    <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
      {team.map((user, i) => (
        <Reveal key={user.id} delay={i * 70}>
          <TeamMember user={user} />
        </Reveal>
      ))}
    </div>
  );
}

/** Fallback when the About page has no "team" section to sit under. */
function TeamGrid() {
  const { team, settings } = useSiteData();
  if (team.length === 0) return null;
  return (
    <section className="bg-site-soft py-24 lg:py-32">
      <Container>
        <Reveal className="max-w-2xl">
          <h2 className={headingClass.section}>Meet the team</h2>
          <p className="text-site-text mt-5 text-lg leading-relaxed">
            The people who answer when you call {settings.brandName}. No call centre and no scripts.
          </p>
        </Reveal>
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
          {team.map((user, i) => (
            <Reveal key={user.id} delay={i * 70}>
              <TeamMember user={user} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function ContentPage({ page }: { page: ContentItem }) {
  const { services, settings } = useSiteData();
  const parsed = useMemo(() => parsePageBody(page.body), [page.body]);
  const isService = services.some((s) => s.slug === page.slug);
  const isAbout = page.slug === "about";
  const teamIndex = isAbout ? parsed.sections.findIndex((s) => /team|people/i.test(s.title ?? "")) : -1;

  return (
    <>
      <PageHero
        trail={[{ label: "Home", href: "/site" }, { label: page.title }]}
        title={parsed.heading ?? page.title}
        lead={parsed.lead ?? page.excerpt}
        art={isService ? <ArtPanel kind={`${page.slug} ${page.title}`} /> : isAbout ? <TeamArt /> : null}
      >
        <SiteLink href="/site/contact" size="lg">
          Book a free IT review
        </SiteLink>
        <SiteLink href={telHref(settings.supportPhone)} variant="lightOutline" size="lg">
          <Phone />
          {settings.supportPhone}
        </SiteLink>
      </PageHero>
      <CmsSections sections={parsed.sections} after={(i) => (i === teamIndex ? <TeamPortraits /> : null)} />
      {isAbout && teamIndex === -1 && <TeamGrid />}
      {parsed.quote && <QuoteBlock quote={parsed.quote} className={isAbout ? "pt-20 lg:pt-28" : undefined} />}
      {isService && <OtherServices current={page.slug} />}
      <ContactSection />
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
        art={<ContactArt />}
      >
        <SiteLink href="#contact" size="lg" onClick={(e) => scrollToId(e, "contact")}>
          Send an enquiry
        </SiteLink>
        <SiteLink href={telHref(settings.supportPhone)} variant="lightOutline" size="lg">
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
        </SiteLink>
        <SiteLink href="/site/contact" variant="lightOutline" size="lg">
          Contact us
        </SiteLink>
      </PageHero>
      <ContactSection />
    </>
  );
}
