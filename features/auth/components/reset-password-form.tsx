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
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Logo } from "@/components/shared/logo";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { confirmResetPassword } from "aws-amplify/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { translateCognitoError } from "../utils/auth-errors";
import { resetPasswordSchema, type ResetPasswordSchema } from "../schemas";
import { PasswordInput } from "./password-input";

type ResetPasswordFormProps = React.ComponentProps<"div"> & {
  email?: string;
};

export function ResetPasswordForm({
  className,
  email = "",
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
    setValue,
    control,
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const otp = useWatch({ control, name: "otp" });

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: data.otp,
        newPassword: data.password,
      });

      toast.success("Đặt lại mật khẩu thành công! Hãy đăng nhập lại.");
      router.push("/login");
    } catch (error) {
      toast.error(translateCognitoError(error));
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card
        size="lg"
        className="mx-auto w-full overflow-visible gap-4 shadow-lg"
      >
        <CardHeader className="px-5 pt-5 pb-0 text-center">
          <div className="flex flex-col items-center gap-4">
            <Logo size="lg" showText={false} />
            <div className="grid gap-1.5">
              <CardTitle className="text-3xl font-bold tracking-tight text-primary-700 sm:text-4xl">
                Đặt lại mật khẩu
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground sm:text-base">
                Tạo mật khẩu mới cho tài khoản
                <br className="hidden sm:inline" />
                <span className="font-semibold text-foreground">{email}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pt-0 sm:px-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-6">
              <Field className="w-full" data-invalid={!!errors.otp}>
                <FieldLabel htmlFor="otp" className="mb-2 text-foreground/80">
                  Mã xác minh (OTP)
                </FieldLabel>
                <InputOTP
                  id="otp"
                  maxLength={6}
                  value={otp}
                  onChange={(val) =>
                    setValue("otp", val, { shouldValidate: isSubmitted })
                  }
                  containerClassName="w-full"
                  aria-invalid={!!errors.otp}
                >
                  <InputOTPGroup className="w-full justify-between gap-1">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        size="xl"
                        className="rounded-xl border shadow-inset-input aspect-square"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {errors.otp && <FieldError>{errors.otp.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.password}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-foreground/80">
                    Mật khẩu mới
                  </FieldLabel>
                </div>
                <PasswordInput
                  id="password"
                  size="xl"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
                {!errors.password && (
                  <FieldDescription className="mt-2 text-xs">
                    Mật khẩu tối thiểu 8 ký tự.
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!errors.confirmPassword}>
                <div className="flex items-center justify-between">
                  <FieldLabel
                    htmlFor="confirmPassword"
                    className="text-foreground/80"
                  >
                    Xác nhận mật khẩu mới
                  </FieldLabel>
                </div>
                <PasswordInput
                  id="confirmPassword"
                  size="xl"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
                )}
              </Field>

              <Button
                type="submit"
                size="xl"
                className="w-full text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t bg-muted/30 py-4">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-primary hover:text-primary-700 transition-all"
          >
            <ArrowLeft className="size-4" />
            Quay về Đăng nhập
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
