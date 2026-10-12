"use client";

/*
 * Flat illustrations for the public website, drawn in code so they stay
 * crisp, tiny and on-palette. Everything here is decorative (aria-hidden).
 * Loops use the .ill-* classes in globals.css, which switch off for
 * prefers-reduced-motion.
 */

import { useId } from "react";

import { cn } from "@/lib/utils";

const C = {
  ink: "#17383a",
  inkSoft: "#21494b",
  teal: "#184e51",
  tealMid: "#2c6d64",
  leaf: "#2f8f5b",
  leaf2: "#49b26f",
  leafDark: "#1f6b45",
  lime: "#bdea72",
  limeDark: "#9ccf4f",
  tint: "#e4f5c6",
  sun: "#f9e04b",
  sunDark: "#e9c62f",
  pink: "#ff9fc6",
  pinkDark: "#f077a8",
  skin: "#ffc45f",
  skinShade: "#f2a93b",
  hair: "#f07a3a",
  white: "#ffffff",
  paper: "#f3f6f4",
  gray: "#cfdcd8",
};

/** A stable, selector-safe id for <defs> inside one illustration. */
function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

type ArtProps = { className?: string };

function Svg({ viewBox, className, children }: { viewBox: string; className?: string; children: React.ReactNode }) {
  return (
    <svg viewBox={viewBox} className={cn("block h-auto w-full overflow-visible", className)} aria-hidden focusable="false">
      {children}
    </svg>
  );
}

/** Dotted "printed" shadow, as in risograph-style illustration. */
function DotPattern({ id, color, opacity = 0.35, gap = 7 }: { id: string; color: string; opacity?: number; gap?: number }) {
  return (
    <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse">
      <circle cx={gap / 4} cy={gap / 4} r="1.3" fill={color} opacity={opacity} />
      <circle cx={gap * 0.75} cy={gap * 0.75} r="1.3" fill={color} opacity={opacity} />
    </pattern>
  );
}

function Leaf({
  x,
  y,
  len,
  w,
  rot = 0,
  fill,
  rib = "rgba(255,255,255,.35)",
}: {
  x: number;
  y: number;
  len: number;
  w: number;
  rot?: number;
  fill: string;
  rib?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M0 0C${w} ${-len * 0.22} ${w * 0.95} ${-len * 0.72} 0 ${-len}C${-w * 0.95} ${-len * 0.72} ${-w} ${-len * 0.22} 0 0Z`}
        fill={fill}
      />
      <path d={`M0 -6Q${w * 0.12} ${-len * 0.5} 0 ${-len * 0.86}`} stroke={rib} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Flower({ x, y, r = 8, fill = C.pink, center = C.sun }: { x: number; y: number; r?: number; fill?: string; center?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = ((i * 72 - 90) * Math.PI) / 180;
        return <circle key={i} cx={(Math.cos(a) * r).toFixed(1)} cy={(Math.sin(a) * r).toFixed(1)} r={r * 0.82} fill={fill} />;
      })}
      <circle r={r * 0.55} fill={center} />
    </g>
  );
}

function Sparkle({ x, y, size = 1, fill = C.sun }: { x: number; y: number; size?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${size})`}
      d="M0 -17 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5 z"
      fill={fill}
    />
  );
}

/* ------------------------------------------------------------------ hero */

