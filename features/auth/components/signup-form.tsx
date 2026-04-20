"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Logo } from "@/components/shared/logo";
import { signUp } from "aws-amplify/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { translateCognitoError } from "../utils/auth-errors";
import { signupSchema, type SignupSchema } from "../schemas";
import { PasswordInput } from "./password-input";

type SignupFormProps = React.ComponentProps<"div">;

export function SignupForm({ className, ...props }: SignupFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: SignupSchema) => {
    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
          },
        },
      });

      if (isSignUpComplete) {
        toast.success("Đăng ký thành công! Đang chuyển hướng đến đăng nhập...");
        router.push("/login");
      } else if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã xác thực.",
        );
        router.push(`/verify?email=${encodeURIComponent(data.email)}`);
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
                Tạo tài khoản mới
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground sm:text-base">
                Nhập thông tin để đăng ký.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pt-0 sm:px-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
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

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password" className="text-foreground/80">
                  Mật khẩu
                </FieldLabel>
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
              </Field>

              <Button
                type="submit"
                size="xl"
                className="w-full text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang tiếp tục..." : "Tiếp tục"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t bg-muted/30 py-4 text-center">
          <div className="text-sm text-balance text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-bold text-primary hover:text-primary-700 transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
      <p className="text-balance text-center text-xs leading-relaxed text-muted-foreground">
        Khi tiếp tục, bạn đồng ý với{" "}
        <Link
          href="/terms"
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Điều khoản Dịch vụ
        </Link>{" "}
        và{" "}
        <Link
          href="/privacy"
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Chính sách Quyền riêng tư &amp; Cookie
        </Link>
        .
      </p>
    </div>
  );
}
