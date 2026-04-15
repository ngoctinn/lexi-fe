"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = React.ComponentProps<typeof Input>;

/**
 * A specialized Input component for passwords with a built-in visibility toggle.
 * Follows DRY principles to avoid repeating show/hide logic.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn("pr-12", className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:bg-muted/50"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          <span className="sr-only">
            {showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
          </span>
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
