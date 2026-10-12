"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronRight, CircleCheck, Clock, LifeBuoy, LoaderCircle, Mail, Phone, Send } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parsePageBody } from "@/lib/site-content";
import type { ContentItem } from "@/lib/types";

import { CmsSectionView, CtaSection, PageHero, QuoteCard } from "./sections";
import { Container, PageIcon, Reveal, SiteLink, pageHref, pageIcon, siteButton, useSiteData } from "./site-kit";

function ExpertCard() {
  const { settings } = useSiteData();
  return (
    <div className="bg-card rounded-2xl border p-6 shadow-[0_20px_50px_-35px_rgb(0_0_0/0.35)]">
      <p className="font-display text-lg font-semibold tracking-tight">Talk to an expert</p>
      <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Straight answers about your IT, with no hard sell.</p>
      <div className="mt-5 space-y-2">
        <a
          href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
          className="hover:bg-muted/60 flex items-center gap-3 rounded-xl border p-3 transition-colors"
        >
          <span className="bg-primary/35 text-brand-ink grid size-10 place-items-center rounded-lg">
            <Phone className="size-[18px]" />
          </span>
          <span>
            <span className="text-muted-foreground block text-xs">Call us</span>
            <span className="text-sm font-semibold">{settings.supportPhone}</span>
          </span>
        </a>
        <a
          href={`mailto:${settings.supportEmail}`}
          className="hover:bg-muted/60 flex items-center gap-3 rounded-xl border p-3 transition-colors"
        >
          <span className="bg-primary/35 text-brand-ink grid size-10 place-items-center rounded-lg">
            <Mail className="size-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="text-muted-foreground block text-xs">Email us</span>
            <span className="block truncate text-sm font-semibold">{settings.supportEmail}</span>
          </span>
        </a>
      </div>
      <p className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
        <Clock className="size-3.5" />
        {settings.businessHours}
      </p>
      <SiteLink href="/site/contact" className="mt-5 w-full">
        Book a free IT review
        <ArrowRight />
      </SiteLink>
    </div>
  );
}

function OtherServices({ current }: { current: string }) {
  const { services } = useSiteData();
  const others = services.filter((s) => s.slug !== current);
  if (!others.length) return null;
  return (
    <div className="rounded-2xl border p-2">
      <p className="text-muted-foreground px-3 pt-3 pb-2 text-xs font-semibold tracking-[0.08em] uppercase">
        {services.some((s) => s.slug === current) ? "Other services" : "Our services"}
      </p>
      {others.map((s) => (
          <Link key={s.id} href={pageHref(s)} className="group hover:bg-muted/60 flex items-center gap-3 rounded-xl p-3 transition-colors">
            <PageIcon slug={s.slug} className="text-brand-ink size-[18px]" />
            <span className="flex-1 text-sm font-medium">{s.title}</span>
            <ChevronRight className="text-muted-foreground size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
      ))}
    </div>
  );
}

export function ContentPage({ page }: { page: ContentItem }) {
  const { services } = useSiteData();
  const parsed = useMemo(() => parsePageBody(page.body), [page.body]);
  const isService = services.some((s) => s.id === page.id);

  return (
    <>
      <PageHero
        trail={[{ label: "Home", href: "/site" }, ...(isService ? [{ label: "Services" }] : []), { label: page.title }]}
        title={parsed.heading ?? page.title}
        lead={parsed.lead ?? page.excerpt}
        icon={pageIcon(page.slug)}
      >
        <SiteLink href="/site/contact" size="lg">
          {isService ? "Get a free IT review" : "Get in touch"}
          <ArrowRight />
        </SiteLink>
        {isService && (
          <SiteLink href="/site/about" variant="outline" size="lg">
            Why choose us
          </SiteLink>
        )}
      </PageHero>

      <section className="pt-20 pb-4 md:pt-28 md:pb-8">
        <Container className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 space-y-16 lg:col-span-8">
            {parsed.sections.map((section, i) => (
              <CmsSectionView key={i} section={section} />
            ))}
            {parsed.quote && <QuoteCard quote={parsed.quote} />}
            {parsed.sections.length === 0 && !parsed.quote && (
              <p className="text-muted-foreground text-lg leading-relaxed">{page.excerpt}</p>
            )}
          </div>
          <aside className="lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-28">
              <ExpertCard />
              <OtherServices current={page.slug} />
            </div>
          </aside>
        </Container>
      </section>

      <CtaSection />
    </>
  );
}

const TOPICS = ["Managed IT support", "Cyber security", "Cloud & Microsoft 365", "Something else"];

