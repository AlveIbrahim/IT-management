"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, LoaderCircle, Mail, Phone, Plus } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CmsBlock, CmsSection, FeatureItem } from "@/lib/site-content";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ServiceIcon } from "./site-shell";
import { Accent, Container, Eyebrow, Reveal, SectionIntro, SiteLink, pageHref, siteButton, splitAccent, telHref, type, useSiteData } from "./site-kit";
import { InitialsAvatar } from "./visuals";

/** Headline with its last words set as the serif accent. */
export function AccentTitle({ text, words = 2 }: { text: string; words?: number }) {
  const { head, tail, stop } = splitAccent(text, words);
  return (
    <>
      {head} <Accent>{tail}</Accent>
      {stop}
    </>
  );
}

/* ---------------------------------------------------------- CMS blocks */

function CheckGrid({ items }: { items: string[] }) {
  return (
    <ul className={cn("grid grid-cols-1 gap-3", items.length > 3 && "sm:grid-cols-2")}>
      {items.map((item, i) => (
        <Reveal
          as="li"
          key={`${i}-${item}`}
          delay={i * 50}
          className="border-site-line text-site-ink flex items-start gap-3 rounded-2xl border bg-white p-4 text-[15.5px] leading-snug font-medium"
        >
          <span className="bg-site-tint text-site-blue mt-px grid size-6 shrink-0 place-items-center rounded-full">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          {item}
        </Reveal>
      ))}
    </ul>
  );
}

function NumberedCards({ items }: { items: FeatureItem[] }) {
  return (
    <ol className={cn("grid grid-cols-1 gap-3", items.length % 2 === 0 && "sm:grid-cols-2")}>
      {items.map((item, i) => (
        <Reveal as="li" key={item.title} delay={i * 70} className="border-site-line rounded-[20px] border bg-white p-6">
          <span className="text-site-ember font-mono text-[12px] tracking-[0.1em]">{String(i + 1).padStart(2, "0")}</span>
          <p className="text-site-ink mt-3 text-lg font-semibold tracking-[-0.02em]">{item.title}</p>
          {item.text && <p className="text-site-text mt-1.5 text-[15px] leading-relaxed">{item.text}</p>}
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
          <CheckGrid key={i} items={block.items} />
        ) : block.kind === "features" ? (
          <NumberedCards key={i} items={block.items} />
        ) : (
          <Reveal key={i}>
            <div className="site-prose" dangerouslySetInnerHTML={{ __html: block.html }} />
          </Reveal>
        ),
      )}
    </div>
  );
}

/**
 * CMS sections as an editorial two-column layout: heading on the left,
 * content on the right. `after` can add designed content below a section.
 */
