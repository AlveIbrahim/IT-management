"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronRight, LoaderCircle, Mail, Phone } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CmsBlock, CmsSection, FeatureItem } from "@/lib/site-content";
import type { ContentItem, User } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Avatar, ServiceArt, avatarLook, serviceArtKind } from "./illustrations";
import { Container, Eyebrow, Reveal, SiteLink, headingClass, pageHref, siteButton, telHref, useSiteData } from "./site-kit";

/* --------------------------------------------------------------- lists */

type ListItem = { title?: string; text: string };

/** Bullets with a circled chevron, as used throughout the site. */
export function ChevronList({
  items,
  tone = "light",
  columns = 1,
  className,
}: {
  items: ListItem[];
  tone?: "light" | "dark";
  columns?: 1 | 2;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <ul className={cn("grid grid-cols-1 gap-x-10 gap-y-5", columns === 2 && "md:grid-cols-2", className)}>
      {items.map((item, i) => (
        <Reveal as="li" key={`${i}-${item.title ?? item.text}`} delay={i * 70} className="flex items-start gap-3.5">
          <span
            className={cn(
              "mt-[3px] grid size-[22px] shrink-0 place-items-center rounded-full border",
              dark ? "border-white/40 text-white" : "border-site-ink/30 text-site-ink",
            )}
          >
            <ChevronRight className="size-3.5" />
          </span>
          <span className="text-[17px] leading-snug md:text-lg md:leading-snug">
            {item.title && <span className={cn("block font-semibold", dark ? "text-white" : "text-site-ink")}>{item.title}</span>}
            {item.text && (
              <span className={cn("block", item.title && "mt-1", dark ? "text-white/70" : "text-site-text")}>{item.text}</span>
            )}
          </span>
        </Reveal>
      ))}
    </ul>
  );
}

export function featureItems(items: FeatureItem[]): ListItem[] {
  return items.map((f) => ({ title: f.title, text: f.text }));
}

/** Numbered rows for "how it works" style CMS lists. */
function NumberedRows({ items }: { items: FeatureItem[] }) {
  return (
    <ol className="border-site-line border-t">
      {items.map((item, i) => (
        <Reveal as="li" key={item.title} delay={i * 80} className="border-site-line grid grid-cols-[3.5rem_1fr] gap-x-4 border-b py-7">
          <span className="bg-site-tint text-site-ink grid size-11 place-items-center rounded-full text-[15px] font-medium tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>
            <span className="block text-xl font-medium tracking-[-0.015em] md:text-2xl">{item.title}</span>
            {item.text && <span className="text-site-text mt-2 block text-[17px] leading-relaxed">{item.text}</span>}
          </span>
        </Reveal>
      ))}
    </ol>
  );
}

