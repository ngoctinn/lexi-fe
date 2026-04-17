"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const radioGroupItemVariants = cva(
  "peer relative flex shrink-0 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-primary-200",
  {
    variants: {
      variant: {
        default:
          "aspect-square size-4 rounded-full border border-control-border bg-control-bg shadow-inner-xs data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-none",
        card: "flex-col items-start gap-1 p-4 rounded-xl border border-control-border bg-control-bg text-left hover:bg-control-hover data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-50 data-[state=checked]:shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof radioGroupItemVariants>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      data-variant={variant}
      className={cn(radioGroupItemVariants({ variant, className }))}
      {...props}
    >
      {variant === "card" ? (
        <>
          {children}
          <RadioGroupPrimitive.Indicator
            data-slot="radio-group-indicator"
            className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary-100 text-primary-600 animate-in zoom-in-50 duration-200"
          >
            <CheckIcon className="size-3.5 stroke-[3]" />
          </RadioGroupPrimitive.Indicator>
        </>
      ) : (
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="flex h-full w-full items-center justify-center"
        >
          <span className="size-2 rounded-full bg-current" />
        </RadioGroupPrimitive.Indicator>
      )}
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
