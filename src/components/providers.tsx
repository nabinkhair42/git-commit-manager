"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster
          theme="dark"
          richColors
          position="bottom-right"
          closeButton
        />
      </TooltipProvider>
    </ThemeProvider>
  );
}
