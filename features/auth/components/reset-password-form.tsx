"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Logo } from "@/components/shared/logo";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  email?: string;
}

export function ResetPasswordForm({ className, email = "your-email@example.com", ...props }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState("");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card size="lg" className="overflow-visible shadow-lg">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Logo size="default" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription>
            Tạo mật khẩu mới cho tài khoản <br className="hidden sm:inline" />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-6">
              <FieldGroup className="gap-6">

                <Field className="items-center">
                  <FieldLabel htmlFor="otp" className="mb-2 text-foreground/80">Mã xác minh (OTP)</FieldLabel>
                  <InputOTP
                    id="otp"
                    maxLength={6}
                    value={otpValue}
                    onChange={(val) => setOtpValue(val)}
                    containerClassName="flex justify-center gap-2 sm:gap-4"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} size="2xl" />
                      <InputOTPSlot index={1} size="2xl" />
                      <InputOTPSlot index={2} size="2xl" />
                    </InputOTPGroup>
                    <InputOTPSeparator className="mx-1 sm:mx-2" />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} size="2xl" />
                      <InputOTPSlot index={4} size="2xl" />
                      <InputOTPSlot index={5} size="2xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </Field>

                <Field className="!mt-2">
                  <FieldLabel htmlFor="new-password" className="text-foreground/80">Mật khẩu mới</FieldLabel>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      size="2xl"
                      className="pr-12"
                      autoComplete="new-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:bg-muted/50"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FieldDescription>Mật khẩu tối thiểu 8 ký tự, bao gồm chữ cái và chữ số.</FieldDescription>
                </Field>

                <Button type="submit" size="2xl" className="w-full text-base mt-2" disabled={otpValue.length < 6}>
                  Cập nhật mật khẩu
                </Button>
              </FieldGroup>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t bg-muted/30 py-6 text-center rounded-b-xl">
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all">
            <ArrowLeft data-icon="inline-start" className="size-4" />
            Quay lại đăng nhập
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
