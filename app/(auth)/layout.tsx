import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--pattern-foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--pattern-foreground)_1px,transparent_1px)] bg-size-[24px_24px]" />
      <div className="relative z-10 w-full max-w-120">{children}</div>
    </main>
  );
}
