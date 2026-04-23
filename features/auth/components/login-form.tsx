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
import { signIn } from "aws-amplify/auth";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";

import { translateCognitoError } from "../utils/auth-errors";
import { loginSchema, type LoginSchema } from "../schemas";
import { PasswordInput } from "./password-input";

type LoginFormProps = React.ComponentProps<"div">;

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const getRedirectTarget = React.useCallback(
    (defaultPath: string) =>
      callbackUrl?.startsWith("/") ? callbackUrl : defaultPath,
    [callbackUrl],
  );

  const onSubmit = async (data: LoginSchema) => {

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: data.email,
        password: data.password,
      });

      if (isSignedIn) {
        toast.success("Đăng nhập thành công!");
        router.push(getRedirectTarget("/dashboard"));
        router.refresh();
      } else if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
        toast.info("Tài khoản chưa được xác minh. Vui lòng kiểm tra email.");
        router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.info(`Cần thực hiện bước: ${nextStep.signInStep}`);
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
                Đăng nhập tài khoản
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground sm:text-base">
                Đăng nhập để tiếp tục học tập.
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
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-foreground/80">
                    Mật khẩu
                  </FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:text-primary-700 hover:underline underline-offset-4"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  size="xl"
                  autoComplete="current-password"
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
            Chưa có tài khoản?{" "}
            <Link
              href="/signup"
              className="font-bold text-primary hover:text-primary-700 transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
