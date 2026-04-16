"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { MinusIcon } from "lucide-react";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center justify-center has-disabled:opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center rounded-xl has-aria-invalid:border-destructive has-aria-invalid:ring-1 has-aria-invalid:ring-destructive/15",
        className,
      )}
      {...props}
    />
  );
}

const slotVariants = cva(
  "relative flex size-9 items-center justify-center border-y border-r border-control-border-subtle bg-control-bg-subtle text-sm transition-all outline-none shadow-inset-input first:rounded-l-xl first:border-l last:rounded-r-xl aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-1 data-[active=true]:ring-ring/20 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/15",
  {
    variants: {
      size: {
        default: "size-9 text-sm",
        sm: "size-8 text-xs",
        lg: "size-10 text-base",
        xl: "size-11 text-base sm:size-14",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

function InputOTPSlot({
  index,
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
} & VariantProps<typeof slotVariants>) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(slotVariants({ size, className }))}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
