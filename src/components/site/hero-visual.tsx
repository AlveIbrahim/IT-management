"use client";

import { useEffect, useState } from "react";
import { Check, Headset, ShieldCheck, SmilePlus } from "lucide-react";

import { STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Phase = "open" | "in_progress" | "resolved";

const SAMPLE_TICKETS = [
  { subject: "Outlook keeps asking for my password", company: "Harbour & Finch", engineer: "Priya" },
  { subject: "New starter laptop for Monday", company: "Oakridge Accountancy", engineer: "Aisha" },
  { subject: "Wi-Fi dropping in meeting room 2", company: "Brightwell Architects", engineer: "Daniel" },
  { subject: "Can't connect to the VPN from home", company: "Cobalt Logistics", engineer: "Daniel" },
  { subject: "Shared mailbox missing in Outlook", company: "Vantage Property", engineer: "Priya" },
  { subject: "Reception printer printing blank pages", company: "Meadowbank Academy", engineer: "Aisha" },
  { subject: "Suspicious invoice email – please check", company: "Northgate Dental", engineer: "James" },
];

interface Slot {
  ticket: number;
  phase: Phase;
  mins: number;
}

const NEXT: Record<Phase, Phase> = { open: "in_progress", in_progress: "resolved", resolved: "open" };

/** A calm, looping illustration of the service desk: tickets come in, get picked up and get resolved. */
export function HeroVisual({ csat }: { csat: number }) {
  const [desk, setDesk] = useState<{ slots: Slot[]; resolved: number; next: number }>({
    slots: [
      { ticket: 0, phase: "in_progress", mins: 14 },
      { ticket: 1, phase: "open", mins: 9 },
      { ticket: 2, phase: "resolved", mins: 18 },
    ],
    resolved: 23,
    next: 3,
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let step = 0;
    const timer = window.setInterval(() => {
      const index = step % 3;
      step += 1;
      setDesk((cur) => {
        const slot = cur.slots[index];
        if (slot.phase === "resolved") {
          const ticket = cur.next % SAMPLE_TICKETS.length;
          const fresh: Slot = { ticket, phase: "open", mins: 6 + ((ticket * 7) % 20) };
          return { ...cur, next: cur.next + 1, slots: cur.slots.map((s, i) => (i === index ? fresh : s)) };
        }
        const phase = NEXT[slot.phase];
        return {
          ...cur,
          resolved: cur.resolved + (phase === "resolved" ? 1 : 0),
          slots: cur.slots.map((s, i) => (i === index ? { ...s, phase } : s)),
        };
      });
    }, 1700);
    return () => window.clearInterval(timer);
  }, []);

  const { slots, resolved } = desk;

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_55%,transparent),transparent)] opacity-70 blur-2xl"
      />

      <div
        role="img"
        aria-label="Illustration of the service desk resolving client tickets"
        className="bg-card relative overflow-hidden rounded-2xl border shadow-[0_40px_80px_-30px_rgb(0_0_0/0.3),0_0_0_1px_rgb(0_0_0/0.02)]"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
              <Headset className="size-4" />
            </span>
            <div>
              <p className="text-sm leading-none font-semibold">Service desk</p>
              <p className="text-muted-foreground mt-1 text-xs">All clients · today</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        </div>

        <ul>
          {slots.map((slot, i) => {
            const t = SAMPLE_TICKETS[slot.ticket];
            const meta = STATUS_META[slot.phase];
            return (
              <li key={i} className="flex items-center gap-3.5 border-b px-5 py-4 last:border-0">
                <span
                  key={`${slot.ticket}-avatar`}
                  className="site-fade bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
                >
                  {t.company
                    .split(/[\s&]+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
                <div key={`${slot.ticket}-text`} className="site-fade min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.subject}</p>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {t.company} ·{" "}
                    {slot.phase === "open"
                      ? "Just now"
                      : slot.phase === "in_progress"
                        ? `${t.engineer} is on it`
                        : `Resolved in ${slot.mins} min`}
                  </p>
                </div>
                <span
                  key={`${slot.ticket}-${slot.phase}`}
                  className={cn(
                    "site-pop inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                    meta.className,
                  )}
                >
                  {slot.phase === "resolved" ? <Check className="size-3" strokeWidth={3} /> : <span className={cn("size-1.5 rounded-full", meta.dot)} />}
                  {slot.phase === "in_progress" ? "In progress" : meta.label}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="bg-muted/40 flex items-center gap-3 border-t px-5 py-3.5">
          <span className="grid size-8 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Check className="size-4" strokeWidth={2.5} />
          </span>
          <p className="text-sm">
            <span key={resolved} className="font-display site-pop inline-block font-semibold tabular-nums">
              {resolved}
            </span>{" "}
            <span className="text-muted-foreground">resolved today</span>
          </p>
        </div>
      </div>

      <div className="site-float bg-card absolute -right-4 -bottom-12 hidden w-56 rounded-2xl border p-4 shadow-[0_24px_50px_-20px_rgb(0_0_0/0.3)] sm:block lg:-right-10">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium">Customer satisfaction</p>
          <SmilePlus className="text-brand-ink size-4" />
        </div>
        <p className="font-display mt-1 text-2xl font-semibold">{csat}%</p>
        <div className="bg-muted mt-2.5 h-1.5 overflow-hidden rounded-full">
          <div className="h-full rounded-full bg-[var(--chart-1)]" style={{ width: `${csat}%` }} />
        </div>
      </div>

      <div className="site-float-slow bg-card absolute -top-6 -left-3 hidden items-center gap-2 rounded-full border py-2 pr-4 pl-2 text-xs font-medium shadow-[0_16px_40px_-18px_rgb(0_0_0/0.3)] sm:flex lg:-left-10">
        <span className="grid size-6 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
          <ShieldCheck className="size-3.5" />
        </span>
        Phishing email blocked
      </div>
    </div>
  );
}