/** Potted plant with pink flowers, and a hand holding a phone with a resolved ticket. */
export function HeroLeftArt({ className }: ArtProps) {
  const dots = useSvgId("hl");
  return (
    <Svg viewBox="0 0 480 520" className={className}>
      <defs>
        <DotPattern id={dots} color={C.tint} opacity={0.35} />
      </defs>
      <ellipse cx="240" cy="500" rx="200" ry="22" fill={`url(#${dots})`} />
      <g className="ill-sway">
        <path d="M178 300 C 170 240 150 190 120 150" stroke={C.leafDark} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M190 300 C 196 230 200 170 214 112" stroke={C.leafDark} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M200 300 C 220 250 250 215 280 196" stroke={C.leafDark} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Leaf x={182} y={330} len={190} w={46} rot={-38} fill={C.leaf} />
        <Leaf x={190} y={330} len={230} w={50} rot={-8} fill={C.leaf2} />
        <Leaf x={196} y={332} len={200} w={46} rot={24} fill={C.leaf} />
        <Leaf x={186} y={336} len={150} w={40} rot={-62} fill={C.lime} rib="rgba(23,56,58,.25)" />
        <Leaf x={200} y={336} len={160} w={42} rot={52} fill={C.lime} rib="rgba(23,56,58,.25)" />
        <Flower x={120} y={148} r={11} />
        <Flower x={214} y={108} r={12} />
        <Flower x={282} y={194} r={10} />
      </g>
      <path d="M128 330 H262 L246 470 Q244 486 228 486 H162 Q146 486 144 470 Z" fill={C.pink} />
      <rect x="118" y="318" width="154" height="26" rx="8" fill={C.pinkDark} />
      <path d="M150 380 Q195 400 240 380" stroke="rgba(255,255,255,.45)" strokeWidth="5" fill="none" strokeLinecap="round" />

      <g className="ill-float">
        <g transform="translate(336 236) rotate(-10)">
          <path d="M-52 96 C -58 160 -62 220 -66 300 L 58 300 C 56 220 54 160 52 96 Z" fill={C.skin} />
          <path d="M-64 236 L 60 236 L 62 300 L -70 300 Z" fill={C.leaf2} />
          <path d="M-64 236 L 60 236" stroke={C.leafDark} strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="4" cy="92" rx="74" ry="56" fill={C.skin} />
          {[-6, 22, 50, 78].map((y, i) => (
            <g key={y}>
              <rect x="36" y={y} width={i === 3 ? 38 : 44} height="24" rx="12" fill={C.skin} />
              <path d={`M70 ${y + 7} q4 5 0 10`} stroke={C.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          ))}
          <rect x="-62" y="-118" width="124" height="236" rx="22" fill={C.ink} />
          <rect x="-54" y="-108" width="108" height="214" rx="15" fill={C.white} />
          <rect x="-18" y="-102" width="36" height="8" rx="4" fill={C.ink} />
          <rect x="-42" y="-74" width="84" height="44" rx="10" fill={C.tint} />
          <circle cx="-24" cy="-52" r="11" fill={C.lime} />
          <path d="M-29 -52 l4 4 l8 -9" stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="-6" y="-60" width="38" height="6" rx="3" fill={C.ink} opacity=".7" />
          <rect x="-6" y="-48" width="26" height="6" rx="3" fill={C.ink} opacity=".35" />
          <rect x="-42" y="-18" width="84" height="8" rx="4" fill={C.gray} />
          <rect x="-42" y="-2" width="60" height="8" rx="4" fill={C.gray} />
          <rect x="-42" y="22" width="84" height="30" rx="15" fill={C.lime} />
          <rect x="-22" y="33" width="44" height="8" rx="4" fill={C.ink} opacity=".75" />
          <path d="M-70 96 C -78 70 -64 48 -40 44" stroke={C.skin} strokeWidth="26" fill="none" strokeLinecap="round" />
          <path d="M-46 40 q-6 2 -8 8" stroke={C.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </Svg>
  );
}

/** Laptop showing a ticket queue, a headset, a mug of tea and a monstera. */
export function HeroRightArt({ className }: ArtProps) {
  const dots = useSvgId("hr");
  const rows = [
    { dot: "#4d8bf5", w: 90, tag: C.pink },
    { dot: "#9b6cf2", w: 70, tag: C.sun },
    { dot: C.limeDark, w: 104, tag: C.tint },
    { dot: C.limeDark, w: 80, tag: C.tint },
  ];
  return (
    <Svg viewBox="0 0 480 520" className={className}>
      <defs>
        <DotPattern id={dots} color={C.tint} opacity={0.35} />
      </defs>
      <ellipse cx="250" cy="500" rx="210" ry="22" fill={`url(#${dots})`} />
      <g className="ill-sway">
        <Leaf x={430} y={470} len={300} w={70} rot={-20} fill={C.leaf} />
        <Leaf x={440} y={470} len={240} w={60} rot={12} fill={C.leaf2} />
        <path d="M420 470 C 410 380 392 300 372 236" stroke={C.leafDark} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Flower x={372} y={232} r={11} />
      </g>

      <rect x="70" y="220" width="300" height="200" rx="16" fill={C.ink} />
      <rect x="82" y="232" width="276" height="176" rx="8" fill={C.white} />
      <rect x="82" y="232" width="62" height="176" rx="8" fill={C.inkSoft} />
      <rect x="96" y="250" width="34" height="8" rx="4" fill={C.lime} />
      {[270, 284, 298].map((y, i) => (
        <rect key={y} x="96" y={y} width={[28, 32, 24][i]} height="6" rx="3" fill="rgba(255,255,255,.35)" />
      ))}
      <rect x="158" y="250" width="90" height="10" rx="5" fill={C.ink} opacity=".8" />
      <rect x="296" y="248" width="48" height="16" rx="8" fill={C.lime} />
      {rows.map((row, i) => (
        <g key={i} transform={`translate(0 ${i * 30})`}>
          <rect x="158" y="280" width="186" height="22" rx="6" fill={C.paper} />
          <circle cx="170" cy="291" r="5" fill={row.dot} />
          <rect x="182" y="288" width={row.w} height="6" rx="3" fill={C.ink} opacity=".55" />
          <rect x="306" y="286" width="30" height="10" rx="5" fill={row.tag} />
        </g>
      ))}
      <path d="M40 420 H400 L392 436 Q388 444 378 444 H62 Q52 444 48 436 Z" fill={C.inkSoft} />
      <rect x="190" y="420" width="60" height="6" rx="3" fill={C.ink} />

      <g className="ill-wobble">
        <path d="M372 418 C 366 330 450 330 444 418" stroke={C.tealMid} strokeWidth="13" fill="none" strokeLinecap="round" />
        <rect x="354" y="396" width="34" height="52" rx="13" fill={C.lime} />
        <rect x="428" y="396" width="34" height="52" rx="13" fill={C.limeDark} />
        <path d="M364 440 C 366 470 340 476 318 470" stroke={C.tealMid} strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="314" cy="469" r="8" fill={C.tealMid} />
      </g>

      <g className="ill-steam" stroke={C.tint} strokeWidth="5" fill="none" strokeLinecap="round" opacity=".7">
        <path d="M30 360 c -8 -12 8 -20 0 -34" />
        <path d="M52 360 c -8 -12 8 -20 0 -34" />
      </g>
      <path d="M14 372 H70 V430 Q70 446 54 446 H30 Q14 446 14 430 Z" fill={C.sun} />
      <path d="M70 386 h8 a12 12 0 0 1 0 24 h-8" stroke={C.sun} strokeWidth="8" fill="none" />
      <path d="M330 444 C 330 490 260 480 220 500" stroke={C.ink} strokeWidth="6" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/* -------------------------------------------------------------- services */

function SupportArt({ dots }: { dots: string }) {
  return (
    <>
      <ellipse cx="200" cy="338" rx="170" ry="18" fill={`url(#${dots})`} />
      <g className="ill-spin">
        <g transform="translate(96 96)">
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x="-11" y="-62" width="22" height="26" rx="5" fill={C.lime} transform={`rotate(${i * 45})`} />
          ))}
          <circle r="46" fill={C.lime} />
          <circle r="18" fill={C.sun} />
        </g>
      </g>
      <path d="M176 270 h48 l10 50 h-68 z" fill={C.inkSoft} />
      <rect x="140" y="314" width="120" height="14" rx="7" fill={C.ink} />
      <rect x="70" y="100" width="260" height="176" rx="14" fill={C.ink} />
      <rect x="82" y="112" width="236" height="152" rx="7" fill={C.white} />
      <rect x="98" y="128" width="120" height="34" rx="12" fill={C.paper} />
      <rect x="110" y="138" width="80" height="6" rx="3" fill={C.ink} opacity=".55" />
      <rect x="110" y="149" width="56" height="6" rx="3" fill={C.ink} opacity=".3" />
      <rect x="182" y="172" width="120" height="34" rx="12" fill={C.lime} />
      <rect x="194" y="182" width="84" height="6" rx="3" fill={C.ink} opacity=".7" />
      <rect x="194" y="193" width="60" height="6" rx="3" fill={C.ink} opacity=".45" />
      <circle cx="112" cy="234" r="16" fill={C.tint} />
      <path d="M104 234 l6 6 l11 -12" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="136" y="226" width="96" height="7" rx="3.5" fill={C.ink} opacity=".55" />
      <rect x="136" y="239" width="64" height="7" rx="3.5" fill={C.ink} opacity=".3" />
      <g transform="rotate(9 318 106)">
        <rect x="293" y="81" width="50" height="50" rx="4" fill={C.pink} />
        <rect x="303" y="97" width="28" height="5" rx="2.5" fill={C.ink} opacity=".35" />
        <rect x="303" y="109" width="20" height="5" rx="2.5" fill={C.ink} opacity=".35" />
      </g>
      <g className="ill-wobble">
        <path d="M44 330 C 40 262 112 262 108 330" stroke={C.tealMid} strokeWidth="11" fill="none" strokeLinecap="round" />
        <rect x="30" y="300" width="28" height="42" rx="11" fill={C.sun} />
        <rect x="94" y="300" width="28" height="42" rx="11" fill={C.sunDark} />
      </g>
      <path d="M320 290 h40 v34 q0 12 -12 12 h-16 q-12 0 -12 -12 z" fill={C.white} />
      <path d="M360 298 h5 a9 9 0 0 1 0 18 h-5" stroke={C.white} strokeWidth="6" fill="none" />
      <g className="ill-steam" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round" opacity=".35">
        <path d="M332 280 c -6 -9 6 -15 0 -26" />
        <path d="M348 280 c -6 -9 6 -15 0 -26" />
      </g>
    </>
  );
}

function SecurityArt({ dots }: { dots: string }) {
  return (
    <>
      <ellipse cx="190" cy="350" rx="150" ry="16" fill={`url(#${dots})`} />
      <path d="M170 60 L262 94 V176 C262 250 216 300 170 330 C124 300 78 250 78 176 V94 Z" fill={C.teal} />
      <path d="M170 60 L262 94 V176 C262 250 216 300 170 330 Z" fill={C.ink} opacity=".35" />
      <path
        d="M170 86 L240 112 V176 C240 234 206 276 170 300 C134 276 100 234 100 176 V112 Z"
        fill="none"
        stroke={C.lime}
        strokeWidth="4"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
      <path d="M146 170 v-20 a24 24 0 0 1 48 0 v20" stroke={C.tint} strokeWidth="12" fill="none" />
      <rect x="132" y="166" width="76" height="62" rx="12" fill={C.lime} />
      <circle cx="170" cy="192" r="8" fill={C.ink} />
      <rect x="166" y="194" width="8" height="18" rx="4" fill={C.ink} />
      <g className="ill-dangle" style={{ transformOrigin: "320px 0px" }}>
        <path d="M320 0 V206" stroke={C.ink} strokeWidth="2.5" />
        <g transform="rotate(-8 312 262)">
          <rect x="266" y="236" width="92" height="62" rx="8" fill={C.white} />
          <path d="M268 240 L312 272 L356 240" stroke={C.gray} strokeWidth="5" fill="none" strokeLinejoin="round" />
        </g>
        <path d="M320 204 v28 a13 13 0 0 1 -26 0 v-8" stroke={C.ink} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="352" cy="240" r="17" fill={C.pink} />
        <path d="M345 233 l14 14 M359 233 l-14 14" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      </g>
      <Sparkle x={70} y={87} />
      <Sparkle x={290} y={341} size={0.6} />
      <Leaf x={52} y={342} len={90} w={22} rot={-20} fill={C.leaf} />
      <Leaf x={58} y={342} len={110} w={24} rot={10} fill={C.leaf2} />
      <path d="M30 330 h52 l-6 26 h-40 z" fill={C.pink} />
    </>
  );
}

function CloudArt({ dots }: { dots: string }) {
  const tiles = [
    {
      x: 118,
      fill: C.lime,
      glyph: (
        <>
          <rect x="11" y="12" width="22" height="4" rx="2" fill={C.ink} />
          <rect x="11" y="20" width="22" height="4" rx="2" fill={C.ink} opacity=".6" />
          <rect x="11" y="28" width="14" height="4" rx="2" fill={C.ink} opacity=".6" />
        </>
      ),
    },
    {
      x: 170,
      fill: C.teal,
      glyph: (
        <>
          <rect x="11" y="11" width="9" height="9" rx="2" fill={C.tint} />
          <rect x="24" y="11" width="9" height="9" rx="2" fill={C.tint} />
          <rect x="11" y="24" width="9" height="9" rx="2" fill={C.tint} />
          <rect x="24" y="24" width="9" height="9" rx="2" fill={C.lime} />
        </>
      ),
    },
    {
      x: 222,
      fill: C.pink,
      glyph: <path d="M12 14 h20 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-12 l-6 5 v-5 h-2 a3 3 0 0 1 -3 -3 v-10 a3 3 0 0 1 3 -3z" fill={C.white} />,
    },
  ];
  return (
    <>
      <ellipse cx="200" cy="352" rx="165" ry="16" fill={`url(#${dots})`} />
      <g stroke={C.ink} strokeWidth="3" strokeDasharray="3 9" strokeLinecap="round" fill="none" opacity=".55" className="ill-flow">
        <path d="M120 200 C 110 240 100 250 92 270" />
        <path d="M200 206 V 262" />
        <path d="M282 200 C 292 240 300 250 310 276" />
      </g>
      <g className="ill-float">
        <path
          d="M96 196 C 50 196 46 136 92 130 C 92 84 150 66 178 100 C 196 58 268 62 274 116 C 330 110 342 196 288 196 Z"
          fill={C.white}
        />
        {tiles.map((t) => (
          <g key={t.x} transform={`translate(${t.x} 118)`}>
            <rect width="44" height="44" rx="11" fill={t.fill} />
            {t.glyph}
          </g>
        ))}
      </g>
      <rect x="40" y="270" width="110" height="70" rx="8" fill={C.ink} />
      <rect x="47" y="277" width="96" height="56" rx="4" fill={C.tint} />
      <rect x="56" y="288" width="50" height="6" rx="3" fill={C.ink} opacity=".6" />
      <rect x="56" y="300" width="70" height="6" rx="3" fill={C.ink} opacity=".3" />
      <path d="M28 340 h134 l-6 10 h-122 z" fill={C.inkSoft} />
      <rect x="168" y="262" width="66" height="88" rx="9" fill={C.ink} />
      <rect x="174" y="268" width="54" height="76" rx="5" fill={C.white} />
      <rect x="182" y="280" width="38" height="24" rx="4" fill={C.sun} />
      <rect x="182" y="312" width="30" height="5" rx="2.5" fill={C.ink} opacity=".4" />
      <rect x="282" y="276" width="46" height="76" rx="9" fill={C.ink} />
      <rect x="287" y="282" width="36" height="64" rx="5" fill={C.white} />
      <circle cx="305" cy="306" r="10" fill={C.lime} />
      <path d="M300 306 l4 4 l7 -8" stroke={C.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Leaf x={356} y={352} len={120} w={26} rot={-10} fill={C.leaf} />
      <Leaf x={362} y={352} len={90} w={22} rot={24} fill={C.leaf2} />
    </>
  );
}

export type ServiceArtKind = "support" | "security" | "cloud";

/** Picks the illustration for a service page from words in its slug or title. */
export function serviceArtKind(text: string): ServiceArtKind {
  if (/secur|cyber|protect/i.test(text)) return "security";
  if (/cloud|microsoft|365|backup/i.test(text)) return "cloud";
  return "support";
}

export function ServiceArt({ kind, className }: ArtProps & { kind: ServiceArtKind }) {
  const dots = useSvgId("sv");
  return (
    <Svg viewBox="0 0 400 400" className={className}>
      <defs>
        <DotPattern id={dots} color={C.ink} opacity={0.22} />
      </defs>
      {kind === "security" ? <SecurityArt dots={dots} /> : kind === "cloud" ? <CloudArt dots={dots} /> : <SupportArt dots={dots} />}
    </Svg>
  );
}

/* ---------------------------------------------------------------- people */

/** Upper body leaning in from the left and pointing at whatever sits to the right. */
export function PointerArt({ className }: ArtProps) {
  const dots = useSvgId("pt");
  const shirt = "#1fa36b";
  const shirtDark = "#178a59";
  return (
    <Svg viewBox="0 0 400 440" className={className}>
      <defs>
        <DotPattern id={dots} color={C.tint} opacity={0.3} />
      </defs>
      <ellipse cx="170" cy="428" rx="170" ry="14" fill={`url(#${dots})`} />
      <path d="M58 440 C 56 330 92 252 158 232 L 214 234 C 262 256 278 340 268 440 Z" fill={shirt} />
      <path d="M58 440 C 56 330 92 252 158 232 C 120 290 108 360 112 440 Z" fill={shirtDark} />
      <path d="M168 196 h40 v44 q-20 14 -40 0 z" fill={C.skinShade} />
      <path d="M158 232 Q188 262 218 234" stroke={shirtDark} strokeWidth="7" fill="none" strokeLinecap="round" />
      <g transform="rotate(8 190 150)">
        <path
          d="M128 150 C 120 96 160 76 196 80 C 236 84 256 118 248 158 C 242 196 214 214 188 212 C 154 210 132 186 128 150 Z"
          fill={C.skin}
        />
        <path
          d="M124 150 C 112 92 168 62 214 78 C 236 86 248 100 252 116 C 230 104 200 104 178 110 C 168 126 160 140 146 152 C 140 156 132 156 124 150 Z"
          fill={C.hair}
        />
        <circle cx="150" cy="160" r="13" fill={C.skin} />
        <path d="M148 154 q6 6 0 12" stroke={C.skinShade} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M196 146 q8 -7 16 0 M224 146 q8 -7 16 0" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M206 176 q14 12 30 0" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx="244" cy="164" r="7" fill={C.pink} opacity=".55" />
        <circle cx="194" cy="166" r="7" fill={C.pink} opacity=".55" />
      </g>
      <g className="ill-point">
        <path d="M206 262 C 236 250 262 244 286 240" stroke={shirt} strokeWidth="44" fill="none" strokeLinecap="round" />
        <path d="M286 240 L 330 226" stroke={C.skin} strokeWidth="30" fill="none" strokeLinecap="round" />
        <circle cx="336" cy="222" r="23" fill={C.skin} />
        <path d="M348 212 L 384 198" stroke={C.skin} strokeWidth="13" strokeLinecap="round" />
        <path d="M326 206 L 344 198" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <path d="M330 232 q10 2 18 -6 M326 222 q10 2 18 -6" stroke={C.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </Svg>
  );
}

type HairStyle = "short" | "long" | "curly" | "bun" | "bald";

export interface AvatarLook {
  bg: string;
  skin: string;
  hair: string;
  style: HairStyle;
  shirt: string;
  glasses?: boolean;
  beard?: boolean;
}

/** Looks for the demo staff, so their portraits stay the same everywhere. */
const LOOKS: Record<string, AvatarLook> = {
  u_admin: { bg: C.pink, skin: "#f3c9a0", hair: "#b8742f", style: "long", shirt: C.teal },
  u_james: { bg: C.lime, skin: C.skin, hair: "#3a2a20", style: "short", shirt: C.teal },
  u_priya: { bg: C.pink, skin: "#c98a5a", hair: "#2a1d18", style: "long", shirt: C.leaf2 },
  u_tom: { bg: C.sun, skin: "#f3c9a0", hair: C.hair, style: "curly", shirt: C.ink, glasses: true },
  u_aisha: { bg: C.tint, skin: "#8a5636", hair: "#1c1310", style: "bun", shirt: C.pinkDark },
  u_daniel: { bg: "#cfe6f5", skin: "#e9b07e", hair: "#5b3a24", style: "bald", shirt: C.lime, beard: true },
};

const FALLBACK_LOOKS: AvatarLook[] = [
  { bg: C.sun, skin: "#e9b07e", hair: "#2a1d18", style: "short", shirt: C.leaf2 },
  { bg: C.tint, skin: "#f3c9a0", hair: "#b8742f", style: "bun", shirt: C.teal },
  { bg: C.pink, skin: "#8a5636", hair: "#1c1310", style: "curly", shirt: C.ink },
];

export function avatarLook(userId: string): AvatarLook {
  if (LOOKS[userId]) return LOOKS[userId];
  const hash = [...userId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return FALLBACK_LOOKS[hash % FALLBACK_LOOKS.length];
}

/** Round illustrated portrait. */
export function Avatar({ look, className }: ArtProps & { look: AvatarLook }) {
  const clip = useSvgId("av");
  const shade = "rgba(0,0,0,.12)";
  const hair = {
    short: <path d="M48 72 C 44 36 116 32 112 70 C 106 56 88 50 70 54 C 60 58 54 64 48 72 Z" fill={look.hair} />,
    long: <path d="M48 76 C 44 38 116 34 112 76 C 100 58 82 50 64 58 C 56 64 52 70 48 76 Z" fill={look.hair} />,
    curly: (
      <>
        {[
          [52, 62, 12],
          [62, 48, 13],
          [78, 42, 14],
          [94, 46, 13],
          [106, 58, 12],
          [110, 72, 9],
          [50, 76, 9],
        ].map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={look.hair} />
        ))}
      </>
    ),
    bun: (
      <>
        <circle cx="80" cy="30" r="15" fill={look.hair} />
        <path d="M48 74 C 44 38 116 34 112 74 C 104 58 90 52 80 52 C 70 52 56 58 48 74 Z" fill={look.hair} />
      </>
    ),
    bald: null,
  }[look.style];
  return (
    <Svg viewBox="0 0 160 160" className={className}>
      <defs>
        <clipPath id={clip}>
          <circle cx="80" cy="80" r="80" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="160" height="160" fill={look.bg} />
        {look.style === "long" && <path d="M42 78 C 38 30 122 30 118 78 L 124 150 L 36 150 Z" fill={look.hair} />}
        <path d="M14 170 C 14 128 48 116 80 116 C 112 116 146 128 146 170 Z" fill={look.shirt} />
        <rect x="68" y="96" width="24" height="28" rx="9" fill={look.skin} />
        <rect x="68" y="96" width="24" height="16" fill={shade} />
        <path d="M64 118 L80 132 L96 118" stroke="rgba(255,255,255,.55)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="49" cy="80" r="8" fill={look.skin} />
        <circle cx="111" cy="80" r="8" fill={look.skin} />
        <ellipse cx="80" cy="76" rx="31" ry="35" fill={look.skin} />
        {hair}
        {look.beard && (
          <path d="M52 84 C 54 112 70 118 80 118 C 90 118 106 112 108 84 C 100 96 92 100 80 100 C 68 100 60 96 52 84 Z" fill={look.hair} />
        )}
        <circle cx="69" cy="79" r="3.4" fill={C.ink} />
        <circle cx="91" cy="79" r="3.4" fill={C.ink} />
        <path d={`M71 ${look.beard ? 92 : 93} q9 7 18 0`} stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="60" cy="90" r="5.5" fill={C.pink} opacity=".5" />
        <circle cx="100" cy="90" r="5.5" fill={C.pink} opacity=".5" />
        {look.glasses && (
          <g stroke={C.ink} strokeWidth="3" fill="none">
            <circle cx="68" cy="78" r="10" />
            <circle cx="92" cy="78" r="10" />
            <path d="M78 78 h4" />
          </g>
        )}
      </g>
    </Svg>
  );
}

/* --------------------------------------------------------------- badges */

/** Round seal with text running around the edge. */
export function SealBadge({ text, className, children }: ArtProps & { text: string; children?: React.ReactNode }) {
  const path = useSvgId("seal");
  return (
    <div className={cn("relative grid place-items-center", className)}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden focusable="false">
        <circle cx="100" cy="100" r="98" fill="currentColor" />
        <defs>
          <path id={path} d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" />
        </defs>
        <g className="ill-spin-slow">
          <text
            fill={C.ink}
            fontSize="15.5"
            fontWeight="600"
            letterSpacing="3.2"
            style={{ fontFamily: "var(--font-host-grotesk), sans-serif" }}
          >
            <textPath href={`#${path}`}>{text}</textPath>
          </text>
        </g>
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

export { Leaf, Flower, Sparkle };
