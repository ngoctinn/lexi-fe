"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-transparent hover:bg-muted hover:text-foreground aria-pressed:bg-muted data-[state=on]:bg-muted",
        outline:
          "border border-input bg-transparent hover:bg-muted aria-pressed:bg-muted data-[state=on]:bg-muted",
        soft: "border border-border/40 bg-muted/30 text-muted-foreground hover:border-border/60 hover:bg-muted/80 hover:text-foreground data-[state=on]:border-primary data-[state=on]:bg-primary-50 data-[state=on]:text-primary data-[state=on]:shadow-sm",
        warm: "border border-amber-200/40 bg-amber-50/30 text-amber-700 hover:border-amber-200/60 hover:bg-amber-50/80 hover:text-amber-900 data-[state=on]:border-amber-300 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900 data-[state=on]:shadow-sm dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:border-amber-700/60 dark:hover:bg-amber-900/50 dark:hover:text-amber-100 dark:data-[state=on]:border-amber-700 dark:data-[state=on]:bg-amber-900/70 dark:data-[state=on]:text-amber-100",
      },
      size: {
        default: "h-9 min-w-9 px-3",
        sm: "h-8 min-w-8 px-2 text-xs",
        lg: "h-11 min-w-11 px-4 text-sm font-bold",
        xl: "h-12 min-w-12 px-6 text-sm font-bold rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