export function CmsBlocks({ blocks }: { blocks: CmsBlock[] }) {
  return (
    <div className="space-y-8">
      {blocks.map((block, i) =>
        block.kind === "checklist" ? (
          <ChevronList key={i} items={block.items.map((text) => ({ text }))} columns={block.items.length > 3 ? 2 : 1} />
        ) : block.kind === "features" ? (
          <NumberedRows key={i} items={block.items} />
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
 * CMS sections as an editorial two-column layout: heading left, content right.
 * `after` can add designed content below a section's own blocks.
 */
export function CmsSections({ sections, after }: { sections: CmsSection[]; after?: (index: number) => React.ReactNode }) {
  if (sections.length === 0) return null;
  return (
    <section className="py-20 lg:py-28">
      <Container className="space-y-16 lg:space-y-24">
        {sections.map((section, i) => (
          <div
            key={i}
            className={cn("grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16", i > 0 && "border-site-line border-t pt-16 lg:pt-24")}
          >
            {section.title && (
              <Reveal className="lg:col-span-5">
                <h2 className={cn(headingClass.sub, "lg:text-[2.5rem] lg:leading-[1.1]")}>{section.title}</h2>
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

/* ------------------------------------------------------------- mockups */

/**
 * A laptop showing a real screenshot of the DeskSupport Hub. "screen" is the
 * lid alone, for cropping inside a panel; "full" adds the base.
 */
export function Laptop({
  src,
  alt,
  variant = "full",
  sizes = "(min-width: 1024px) 60vw, 100vw",
  className,
}: {
  src: string;
  alt: string;
  variant?: "full" | "screen";
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative rounded-[18px] bg-[#0c1d1e] p-2 ring-1 ring-black/30 sm:rounded-[26px] sm:p-3.5">
        <span aria-hidden className="absolute top-0 left-1/2 z-10 h-4 w-[13%] -translate-x-1/2 rounded-b-lg bg-[#0c1d1e] sm:h-6" />
        <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-white sm:rounded-[12px]">
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-[0%_0%]" />
        </div>
      </div>
      {variant === "full" && (
        <div aria-hidden className="relative -mx-[7%] h-3 rounded-t-[3px] rounded-b-[18px] bg-[#2b3a3b] sm:h-5">
          <span className="absolute top-0 left-1/2 h-1.5 w-[15%] -translate-x-1/2 rounded-b-md bg-[#1b2627] sm:h-2" />
        </div>
      )}
    </div>
  );
}

/** Round, tilted sticker in the style of a printed label. */
export function Sticker({ title, note, className }: { title: string; note?: string; className?: string }) {
  return (
    <div
      className={cn(
        "bg-site-sun text-site-deep grid aspect-square place-items-center rounded-full text-center [container-type:inline-size]",
        "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:rotate-6",
        className,
      )}
    >
      <div className="-rotate-[14deg] px-[11%]">
        <p className="text-[22cqw] leading-[0.95] font-extrabold tracking-[-0.04em] italic">{title}</p>
        {note && <p className="mt-[5cqw] text-[7.4cqw] leading-tight font-semibold italic">{note}</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- hero */

export function PageHero({
  trail,
  title,
  lead,
  art,
  children,
}: {
  trail: { label: string; href?: string }[];
  title: string;
  lead?: string | null;
  art?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-site-deep relative overflow-hidden text-white">
      <Container className="grid grid-cols-1 items-center gap-12 pt-12 pb-20 lg:grid-cols-12 lg:gap-10 lg:pt-16 lg:pb-28">
        <div className={art ? "lg:col-span-7" : "lg:col-span-10"}>
          <nav aria-label="Breadcrumb" className="site-enter flex flex-wrap items-center gap-1.5 text-[15px] text-white/60">
            {trail.map((crumb, i) => (
              <span key={crumb.label} className="inline-flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5 opacity-60" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-white">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-white/90">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
          <h1 className={cn(headingClass.hero, "site-enter text-site-mint mt-8 lg:text-[4.5rem]")} style={{ animationDelay: "80ms" }}>
            {title}
          </h1>
          {lead && (
            <p
              className="site-enter mt-7 max-w-2xl text-lg leading-relaxed text-pretty text-white/80 md:text-xl md:leading-relaxed"
              style={{ animationDelay: "160ms" }}
            >
              {lead}
            </p>
          )}
          {children && (
            <div className="site-enter mt-10 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
              {children}
            </div>
          )}
        </div>
        {art && (
          <div className="site-enter lg:col-span-5" style={{ animationDelay: "200ms" }}>
            {art}
          </div>
        )}
      </Container>
    </section>
  );
}

/** Illustration on a sunny square, used for services. */
export function ArtPanel({ kind, className }: { kind: string; className?: string }) {
  return (
    <div className={cn("bg-site-sun-soft grid aspect-square place-items-center rounded-[2rem] p-[10%]", className)}>
      <ServiceArt kind={serviceArtKind(kind)} className="w-full" />
    </div>
  );
}

/* --------------------------------------------------------- testimonial */

export function QuoteBlock({ quote, className }: { quote: { text: string; cite: string | null }; className?: string }) {
  return (
    <section className={cn("pb-20 lg:pb-28", className)}>
      <Container>
        <Reveal className="bg-site-tint relative overflow-hidden rounded-[2rem] px-7 py-14 sm:px-14 lg:px-20 lg:py-20">
          <span aria-hidden className="text-site-ink/15 absolute -top-6 right-8 font-serif text-[12rem] leading-none select-none sm:right-14">
            &rdquo;
          </span>
          <figure className="relative max-w-4xl">
            <blockquote className="text-[1.65rem] leading-[1.25] font-medium tracking-[-0.02em] text-balance md:text-[2.4rem] md:leading-[1.2]">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            {quote.cite && <figcaption className="text-site-text mt-8 text-lg">{quote.cite}</figcaption>}
          </figure>
        </Reveal>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- team */

export function TeamMember({ user, size = "md", tone = "light" }: { user: User; size?: "md" | "lg"; tone?: "light" | "dark" }) {
  return (
    <figure className="text-center">
      <Avatar look={avatarLook(user.id)} className={cn("mx-auto", size === "lg" ? "w-40 sm:w-44" : "w-28 sm:w-32")} />
      <figcaption className="mt-4">
        <span className={cn("block text-lg font-medium", tone === "dark" ? "text-white" : "text-site-ink")}>{user.name}</span>
        <span className={cn("block text-[15px]", tone === "dark" ? "text-white/60" : "text-site-text")}>{user.jobTitle}</span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------ contact */

const TOPICS = ["Managed IT support", "Cyber security", "Cloud & Microsoft 365", "Something else"];

const fieldClass =
  "font-display text-site-ink placeholder:text-site-ink/40 h-12 rounded-xl border-site-line bg-white px-4 text-base shadow-none focus-visible:border-site-ink focus-visible:ring-site-ink/15 md:text-base";

function EnquiryForm() {
  const { lead } = useSiteData();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);

  if (state === "sent") {
    return (
      <div role="status" className="site-fade rounded-3xl bg-white p-8 sm:p-10">
        <span className="bg-primary text-primary-foreground grid size-14 place-items-center rounded-full">
          <Check className="size-7" />
        </span>
        <h3 className={cn(headingClass.sub, "mt-6")}>Thanks{name ? `, ${name.split(" ")[0]}` : ""}. We&apos;ve got your message.</h3>
        <p className="text-site-text mt-3 text-lg leading-relaxed">
          {lead ? `${lead.name.split(" ")[0]} or someone from the team` : "Someone from our team"} will get back to you within one working day.
        </p>
        <button
          type="button"
          onClick={() => {
            setName("");
            setState("idle");
          }}
          className={cn(siteButton({ variant: "inkOutline" }), "mt-8")}
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
        <span className="text-[15px]">Your name</span>
        <Input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} placeholder="Jane Smith" />
      </label>
      <label className="grid gap-2">
        <span className="text-[15px]">Company</span>
        <Input autoComplete="organization" className={fieldClass} placeholder="Smith & Co" />
      </label>
      <label className="grid gap-2">
        <span className="text-[15px]">Email</span>
        <Input required type="email" autoComplete="email" className={fieldClass} placeholder="jane@smithandco.co.uk" />
      </label>
      <label className="grid gap-2">
        <span className="text-[15px]">Phone</span>
        <Input type="tel" autoComplete="tel" className={fieldClass} placeholder="Optional" />
      </label>
      <div className="grid gap-2 sm:col-span-2">
        <span id="enquiry-topic" className="text-[15px]">
          What can we help with?
        </span>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger aria-labelledby="enquiry-topic" className={cn(fieldClass, "w-full data-[size=default]:h-12")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="font-display">
            {TOPICS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <label className="grid gap-2 sm:col-span-2">
        <span className="text-[15px]">Message</span>
        <Textarea
          required
          rows={5}
          className={cn(fieldClass, "h-auto min-h-36 py-3")}
          placeholder="Tell us a little about your business and your IT"
        />
      </label>
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-site-text text-sm">We&apos;ll only use your details to reply to this enquiry.</p>
        <button type="submit" disabled={state === "sending"} className={cn(siteButton({ size: "lg" }), "shrink-0")}>
          {state === "sending" ? (
            <>
              <LoaderCircle className="animate-spin" />
              Sending…
            </>
          ) : (
            "Send enquiry"
          )}
        </button>
      </div>
    </form>
  );
}

/** "Send an enquiry" form beside a named person to call: the end of most pages. */
export function ContactSection({ heading = "Send an enquiry", id = "contact" }: { heading?: string; id?: string }) {
  const { lead, settings } = useSiteData();
  return (
    <section id={id} className="bg-site-soft scroll-mt-24 py-24 lg:py-32">
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <h2 className={headingClass.section}>{heading}</h2>
          <p className="text-site-text mt-5 max-w-xl text-lg leading-relaxed">
            Tell us what&apos;s going on and we&apos;ll get back to you within one working day. No hard sell, just straight answers.
          </p>
          <div className="mt-10">
            <EnquiryForm />
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-5 lg:pl-6">
          <h2 className={headingClass.sub}>Or call us directly</h2>
          <div className="mt-8 flex items-center gap-6">
            {lead && <Avatar look={avatarLook(lead.id)} className="w-28 shrink-0 sm:w-32" />}
            <div className="min-w-0">
              {lead && (
                <>
                  <p className="text-xl font-medium">{lead.name}</p>
                  <p className="text-site-text">{lead.jobTitle}</p>
                </>
              )}
              <a href={telHref(settings.supportPhone)} className="mt-3 flex items-center gap-2 text-lg hover:underline">
                <Phone className="size-[18px]" />
                {settings.supportPhone}
              </a>
              <a href={`mailto:${settings.supportEmail}`} className="mt-1 flex items-center gap-2 break-all hover:underline">
                <Mail className="size-[18px] shrink-0" />
                {settings.supportEmail}
              </a>
            </div>
          </div>
          <p className="text-site-text mt-6">Lines are open {settings.businessHours}.</p>

          <div className="mt-12 rounded-3xl bg-white p-7 sm:p-8">
            <p className="text-xl font-medium">Already a client?</p>
            <p className="text-site-text mt-2 leading-relaxed">
              Raise a ticket, follow its progress and find quick fixes in the {settings.brandName} client portal.
            </p>
            <SiteLink href="/login" variant="ink" className="mt-6">
              Open the client portal
              <ArrowRight />
            </SiteLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------ other services */

export function OtherServices({ current }: { current: string }) {
  const { services } = useSiteData();
  const others = services.filter((s) => s.slug !== current);
  if (others.length === 0) return null;
  return (
    <section className="pb-24 lg:pb-32">
      <Container>
        <Reveal>
          <Eyebrow className="text-site-text">Explore more</Eyebrow>
          <h2 className={cn(headingClass.sub, "mt-2")}>Our other services</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {others.slice(0, 4).map((s, i) => (
            <Reveal key={s.id} delay={i * 90}>
              <ServiceCard page={s} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ServiceCard({ page }: { page: ContentItem }) {
  return (
    <Link
      href={pageHref(page)}
      className="group border-site-line hover:border-site-ink/40 flex h-full items-center gap-6 rounded-3xl border p-5 transition-colors duration-300 outline-none focus-visible:ring-[3px] focus-visible:ring-site-ink/30 sm:p-6"
    >
      <span className="bg-site-sun-soft grid size-28 shrink-0 place-items-center rounded-2xl p-2 sm:size-32">
        <ServiceArt kind={serviceArtKind(`${page.slug} ${page.title}`)} className="transition-transform duration-500 group-hover:scale-105" />
      </span>
      <span className="min-w-0">
        <span className="block text-xl font-medium tracking-[-0.015em] md:text-2xl">{page.title}</span>
        <span className="text-site-text mt-2 block leading-relaxed">{page.excerpt}</span>
        <span className="mt-3 inline-flex items-center gap-1.5 font-medium">
          Learn more
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  );
}
