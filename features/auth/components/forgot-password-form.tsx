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
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Logo } from "@/components/shared/logo";
import { resetPassword } from "aws-amplify/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { translateCognitoError } from "../utils/auth-errors";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "../schemas";

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      const output = await resetPassword({ username: data.email });
      const { nextStep } = output;

      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        toast.success("Mã khôi phục đã được gửi đến email của bạn.");
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error: any) {
      console.error("Forgot Password Error:", error);
      toast.error(translateCognitoError(error));
    }
  };

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
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email" className="text-foreground/80">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    size="2xl"
                    placeholder="name@example.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  {errors.email && <FieldError>{errors.email.message}</FieldError>}
                </Field>
                <Button type="submit" size="2xl" className="w-full text-base mt-2" disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : "Gửi mã xác nhận"}
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