export function CmsSections({ sections, after }: { sections: CmsSection[]; after?: (index: number) => React.ReactNode }) {
  if (sections.length === 0) return null;
  return (
    <section className="py-20 lg:py-28">
      <Container className="space-y-16 lg:space-y-24">
        {sections.map((section, i) => (
          <div key={i} className={cn("grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16", i > 0 && "border-site-line border-t pt-16 lg:pt-24")}>
            {section.title && (
              <Reveal className="lg:col-span-5">
                <Eyebrow>{String(i + 1).padStart(2, "0")}</Eyebrow>
                <h2 className={cn(type.h2, "mt-4 lg:text-[2.6rem]")}>{section.title}</h2>
              </Reveal>
            )}
            <div className={section.title ? "lg:col-span-7" : "lg:col-span-12"}>
              <CmsBlocks blocks={section.blocks} />
              {after?.(i)}
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

/* ----------------------------------------------------------------- hero */

export function PageHero({
  trail,
  title,
  lead,
  visual,
  visualStill = false,
  children,
}: {
  trail: { label: string; href?: string }[];
  title: string;
  lead?: string | null;
  visual?: React.ReactNode;
  /** Show the visual without an entrance animation (e.g. the map). */
  visualStill?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#eef2ff_0%,#f6f8fd_70%,#ffffff_100%)]" />
      <div aria-hidden className="site-grid-lines absolute inset-0 -z-10" />
      <div aria-hidden className="absolute -top-48 -right-40 -z-10 size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(123_92_255/0.16),transparent)]" />
      <Container className="grid grid-cols-1 items-center gap-12 pt-10 pb-20 lg:grid-cols-12 lg:gap-12 lg:pt-14 lg:pb-24">
        <div className={visual ? "lg:col-span-6" : "lg:col-span-9"}>
          <nav aria-label="Breadcrumb" className="site-enter text-site-muted flex flex-wrap items-center gap-1.5 font-mono text-[12px] tracking-[0.08em] uppercase">
            {trail.map((crumb, i) => (
              <span key={crumb.label} className="inline-flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5 opacity-60" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-site-ink transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-site-ink">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
          <h1 className={cn(type.display, "site-enter mt-6 lg:text-[4rem]")} style={{ animationDelay: "80ms" }}>
            <AccentTitle text={title} words={title.split(" ").length > 3 ? 2 : 1} />
          </h1>
          {lead && (
            <p className={cn(type.lead, "site-enter text-site-text mt-6 max-w-xl")} style={{ animationDelay: "160ms" }}>
              {lead}
            </p>
          )}
          {children && (
            <div className="site-enter mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
              {children}
            </div>
          )}
        </div>
        {visual && (
          <div className={cn("relative lg:col-span-6", !visualStill && "site-enter")} style={visualStill ? undefined : { animationDelay: "200ms" }}>
            {visual}
          </div>
        )}
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- quote */

export function QuoteBlock({ quote }: { quote: { text: string; cite: string | null } }) {
  return (
    <section className="pb-20 lg:pb-28">
      <Container>
        <Reveal className="bg-site-night relative isolate overflow-hidden rounded-[32px] px-7 py-14 text-white sm:px-14 lg:px-20 lg:py-20">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_20rem_at_100%_0%,rgb(47_91_255/0.45),transparent),radial-gradient(36rem_20rem_at_0%_120%,rgb(255_106_61/0.35),transparent)]" />
          <figure className="max-w-4xl">
            <span className="text-gradient font-serif text-7xl leading-none italic">&ldquo;</span>
            <blockquote className="mt-2 text-[1.65rem] leading-[1.25] font-semibold tracking-[-0.025em] text-balance md:text-[2.3rem] md:leading-[1.2]">
              {quote.text}
            </blockquote>
            {quote.cite && <figcaption className="mt-8 font-mono text-[12px] tracking-[0.1em] text-white/60 uppercase">{quote.cite}</figcaption>}
          </figure>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ */

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-site-soft py-24 lg:py-32">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionIntro
            eyebrow="FAQ"
            title={
              <>
                Questions, <Accent>answered.</Accent>
              </>
            }
            intro="Can't see what you're looking for? Call us and talk to an engineer."
          />
        </div>
        <div className="space-y-3 lg:col-span-8">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 60} className="border-site-line overflow-hidden rounded-[20px] border bg-white">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="text-site-ink flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-[17px] font-semibold tracking-[-0.01em] outline-none focus-visible:ring-[3px] focus-visible:ring-site-blue/30 focus-visible:ring-inset"
                  >
                    {item.q}
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full border transition-[transform,background-color,color,border-color] duration-300",
                        isOpen ? "bg-site-ink border-site-ink rotate-45 text-white" : "border-site-line text-site-ink",
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-${i}`}
                  inert={!isOpen}
                  className={cn("grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                >
                  <div className="overflow-hidden">
                    <p className="text-site-text px-6 pb-6 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ CTA */

export function CtaBand() {
  const { settings } = useSiteData();
  return (
    <section className="bg-site-night relative isolate overflow-hidden py-28 text-white lg:py-36">
      <div aria-hidden className="site-grid-lines-dark absolute inset-0 -z-10" />
      <div aria-hidden className="site-drift absolute bottom-[-9rem] left-1/2 -z-10 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_106_61/0.38),rgb(123_92_255/0.16)_55%,transparent_85%)]" />
      <Container className="max-w-4xl text-center">
        <Reveal>
          <Eyebrow dark className="justify-center">
            Free · No obligation · 30 minutes
          </Eyebrow>
          <h2 className="mt-6 text-[2.3rem] leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-[4rem]">
            Let&apos;s make IT the <Accent>easy part</Accent> of your business.
          </h2>
          <p className={cn(type.lead, "mx-auto mt-6 max-w-2xl text-white/65")}>
            Book a free IT review. We&apos;ll show you exactly where you can save time, money and risk, and what we&apos;d fix first.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <SiteLink href="/site/contact" size="lg">
              Book a free IT review
              <ArrowRight className="arrow" />
            </SiteLink>
            <SiteLink href={telHref(settings.supportPhone)} variant="glass" size="lg">
              <Phone />
              {settings.supportPhone}
            </SiteLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------- more services */

export function OtherServices({ current }: { current: string }) {
  const { services } = useSiteData();
  const others = services.filter((s) => s.slug !== current);
  if (others.length === 0) return null;
  return (
    <section className="pb-24 lg:pb-32">
      <Container>
        <SectionIntro
          eyebrow="Explore more"
          title={
            <>
              Our other <Accent>services.</Accent>
            </>
          }
        />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {others.slice(0, 4).map((s, i) => (
            <Reveal key={s.id} delay={i * 90}>
              <ServiceLinkCard page={s} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ServiceLinkCard({ page }: { page: ContentItem }) {
  return (
    <Link
      href={pageHref(page)}
      className="group border-site-line hover:border-site-blue/30 flex h-full items-start gap-5 rounded-[24px] border bg-white p-6 transition-[border-color,box-shadow,transform] duration-500 outline-none hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-36px_rgb(10_17_40/0.35)] focus-visible:ring-[3px] focus-visible:ring-site-blue/30 sm:p-7"
    >
      <span className="bg-site-tint text-site-blue group-hover:bg-site-blue grid size-12 shrink-0 place-items-center rounded-2xl transition-colors duration-300 group-hover:text-white">
        <ServiceIcon name={`${page.slug} ${page.title}`} className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-site-ink flex items-center justify-between gap-3 text-xl font-semibold tracking-[-0.02em]">
          {page.title}
          <ArrowUpRight className="text-site-muted size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
        <span className="text-site-text mt-2 block leading-relaxed">{page.excerpt}</span>
      </span>
    </Link>
  );
}

/* --------------------------------------------------------------- contact */

const TOPICS = ["Managed IT support", "Cyber security", "Cloud & Microsoft 365", "Something else"];
const field =
  "text-site-ink placeholder:text-site-muted/70 border-site-line focus:border-site-blue focus:ring-site-blue/15 h-12 w-full rounded-xl border bg-white px-4 text-[15px] outline-none transition-[border-color,box-shadow] focus:ring-4";

function EnquiryForm() {
  const { lead } = useSiteData();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);

  if (state === "sent") {
    return (
      <div role="status" className="site-fade py-6">
        <span className="bg-site-gradient grid size-14 place-items-center rounded-full text-white">
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <h3 className={cn(type.h3, "mt-6 text-2xl")}>Thanks{name ? `, ${name.split(" ")[0]}` : ""}. We&apos;ve got your message.</h3>
        <p className="text-site-text mt-2 leading-relaxed">
          {lead ? `${lead.name.split(" ")[0]} or someone from the team` : "Someone from our team"} will be in touch within one working day.
        </p>
        <button
          type="button"
          onClick={() => {
            setName("");
            setState("idle");
          }}
          className={cn(siteButton({ variant: "outline" }), "mt-8")}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setState("sending");
        window.setTimeout(() => setState("sent"), 900);
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <label className="grid gap-2">
        <span className="text-site-ink text-[14px] font-medium">Your name</span>
        <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Jane Smith" />
      </label>
      <label className="grid gap-2">
        <span className="text-site-ink text-[14px] font-medium">Company</span>
        <input autoComplete="organization" className={field} placeholder="Smith & Co" />
      </label>
      <label className="grid gap-2">
        <span className="text-site-ink text-[14px] font-medium">Work email</span>
        <input required type="email" autoComplete="email" className={field} placeholder="jane@smithandco.co.uk" />
      </label>
      <label className="grid gap-2">
        <span className="text-site-ink text-[14px] font-medium">Phone</span>
        <input type="tel" autoComplete="tel" className={field} placeholder="Optional" />
      </label>
      <div className="grid gap-2 sm:col-span-2">
        <span id="enquiry-topic" className="text-site-ink text-[14px] font-medium">
          What can we help with?
        </span>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger aria-labelledby="enquiry-topic" className={cn(field, "data-[size=default]:h-12 shadow-none")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="font-sans">
            {TOPICS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <label className="grid gap-2 sm:col-span-2">
        <span className="text-site-ink text-[14px] font-medium">Message</span>
        <textarea required rows={5} className={cn(field, "h-auto min-h-36 py-3")} placeholder="Tell us a little about your business and your IT" />
      </label>
      <label className="text-site-text flex items-start gap-3 text-[13.5px] leading-snug sm:col-span-2">
        <input required type="checkbox" className="accent-site-blue mt-0.5 size-4 shrink-0" />
        I&apos;m happy for you to use these details to reply to my enquiry.
      </label>
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className={siteButton({ size: "lg" })}>
          {state === "sending" ? (
            <>
              <LoaderCircle className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send enquiry
              <ArrowRight className="arrow" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/** Enquiry form card beside a named person to call. */
export function ContactSection({ id = "contact" }: { id?: string }) {
  const { lead, settings } = useSiteData();
  return (
    <section id={id} className="bg-site-soft scroll-mt-24 py-24 lg:py-32">
      <Container className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Reveal className="border-site-line rounded-[28px] border bg-white p-7 shadow-[0_30px_60px_-40px_rgb(10_17_40/0.3)] sm:p-10 lg:col-span-7">
          <div className="flex items-center gap-3">
            <span className="bg-site-tint text-site-blue grid size-11 place-items-center rounded-2xl">
              <Mail className="size-5" />
            </span>
            <h2 className={cn(type.h3, "text-2xl")}>Send an enquiry</h2>
          </div>
          <p className="text-site-text mt-3 mb-8 leading-relaxed">We reply within one working day. No hard sell, just straight answers.</p>
          <EnquiryForm />
        </Reveal>
        <Reveal delay={120} className="flex flex-col gap-6 lg:col-span-5">
          <div className="bg-site-night relative isolate overflow-hidden rounded-[28px] p-8 text-white sm:p-10">
            <div aria-hidden className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(123_92_255/0.5),transparent)]" />
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
                <Phone className="size-5" />
              </span>
              <h2 className={cn(type.h3, "text-2xl")}>Or call us directly</h2>
            </div>
            {lead && (
              <div className="mt-8 flex items-center gap-4">
                <InitialsAvatar name={lead.name} index={1} className="size-16 text-lg ring-white/10" />
                <p className="leading-snug text-white/70">
                  <span className="block text-lg font-semibold text-white">{lead.name}</span>
                  {lead.jobTitle}, happy to help
                </p>
              </div>
            )}
            <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-white/50">Phone</dt>
                <dd>
                  <a href={telHref(settings.supportPhone)} className="font-semibold hover:underline">
                    {settings.supportPhone}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/50">Email</dt>
                <dd>
                  <a href={`mailto:${settings.supportEmail}`} className="font-semibold break-all hover:underline">
                    {settings.supportEmail}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/50">Hours</dt>
                <dd className="font-semibold">{settings.businessHours}</dd>
              </div>
            </dl>
          </div>
          <div className="border-site-line rounded-[28px] border bg-white p-8">
            <p className="text-site-ink text-lg font-semibold tracking-[-0.02em]">Already a client?</p>
            <p className="text-site-text mt-2 leading-relaxed">Raise a ticket, follow its progress and find quick fixes in the {settings.brandName} client portal.</p>
            <SiteLink href="/login" variant="dark" className="mt-6">
              Open the client portal
              <ArrowRight className="arrow" />
            </SiteLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
