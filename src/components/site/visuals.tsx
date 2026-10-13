"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { UK_CITIES, UK_MAP } from "./uk-map-data";

/* ---------------------------------------------------------------- UK map */

function decode(rows: readonly string[]) {
  const dots: [number, number][] = [];
  rows.forEach((hex, r) => {
    for (let i = 0; i < hex.length; i++) {
      const nibble = parseInt(hex[i], 16);
      for (let bit = 0; bit < 4; bit++) {
        if (nibble & (8 >> bit)) {
          const c = i * 4 + bit;
          dots.push([UK_MAP.step / 2 + c * UK_MAP.step + (r % 2 ? UK_MAP.step / 2 : 0), UK_MAP.step / 2 + r * UK_MAP.step]);
        }
      }
    }
  });
  return dots;
}

const GB_DOTS = decode(UK_MAP.gb);

function duration(fromIso: string, toIso: string) {
  const minutes = Math.max(1, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`;
}

/** Recently resolved tickets for clients whose city is on the map. */
function useLiveFeed() {
  const companies = useAppStore((s) => s.companies);
  const tickets = useAppStore((s) => s.tickets);
  return useMemo(() => {
    const feed = [];
    for (const company of companies) {
      const pin = UK_CITIES[company.city];
      if (!pin) continue;
      // The client's quickest recent fix.
      const latest = tickets
        .filter((t) => t.companyId === company.id && t.resolvedAt)
        .sort(
          (a, b) =>
            new Date(a.resolvedAt!).getTime() -
            new Date(a.createdAt).getTime() -
            (new Date(b.resolvedAt!).getTime() - new Date(b.createdAt).getTime()),
        )[0];
      feed.push({
        id: company.id,
        company: company.name,
        city: company.city,
        pin,
        subject: latest?.subject ?? `${company.seats} users supported`,
        took: latest?.resolvedAt ? duration(latest.createdAt, latest.resolvedAt) : null,
      });
    }
    return feed;
  }, [companies, tickets]);
}

/** A twinkling subset of dots, like network activity. */
const TWINKLES = GB_DOTS.filter((_, i) => i % 23 === 7);

/** Resting angle of the map: tipped back and turned a little, like a model on a desk. */
const BASE = { rx: 46, rz: -12 };
/** How far the pin beacons stand above the map, in px. */
const BEACON = 46;
const VIEWBOX = `0 0 ${UK_MAP.width} ${UK_MAP.height}`;

/** Quadratic arc between two pins, bowed upwards. */
function arcPath(a: readonly [number, number], b: readonly [number, number]) {
  const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return `M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 - dist * 0.38} ${b[0]} ${b[1]}`;
}

/** The dots never change, so they are built once. */
function MapDots() {
  return (
    <>
      {/* Thickness: a darker copy of the dots just below the surface. */}
      <svg viewBox={VIEWBOX} className="absolute inset-0 size-full [transform:translateZ(-9px)]" aria-hidden focusable="false">
        <g fill="#14215f" opacity="0.5">
          {GB_DOTS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.35" />
          ))}
        </g>
      </svg>
      <svg viewBox={VIEWBOX} className="absolute inset-0 size-full overflow-visible" aria-hidden focusable="false">
        <defs>
          <linearGradient id="uk-dots" gradientUnits="userSpaceOnUse" x1="120" y1="40" x2="460" y2="800">
            <stop offset="0" stopColor="#7b5cff" />
            <stop offset="0.45" stopColor="#2f5bff" />
            <stop offset="1" stopColor="#0a1128" />
          </linearGradient>
          <linearGradient id="uk-hot" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="520" y2="820">
            <stop offset="0" stopColor="#ff6a3d" />
            <stop offset="0.5" stopColor="#e5487f" />
            <stop offset="1" stopColor="#7b5cff" />
          </linearGradient>
          <linearGradient id="uk-sweep-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="uk-sweep" maskUnits="userSpaceOnUse" x="-200" y="-200" width="920" height="1220">
            <g transform="rotate(22 260 410)">
              <rect className="uk-sweep" x="-260" y="-400" width="170" height="1700" fill="url(#uk-sweep-fade)" />
            </g>
          </mask>
        </defs>
        <g fill="url(#uk-dots)">
          {GB_DOTS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.35" />
          ))}
        </g>
        {/* A warm light wave that sweeps across the map. */}
        <g fill="url(#uk-hot)" mask="url(#uk-sweep)">
          {GB_DOTS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.7" />
          ))}
        </g>
        <g fill="#ff6a3d">
          {TWINKLES.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.6" className="uk-twinkle" style={{ animationDelay: `${((i * 0.73) % 4.2).toFixed(2)}s` }} />
          ))}
        </g>
      </svg>
    </>
  );
}

/**
 * A dot-matrix map of the UK lying in 3D, tipped back like a model on a desk.
 * Each client city has a beacon standing above the map; arcs float between
 * them, a beam travels to each client in turn and a card shows their quickest
 * recent fix. The map itself stays still; the effects on it stop for
 * reduced-motion users.
 */
export function UkMap({ className }: { className?: string }) {
  const feed = useLiveFeed();
  const inProgress = useAppStore((s) => s.tickets.filter((t) => t.status === "in_progress").length);
  const [step, setStep] = useState({ active: 0, previous: -1 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const activeRef = useRef(0);
  const dots = useMemo(() => <MapDots />, []);

  const active = feed.length ? step.active % feed.length : 0;
  const current = feed[active];
  const previous = step.previous >= 0 ? feed[step.previous % feed.length] : null;

  // Keep the card beside the active beacon, wherever the 3D map has put it.
  const placeCard = useCallback(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    const head = headsRef.current[activeRef.current];
    if (!wrap || !card || !head) return;
    const w = wrap.getBoundingClientRect();
    const h = head.getBoundingClientRect();
    const x = h.left + h.width / 2 - w.left;
    card.style.setProperty("--card-x", `${x.toFixed(1)}px`);
    card.style.setProperty("--card-y", `${(h.top + h.height / 2 - w.top).toFixed(1)}px`);
    card.dataset.flip = String(x > w.width * 0.55);
  }, []);

  useEffect(() => {
    if (feed.length < 2) return;
    const timer = window.setInterval(() => setStep((s) => ({ previous: s.active, active: (s.active + 1) % feed.length })), 3800);
    return () => window.clearInterval(timer);
  }, [feed.length]);

  useLayoutEffect(() => {
    activeRef.current = active;
    placeCard();
    const settle = window.setTimeout(placeCard, 520);
    return () => window.clearTimeout(settle);
  }, [active, placeCard]);

  useEffect(() => {
    window.addEventListener("resize", placeCard);
    return () => window.removeEventListener("resize", placeCard);
  }, [placeCard]);

  const pinStyle = (pin: readonly [number, number]) => ({ left: `${(pin[0] / UK_MAP.width) * 100}%`, top: `${(pin[1] / UK_MAP.height) * 100}%` });

  return (
    <div ref={wrapRef} className={cn("relative flex aspect-[520/690] items-center justify-center [perspective:1300px]", className)}>
      <div className="uk-stage relative aspect-[520/820] w-full shrink-0">
          {/* Soft shadow on the "desk" below the map. */}
          <div
            aria-hidden
            className="absolute inset-x-[14%] inset-y-[18%] rounded-full bg-[radial-gradient(closest-side,rgb(20_33_95/0.28),transparent)] blur-2xl [transform:translateZ(-60px)]"
          />
          {dots}
          {current && (
            <span
              aria-hidden
              className="absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_106_61/0.45),transparent)] transition-[left,top] duration-700"
              style={pinStyle(current.pin)}
            />
          )}

          {/* Beacons: a ripple on the ground, a stem of light and a glowing head. */}
          {feed.map((item, i) => {
            const on = i === active;
            return (
              <div key={item.id} aria-hidden className="absolute [transform-style:preserve-3d]" style={pinStyle(item.pin)}>
                <span className="uk-ground absolute -top-6 -left-6 size-12 rounded-full border-2 border-[#ff6a3d]" style={{ animationDelay: `${(i % 4) * 0.7}s` }} />
                <span
                  className={cn(
                    "absolute top-0 -left-[1.5px] w-[3px] origin-top rounded-full bg-gradient-to-b from-[#ff6a3d]/0 via-[#ff6a3d]/70 to-[#ff6a3d] shadow-[0_0_10px_rgb(255_106_61/0.6)] transition-opacity duration-500 [transform:rotateX(90deg)]",
                    on ? "opacity-100" : "opacity-60",
                  )}
                  style={{ height: BEACON }}
                />
                <span
                  ref={(el) => {
                    headsRef.current[i] = el;
                  }}
                  className="absolute -top-2 -left-2 grid size-4 place-items-center rounded-full bg-white shadow-[0_0_0_4px_rgb(255_106_61/0.16),0_6px_18px_rgb(255_106_61/0.55)] transition-transform duration-500"
                  style={{ transform: `translateZ(${BEACON}px) rotateZ(${-BASE.rz}deg) rotateX(${-BASE.rx}deg) scale(${on ? 1.45 : 1})` }}
                >
                  <span className="size-2 rounded-full bg-[linear-gradient(135deg,#ff6a3d,#e5487f)]" />
                </span>
              </div>
            );
          })}

          {/* Arcs float between the beacons, at the same height as their heads. */}
          <svg
            viewBox={VIEWBOX}
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
            style={{ transform: `translateZ(${BEACON}px)` }}
            aria-hidden
            focusable="false"
          >
            <defs>
              <linearGradient id="uk-arc" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#ff6a3d" />
                <stop offset="1" stopColor="#7b5cff" />
              </linearGradient>
            </defs>
            <g fill="none" stroke="url(#uk-arc)" strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" opacity="0.55">
              {feed.slice(1).map((item, i) => (
                <path key={item.id} d={arcPath(feed[i].pin, item.pin)} />
              ))}
            </g>
            {previous && current && (
              <path
                key={`${previous.id}-${current.id}`}
                d={arcPath(previous.pin, current.pin)}
                pathLength={1}
                className="uk-beam"
                stroke="url(#uk-arc)"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </svg>
      </div>

      <div className="border-site-line text-site-ink absolute top-[1%] right-0 inline-flex items-center gap-2 rounded-full border bg-white/85 py-1.5 pr-3.5 pl-2.5 text-[12px] font-medium shadow-[0_10px_24px_-14px_rgb(10_17_40/0.4)] backdrop-blur">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60 motion-reduce:hidden" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        Live
        <span className="text-site-muted">· {inProgress} being fixed now</span>
      </div>

      {current && (
        <div
          ref={cardRef}
          key={current.id}
          className="pointer-events-none absolute z-10 w-[min(250px,78vw)] max-sm:bottom-0 max-sm:left-1/2 max-sm:-translate-x-1/2 sm:top-[var(--card-y,50%)] sm:left-[var(--card-x,50%)] sm:translate-x-6 sm:-translate-y-1/2 sm:data-[flip=true]:translate-x-[calc(-100%-24px)]"
        >
          <div className="site-pop">
            <div className="rounded-2xl border border-white/70 bg-white/85 p-3.5 shadow-[0_24px_48px_-24px_rgb(10_17_40/0.45)] backdrop-blur-xl">
              <p className="text-site-muted flex items-center justify-between font-mono text-[10.5px] tracking-[0.08em] uppercase">
                <span className="truncate">{current.city}</span>
                <span className="text-site-blue">Resolved</span>
              </p>
              <p className="text-site-ink mt-1.5 truncate text-[13.5px] font-semibold">{current.company}</p>
              <p className="text-site-text mt-0.5 line-clamp-2 text-[12.5px] leading-snug">{current.subject}</p>
              {current.took && (
                <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                  Fixed in {current.took}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- frames */

/** A product screenshot in a browser window. */
export function BrowserFrame({
  src,
  alt,
  url = "hub.desksupport.co.uk",
  sizes = "(min-width: 1024px) 60vw, 100vw",
  priority,
  className,
}: {
  src: string;
  alt: string;
  url?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-site-line overflow-hidden rounded-[18px] border bg-white shadow-[0_50px_100px_-40px_rgb(10_17_40/0.45),0_18px_36px_-18px_rgb(10_17_40/0.2)]",
        className,
      )}
    >
      <div className="border-site-line bg-site-soft flex h-9 items-center gap-1.5 border-b px-4">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="text-site-muted ring-site-line mx-auto flex h-6 items-center gap-1.5 rounded-md bg-white px-3 font-mono text-[11px] ring-1">
          <Lock className="size-3" />
          {url}
        </span>
        <span className="w-[42px]" />
      </div>
      <div className="relative aspect-[16/10]">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-[0%_0%]" />
      </div>
    </div>
  );
}

/** A photo with a white mat and a gradient outline. */
export function PhotoFrame({
  src,
  alt,
  sizes = "(min-width: 1024px) 45vw, 100vw",
  className,
  imageClassName,
  children,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("ring-gradient relative rounded-[30px] p-2 shadow-[0_40px_80px_-40px_rgb(10_17_40/0.4)]", className)}>
      <div className="relative size-full overflow-hidden rounded-[22px]">
        <Image src={src} alt={alt} fill sizes={sizes} className={cn("object-cover", imageClassName)} />
      </div>
      {children}
    </div>
  );
}

/** A small frosted card that floats over photos and mockups. */
export function FloatCard({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        "absolute rounded-2xl border border-white/70 bg-white/85 p-3.5 shadow-[0_24px_48px_-24px_rgb(10_17_40/0.45)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------- identities */

const WORDMARK_STYLES = [
  "font-serif text-[23px] italic",
  "text-[13px] font-semibold tracking-[0.22em] uppercase",
  "font-mono text-[15px] font-semibold tracking-tight",
  "text-[20px] font-bold tracking-[-0.045em]",
  "text-[14px] font-medium tracking-[0.08em] uppercase",
  "font-serif text-[22px]",
];
const WORDMARK_GLYPHS = ["rounded-full", "rounded-[3px] rotate-45", "rounded-full ring-[3px] ring-inset ring-current bg-transparent", "rounded-sm"];

/** A client's name set as a simple logotype, for the trust strip. */
export function Wordmark({ name, index, className }: { name: string; index: number; className?: string }) {
  const words = name.split(" ");
  const short = words.length >= 3 ? words.slice(0, -1).join(" ") : name;
  return (
    <span className={cn("inline-flex items-center gap-2.5 whitespace-nowrap", className)}>
      <span className={cn("size-3.5 bg-current", WORDMARK_GLYPHS[index % WORDMARK_GLYPHS.length])} />
      <span className={WORDMARK_STYLES[index % WORDMARK_STYLES.length]}>{short}</span>
    </span>
  );
}

const AVATAR_GRADIENTS = [
  "from-[#ff6a3d] to-[#e5487f]",
  "from-[#7b5cff] to-[#2f5bff]",
  "from-[#2f5bff] to-[#22b8cf]",
  "from-[#e5487f] to-[#7b5cff]",
  "from-[#0a1128] to-[#2f5bff]",
];

export function InitialsAvatar({ name, index = 0, className }: { name: string; index?: number; className?: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-white ring-4 ring-white",
        AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
        className,
      )}
    >
      {initials}
    </span>
  );
}
