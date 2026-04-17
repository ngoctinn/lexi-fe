import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap transition-all outline-none cursor-pointer select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary-shadow bg-primary text-primary-foreground shadow-[inset_0_-4px_0_0_var(--color-primary-shadow)] hover:bg-primary-600",
        outline:
          "border-2 border-control-border bg-control-bg text-foreground shadow-[inset_0_-4px_0_0_var(--color-control-border)] hover:bg-control-hover hover:text-foreground",
        secondary:
          "border border-border bg-background text-foreground shadow-[inset_0_-4px_0_0_var(--color-border)] hover:bg-muted/40",
        ghost:
          "border border-control-border-subtle bg-control-bg-subtle text-foreground shadow-none hover:bg-control-hover aria-expanded:bg-muted aria-expanded:text-foreground active:translate-y-0! active:shadow-none!",
        destructive:
          "border border-destructive/10 bg-destructive/5 text-destructive shadow-none hover:bg-destructive/10",
        link: "!h-auto !min-h-0 !rounded-none !border-0 !bg-transparent !px-0 !py-0 !font-medium !text-primary-700 !shadow-none active:!translate-y-0 hover:!text-primary-800 hover:!underline",
        soft: "border border-primary/10 bg-primary/5 text-primary shadow-none hover:bg-primary/10",
        "soft-warning":
          "border border-warning/10 bg-warning/5 text-warning shadow-none hover:bg-warning/10",
        "soft-success":
          "border border-success/10 bg-success/5 text-success shadow-none hover:bg-success/10",
        "soft-info":
          "border border-info/10 bg-info/5 text-info shadow-none hover:bg-info/10",
        "level-a1":
          "border-emerald-700 bg-emerald-500 text-white shadow-[inset_0_-4px_0_0_#047857] hover:bg-emerald-600",
        "level-a2":
          "border-cyan-700 bg-cyan-500 text-white shadow-[inset_0_-4px_0_0_#0e7490] hover:bg-cyan-600",
        "level-b1":
          "border-blue-700 bg-blue-500 text-white shadow-[inset_0_-4px_0_0_#1d4ed8] hover:bg-blue-600",
        "level-b2":
          "border-indigo-700 bg-indigo-500 text-white shadow-[inset_0_-4px_0_0_#4338ca] hover:bg-indigo-600",
        "level-c1":
          "border-purple-700 bg-purple-500 text-white shadow-[inset_0_-4px_0_0_#6d28d9] hover:bg-purple-600",
        "level-c2":
          "border-rose-700 bg-rose-500 text-white shadow-[inset_0_-4px_0_0_#be123c] hover:bg-rose-600",
      },
      size: {
        xs: "h-7 gap-1 rounded-lg px-2 text-xs active:!translate-y-[1px] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-lg px-3 text-sm active:!translate-y-[1px] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-11 gap-2 rounded-xl px-4 text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 [&_svg:not([class*='size-'])]:size-4",
        default:
          "h-11 gap-2 rounded-xl px-4 text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 gap-2 px-5 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-4",
        xl: "h-14 gap-2.5 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11 rounded-xl",
        "icon-xs":
          "size-7 rounded-lg active:!translate-y-[1px] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 rounded-xl active:!translate-y-[2px]",
        "icon-xl": "size-14 rounded-xl active:!translate-y-[2px]",
        "icon-2xl": "size-24 rounded-full active:!translate-y-[2px] [&_svg:not([class*='size-'])]:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
