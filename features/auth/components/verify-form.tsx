"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Logo } from "@/components/shared/logo";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

interface VerifyFormProps extends React.ComponentProps<"div"> {
  email?: string;
}

export function VerifyForm({ className, email = "your-email@example.com", ...props }: VerifyFormProps) {
  const [value, setValue] = React.useState("");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card size="lg" className="mx-auto w-full max-w-sm overflow-visible shadow-lg">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Logo size="default" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Kiểm tra email của bạn
          </CardTitle>
          <CardDescription>
            Chúng tôi đã gửi mã xác thực 6 số đến <br className="hidden sm:inline" />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-6">
              <FieldGroup className="gap-6 items-center">
                <Field className="items-center">
                  <FieldLabel htmlFor="otp" className="sr-only">Mã xác nhận</FieldLabel>
                    <InputOTP
                      id="otp"
                      maxLength={6}
                      value={value}
                      onChange={(val) => setValue(val)}
                      containerClassName="w-full justify-between"
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
                <Button type="submit" size="2xl" className="w-full text-base mt-2" disabled={value.length < 6}>
                  Xác nhận
                </Button>
              </FieldGroup>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t bg-muted/30 py-6 text-center rounded-b-xl">
          <div className="text-sm text-balance text-muted-foreground">
            Bạn chưa nhận được mã?{" "}
            <button type="button" className="font-bold text-foreground hover:text-primary transition-colors">
              Gửi lại ngay
            </button>
          </div>
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all mt-2">
            <ArrowLeft data-icon="inline-start" className="size-4" />
            Quay lại đăng nhập
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
