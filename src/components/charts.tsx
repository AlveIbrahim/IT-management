"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Series {
  key: string;
  label: string;
  color: string;
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: number | string;
}

function ChartTooltip({
  active,
  payload,
  label,
  series,
}: {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  label?: string | number;
  series: Series[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground min-w-36 rounded-lg border px-3 py-2 text-xs shadow-md">
      <div className="mb-1.5 font-medium">{label}</div>
      <div className="space-y-1">
        {series.map((s) => {
          const item = payload.find((p) => p.dataKey === s.key);
          return (
            <div key={s.key} className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              <span className="text-muted-foreground flex-1">{s.label}</span>
              <span className="font-medium tabular-nums">{item?.value ?? 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegend({ series }: { series: Series[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      {series.map((s) => (
        <div key={s.key} className="text-muted-foreground flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
          {s.label}
        </div>
      ))}
    </div>
  );
}

export function TrendChart({
  data,
  series,
  xKey,
  height = 260,
}: {
  data: Record<string, string | number>[];
  series: Series[];
  xKey: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.14} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={24}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.35, strokeWidth: 1 }}
            content={<ChartTooltip series={series} />}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#fill-${s.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal single-series bars, built in HTML so labels never collide. */
export function BarList({
  items,
  valueLabel = (v: number) => v.toLocaleString("en-GB"),
  labelWidth = "9.5rem",
  className,
}: {
  items: { label: string; value: number; href?: string; hint?: string }[];
  valueLabel?: (v: number) => string;
  labelWidth?: string;
  className?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <UITooltip key={item.label}>
          <TooltipTrigger asChild>
            <div
              className="group grid cursor-default items-center gap-3 text-sm"
              style={{ gridTemplateColumns: `minmax(0, ${labelWidth}) 1fr 2.5rem` }}
            >
              <span className="text-muted-foreground group-hover:text-foreground truncate transition-colors">
                {item.label}
              </span>
              <div className="bg-muted/60 h-3 rounded-r-[4px]">
                <div
                  className="h-3 rounded-r-[4px] transition-all group-hover:opacity-85"
                  style={{ width: `${(item.value / max) * 100}%`, background: "var(--chart-1)" }}
                />
              </div>
              <span className="text-right font-medium tabular-nums">{valueLabel(item.value)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            {item.label}: {valueLabel(item.value)} ({Math.round((item.value / total) * 100)}%){item.hint ? ` · ${item.hint}` : ""}
          </TooltipContent>
        </UITooltip>
      ))}
    </div>
  );
}
