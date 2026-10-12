"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";

import { BrandStyle } from "@/components/brand-style";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  // The public website is designed for one look, so it is always light.
  const pathname = usePathname();
  const forcedTheme = pathname?.startsWith("/site") ? "light" : undefined;
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange forcedTheme={forcedTheme}>
      <TooltipProvider>
        <BrandStyle />
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}
