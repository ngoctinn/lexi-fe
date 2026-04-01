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
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Logo } from "@/components/shared/logo";

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card size="lg" className="overflow-visible shadow-lg">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Logo size="default" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Quên mật khẩu?
          </CardTitle>
          <CardDescription>
            Đừng lo! Vui lòng nhập email đăng ký, chúng tôi sẽ gửi mã khôi phục cho bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-6">
              <FieldGroup className="gap-6">
                <Field>
                  <FieldLabel htmlFor="email" className="text-foreground/80">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    size="2xl"
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                  />
                </Field>
                <Button type="submit" size="2xl" className="w-full text-base mt-2">
                  Gửi mã xác nhận
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
