"use client";

import { Headset } from "lucide-react";

import { useAppStore, useMounted } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted = false, suffix }: { className?: string; inverted?: boolean; suffix?: string }) {
  const mounted = useMounted();
  const stored = useAppStore((s) => s.settings.brandName);
  const name = mounted ? stored : "DeskSupport";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg shadow-sm">
        <Headset className="size-[18px]" />
      </div>
      <div className="leading-tight">
        <div className={cn("text-[15px] font-semibold tracking-tight", inverted && "text-white")}>{name}</div>
        {suffix && (
          <div className={cn("text-[11px] font-medium", inverted ? "text-white/60" : "text-muted-foreground")}>{suffix}</div>
        )}
      </div>
    </div>
  );
}
