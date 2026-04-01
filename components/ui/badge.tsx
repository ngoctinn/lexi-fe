import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest leading-none whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3! hover:scale-[1.02] active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary/5 text-primary border-primary/20 [a]:hover:bg-primary/10",
        secondary:
          "bg-secondary/10 text-secondary-foreground border-border [a]:hover:bg-secondary/20",
        destructive:
          "bg-destructive/5 text-destructive-dark border-destructive/20 focus-visible:ring-destructive/20 [a]:hover:bg-destructive/10",
        success:
          "bg-success/5 text-success border-success/20 focus-visible:ring-success/20 [a]:hover:bg-success/10",
        warning:
          "bg-warning/5 text-warning border-warning/20 focus-visible:ring-warning/20 [a]:hover:bg-warning/10",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground border-transparent",
        link: "text-primary underline-offset-4 hover:underline border-transparent",
        soft: "bg-primary/10 text-primary border-primary/20 [a]:hover:bg-primary/20",
      },
      size: {
        xs: "px-1.5 py-0.5 text-[9px] gap-1 [&>svg]:size-2.5!",
        sm: "px-2 py-1 text-[10px] gap-1 [&>svg]:size-3!",
        default: "px-3 py-1.5 text-[10px] gap-1.5 [&>svg]:size-3!",
        lg: "px-4 py-2 text-[11px] gap-2 [&>svg]:size-3.5!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
