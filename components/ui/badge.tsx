import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border font-bold leading-none whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3 hover:scale-[1.02] active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary-50 text-primary-600 border-primary-200 [a]:hover:bg-primary-100",
        secondary:
          "bg-secondary/10 text-secondary-foreground border-border [a]:hover:bg-secondary/20",
        destructive:
          "bg-destructive-50 text-destructive-600 border-destructive-200 focus-visible:ring-destructive/20 [a]:hover:bg-destructive-100",
        success:
          "bg-success-50 text-success-600 border-success-200 focus-visible:ring-success/20 [a]:hover:bg-success-100",
        warning:
          "bg-warning-50 text-warning-600 border-warning-200 focus-visible:ring-warning/20 [a]:hover:bg-warning-100",
        info:
          "bg-info-50 text-info-600 border-info-200 focus-visible:ring-info/20 [a]:hover:bg-info-100",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-foreground border-transparent",
        link: "text-primary underline-offset-4 hover:underline border-transparent",
      },
      size: {
        xs: "px-1.5 py-0.5 text-[10px] leading-tight",
        sm: "px-2 py-0.5 text-[12px] leading-tight",
        md: "px-3 py-1 text-[14px] leading-tight",
        default: "px-2 py-0.5 text-[12px] leading-tight",
        lg: "px-4 py-1.5 text-[16px] leading-tight",
      },
      shape: {
        default: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      shape: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  size = "md",
  shape = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      className={cn(badgeVariants({ variant, size, shape }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
