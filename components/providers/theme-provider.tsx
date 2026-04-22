"use client";

import { type ComponentProps } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  // Workaround for React 19 / Next.js 16 warning about <script> tags rendered
  // inside components. next-themes injects an inline script to avoid FOUC; in
  // React 19 this causes a dev warning. Passing a non-JS MIME type on the
  // client side keeps the script inert while preserving SSR behavior.
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  );
}
