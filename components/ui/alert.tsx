import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-1.5 rounded-lg border px-4 py-3.5 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-5 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-l-4 border-l-foreground",
        info: "bg-primary/10 text-primary border-l-4 border-l-primary *:data-[slot=alert-description]:text-primary/80",
        success: "bg-success/10 text-success border-l-4 border-l-success *:data-[slot=alert-description]:text-success/80",
        warning: "bg-warning/10 text-warning border-l-4 border-l-warning *:data-[slot=alert-description]:text-warning/80",
        destructive: "bg-destructive/10 text-destructive border-l-4 border-l-destructive *:data-[slot=alert-description]:text-destructive/80",
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
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
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
