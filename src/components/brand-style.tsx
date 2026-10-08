"use client";

import { useEffect } from "react";

import { useAppStore } from "@/lib/store";

/** Applies the brand colour chosen in Settings → Branding to the whole app. */
export function BrandStyle() {
  const color = useAppStore((s) => s.settings.brandColor);
  const name = useAppStore((s) => s.settings.brandName);

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", color);
  }, [color]);

  useEffect(() => {
    if (!document.title.includes(name)) document.title = `${name} Hub`;
  }, [name]);

  return null;
}
