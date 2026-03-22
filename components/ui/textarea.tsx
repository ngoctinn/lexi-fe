import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full rounded-lg border border-control-border-subtle bg-control-bg-subtle transition-colors outline-none shadow-inset-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
  {
    variants: {
      size: {
        sm: "px-2.5 py-1.5 text-xs",
        default: "px-2.5 py-2 text-sm",
        lg: "px-3 py-2 text-sm",
        xl: "rounded-xl px-4 py-3 text-base",
        "2xl": "rounded-2xl px-5 py-4 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Textarea({ 
  className, 
  size = "default",
  ...props 
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-size={size}
      className={cn(textareaVariants({ size, className }))}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
