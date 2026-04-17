import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const emptyVariants = cva(
  "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 text-center text-balance transition-all",
  {
    variants: {
      variant: {
        default: "p-6",
        dashed: "rounded-xl border border-dashed border-control-border-subtle p-8 bg-muted/5",
        outline: "rounded-xl border border-control-border bg-card p-8 shadow-sm",
        flat: "p-12 bg-muted/10 rounded-2xl",
      },
      size: {
        sm: "gap-2 p-4",
        default: "gap-4 p-8",
        lg: "gap-6 p-12",
        full: "h-full min-h-[320px] p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    }
  }
)

function Empty({ 
  className, 
  variant = "default",
  size = "default",
  ...props 
}: React.ComponentProps<"div"> & VariantProps<typeof emptyVariants>) {
  return (
    <div
      data-slot="empty"
      data-variant={variant}
      className={cn(emptyVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/80 [&_svg:not([class*='size-'])]:size-5",
        circle: "flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 [&_svg:not([class*='size-'])]:size-6",
        destructive: "flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive [&_svg:not([class*='size-'])]:size-6",
        image: "h-auto w-auto max-w-[200px] mb-4 opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-sm font-semibold tracking-tight text-foreground/90", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-sm/relaxed text-muted-foreground/80 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
