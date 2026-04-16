import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full min-w-0 rounded-xl border border-control-border-subtle bg-control-bg-subtle px-3 py-2 text-base transition-colors outline-none shadow-inset-input file:inline-flex file:h-9 file:border-0 file:bg-transparent file:px-3 file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/15 md:text-sm",
  {
    variants: {
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-9 px-2.5 text-sm",
        md: "h-11 px-3",
        default: "h-11 px-3",
        lg: "h-12 px-4",
        xl: "h-14 px-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

function Input({
  className,
  type,
  size = "md",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(inputVariants({ size, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
