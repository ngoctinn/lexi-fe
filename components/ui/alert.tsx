import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative flex flex-col w-full gap-1.5 rounded-lg border px-4 py-3.5 text-left text-sm shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        info: "bg-info/5 text-info-dark border-info/20 *:data-[slot=alert-description]:text-info-dark/80",
        success: "bg-success/5 text-success-dark border-success/20 *:data-[slot=alert-description]:text-success-dark/80",
        warning: "bg-warning/5 text-warning-dark border-warning/20 *:data-[slot=alert-description]:text-warning-dark/80",
        destructive: "bg-destructive/5 text-destructive-dark border-destructive/20 *:data-[slot=alert-description]:text-destructive-dark/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-bold [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4 group-has-[.bg-primary\/10]/alert:text-primary/80 group-has-[.bg-success\/10]/alert:text-success/80 group-has-[.bg-warning\/10]/alert:text-warning/80 group-has-[.bg-destructive\/10]/alert:text-destructive/80",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