function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);

  if (status === "sent") {
    return (
      <div className="site-fade flex flex-col items-center px-6 py-16 text-center">
        <span className="site-pop bg-primary text-primary-foreground grid size-16 place-items-center rounded-full">
          <CircleCheck className="size-8" />
        </span>
        <h3 className="font-display mt-6 text-2xl font-semibold tracking-tight">Thanks{name ? `, ${name.split(" ")[0]}` : ""}!</h3>
        <p className="text-muted-foreground mt-2 max-w-sm leading-relaxed">
          We&apos;ve got your message and will reply within one working day.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setName("");
          }}
          className={siteButton({ variant: "outline", size: "md", className: "mt-8" })}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("sending");
        window.setTimeout(() => setStatus("sent"), 900);
      }}
    >
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Send us a message</h2>
        <p className="text-muted-foreground mt-1.5 text-sm">Tell us a little about your business and we&apos;ll be in touch.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="c-name">Full name</Label>
          <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="h-11 rounded-xl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-company">Company</Label>
          <Input id="c-company" autoComplete="organization" className="h-11 rounded-xl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-email">Work email</Label>
          <Input id="c-email" type="email" required autoComplete="email" className="h-11 rounded-xl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-phone">
            Phone <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input id="c-phone" type="tel" autoComplete="tel" className="h-11 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>What can we help with?</Label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="h-11 w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="c-message">Message</Label>
        <Textarea id="c-message" required rows={5} className="min-h-32 rounded-xl" placeholder="How many people work with you, and what's not working today?" />
      </div>
      <button type="submit" disabled={status === "sending"} className={siteButton({ size: "lg", className: "w-full" })}>
        {status === "sending" ? (
          <>
            <LoaderCircle className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send message
            <Send />
          </>
        )}
      </button>
      <p className="text-muted-foreground text-center text-xs">Demo form: messages aren&apos;t sent anywhere yet.</p>
    </form>
  );
}

export function ContactPage({ page }: { page: ContentItem }) {
  const { settings } = useSiteData();
  const parsed = useMemo(() => parsePageBody(page.body), [page.body]);
  const tel = `tel:${settings.supportPhone.replace(/\s/g, "")}`;

  const methods = [
    { icon: Phone, title: "Call the service desk", value: settings.supportPhone, href: tel, note: settings.businessHours },
    { icon: Mail, title: "Email us", value: settings.supportEmail, href: `mailto:${settings.supportEmail}`, note: "We reply within one working day" },
  ];

  return (
    <>
      <PageHero
        trail={[{ label: "Home", href: "/site" }, { label: page.title }]}
        title={parsed.heading ?? page.title}
        lead={parsed.lead ?? page.excerpt}
        icon={pageIcon(page.slug)}
      />
      <section className="py-20 md:py-28">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="bg-card min-w-0 rounded-2xl border shadow-[0_30px_70px_-45px_rgb(0_0_0/0.35)] lg:col-span-7">
            <ContactForm />
          </Reveal>
          <div className="space-y-4 lg:col-span-5">
            {methods.map((m, i) => (
              <Reveal key={m.title} delay={i * 90}>
                <a href={m.href} className="group bg-card hover:border-brand-ink/30 flex items-start gap-4 rounded-2xl border p-6 transition-colors">
                  <span className="bg-primary/35 text-brand-ink grid size-12 shrink-0 place-items-center rounded-xl">
                    <m.icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="text-muted-foreground block text-sm">{m.title}</span>
                    <span className="font-display mt-0.5 block truncate text-xl font-semibold tracking-tight">{m.value}</span>
                    <span className="text-muted-foreground mt-1 block text-sm">{m.note}</span>
                  </span>
                </a>
              </Reveal>
            ))}
            <Reveal delay={180} className="bg-sidebar relative isolate overflow-hidden rounded-2xl p-6 text-white">
              <div
                aria-hidden
                className="absolute -top-16 -right-16 -z-10 size-48 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_40%,transparent),transparent)]"
              />
              <span className="bg-primary text-primary-foreground grid size-12 place-items-center rounded-xl">
                <LifeBuoy className="size-5" />
              </span>
              <p className="font-display mt-5 text-xl font-semibold tracking-tight">Already a client?</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                Raise and track tickets, and find quick fixes, in the client portal.
              </p>
              <SiteLink href="/login" variant="onDark" className="mt-5">
                Go to the client portal
                <ArrowRight />
              </SiteLink>
            </Reveal>
            {parsed.sections.map((section, i) => (
              <CmsSectionView key={i} section={section} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

export function NotFoundPage() {
  return (
    <section className="relative isolate overflow-hidden pt-40 pb-28 text-center">
      <div aria-hidden className="site-grid-bg absolute inset-0 -z-10" />
      <Container className="max-w-2xl">
        <p className="site-enter font-display text-brand-ink text-sm font-semibold tracking-[0.08em] uppercase">Error 404</p>
        <h1 className="site-enter font-display mt-4 text-4xl font-semibold tracking-[-0.03em] text-balance md:text-6xl" style={{ animationDelay: "80ms" }}>
          We couldn&apos;t find that page
        </h1>
        <p className="site-enter text-muted-foreground mx-auto mt-5 max-w-md text-lg" style={{ animationDelay: "160ms" }}>
          It may have moved, or it hasn&apos;t been published yet.
        </p>
        <div className="site-enter mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "240ms" }}>
          <SiteLink href="/site" size="lg">
            Back to the homepage
          </SiteLink>
          <SiteLink href="/site/contact" variant="outline" size="lg">
            Contact us
          </SiteLink>
        </div>
      </Container>
    </section>
  );
}
