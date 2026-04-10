import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_2px_0_0_var(--color-primary-shadow)] hover:brightness-[1.1] active:translate-y-0.5 active:shadow-none",
        outline:
          "border-2 border-control-border bg-control-bg shadow-[0_2px_0_0_rgba(0,0,0,0.05)] hover:bg-control-hover hover:text-foreground active:translate-y-0.5 active:shadow-[0_0px_0_0_rgba(0,0,0,0)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_2px_0_0_rgba(0,0,0,0.1)] hover:brightness-95 active:translate-y-0.5 active:shadow-[0_0px_0_0_rgba(0,0,0,0)]",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 shadow-[0_2px_0_0_var(--color-destructive-shadow-tint)] hover:bg-destructive/15 active:translate-y-0.5 active:shadow-none",
        link: "text-primary underline-offset-4 hover:underline",
        soft: "bg-primary/10 text-primary border border-primary/20 shadow-[0_2px_0_0_var(--color-primary-shadow-tint)] hover:bg-primary/15 active:translate-y-0.5 active:shadow-none",
        "soft-warning": "bg-warning/10 text-warning border border-warning/20 shadow-[0_2px_0_0_rgba(234,179,8,0.1)] hover:bg-warning/15 active:translate-y-0.5 active:shadow-none",
        "soft-success": "bg-success/10 text-success border border-success/20 shadow-[0_2px_0_0_rgba(34,197,94,0.1)] hover:bg-success/15 active:translate-y-0.5 active:shadow-none",
        "soft-info": "bg-info/10 text-info border border-info/20 shadow-[0_2px_0_0_rgba(59,130,246,0.1)] hover:bg-info/15 active:translate-y-0.5 active:shadow-none",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xl: "h-10 gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 [&_svg:not([class*='size-'])]:size-4.5",
        "2xl": "h-12 gap-2.5 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
        "icon-xl": "size-10",
        "icon-2xl": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
