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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Logo } from "@/components/shared/logo";
import { resetPassword } from "aws-amplify/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { translateCognitoError } from "../utils/auth-errors";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "../schemas";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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

      if (nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        toast.success("Mã khôi phục đã được gửi đến email của bạn.");
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error) {
      toast.error(translateCognitoError(error));
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card size="lg" className="overflow-visible gap-4 shadow-lg">
        <CardHeader className="px-5 pt-5 pb-0 text-center">
          <div className="flex flex-col items-center gap-4">
            <Logo size="lg" showText={false} />
            <div className="grid gap-1.5">
              <CardTitle className="text-3xl font-bold tracking-tight text-primary-700 sm:text-4xl">
                Quên mật khẩu
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground sm:text-base">
                Nhập thông tin để lấy lại mật khẩu.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pt-0 sm:px-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-5">
              <FieldGroup className="gap-5">
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email" className="text-foreground/80">
                    Địa chỉ email
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    size="xl"
                    placeholder="user@mail.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>
                <Button
                  type="submit"
                  size="xl"
                  className="w-full text-base mt-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang gửi..." : "Đặt lại mật khẩu"}
                </Button>
              </FieldGroup>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t bg-muted/30 py-4 text-center rounded-b-xl">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-700 transition-all"
          >
            <ArrowLeft data-icon="inline-start" className="size-4" />
            Quay về Đăng nhập
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
