"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = React.ComponentProps<typeof Input>;

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
        className="absolute right-2.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg border border-control-border-subtle bg-control-bg-subtle text-muted-foreground shadow-none transition-all outline-none cursor-pointer select-none hover:bg-control-hover focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:shadow-none"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
