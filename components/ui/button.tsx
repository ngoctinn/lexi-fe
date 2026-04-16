import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_2px_0_0_var(--color-primary-shadow)] hover:bg-primary-600 active:translate-y-0.5 active:shadow-none",
        outline:
          "border-2 border-control-border bg-control-bg shadow-sm hover:bg-control-hover hover:text-foreground active:translate-y-0.5 active:shadow-none",
        secondary:
          "bg-background text-foreground border border-border/60 shadow-sm hover:bg-muted/40 active:translate-y-0.5 active:shadow-none",
        ghost:
          "hover:bg-muted/80 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 shadow-sm hover:bg-destructive/20 active:translate-y-0.5 active:shadow-none",
        link: "!h-auto !min-h-0 !rounded-none !border-0 !bg-transparent !px-0 !py-0 !font-bold !shadow-none text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline",
        soft: "bg-primary/10 text-primary border border-primary/20 shadow-[0_2px_0_0_var(--color-primary-shadow-tint)] hover:bg-primary/20 active:translate-y-0.5 active:shadow-none",
        "soft-warning":
          "bg-warning/10 text-warning border border-warning/20 shadow-sm hover:bg-warning/20 active:translate-y-0.5 active:shadow-none",
        "soft-success":
          "bg-success/10 text-success border border-success/20 shadow-sm hover:bg-success/20 active:translate-y-0.5 active:shadow-none",
        "soft-info":
          "bg-info/10 text-info border border-info/20 shadow-sm hover:bg-info/20 active:translate-y-0.5 active:shadow-none",
      },
      size: {
        xs: "h-7 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-lg px-3 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-11 gap-2 rounded-xl px-4 text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 [&_svg:not([class*='size-'])]:size-4",
        default:
          "h-11 gap-2 rounded-xl px-4 text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 gap-2 px-5 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-4",
        xl: "h-14 gap-2.5 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11 rounded-xl",
        "icon-xs":
          "size-7 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 rounded-xl",
        "icon-xl": "size-14 rounded-xl",
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
