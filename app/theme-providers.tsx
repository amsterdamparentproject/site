"use client";

import { ThemeProvider } from "next-themes";
import siteMetadata from "@/data/siteMetadata";

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={siteMetadata.theme}
      // Disable system theme: https://github.com/pacocoursey/next-themes?tab=readme-ov-file#ignore-system-preference
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  );
}
