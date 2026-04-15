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
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/shared/logo";
import { signUp } from "aws-amplify/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
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
    setValue,
    control,
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      terms: false,
    },
    // Best practice: don't validate until first submit, then validate on change
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const terms = useWatch({ control, name: "terms" });

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
      } else if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để nhận mã xác thực.");
        router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error(translateCognitoError(error));
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card size="lg" className="overflow-visible shadow-lg">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex items-center justify-center gap-4">
            <Logo size="default" />
            <div className="h-6 w-px bg-border shrink-0" />
            <CardTitle className="text-xl font-bold tracking-tight">
              Đăng ký
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-8">
              {/* Google Auth Placeholder */}
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="2xl"
                  className="w-full border-control-border-subtle bg-control-bg-subtle/50 hover:bg-control-hover"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 size-5" data-icon="inline-start">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Đăng ký với Google
                </Button>
              </div>

              <div className="relative text-center text-xs uppercase tracking-widest text-muted-foreground after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-3">Hoặc</span>
              </div>

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

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password" title="password">Mật khẩu</FieldLabel>
                  <PasswordInput
                    id="password"
                    size="xl"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  {errors.password && <FieldError>{errors.password.message}</FieldError>}
                </Field>

                <Field orientation="horizontal" className="items-start gap-2" data-invalid={!!errors.terms}>
                  <Checkbox
                    id="terms"
                    checked={terms}
                    onCheckedChange={(checked) => setValue("terms", checked === true)}
                    aria-invalid={!!errors.terms}
                  />
                  <div className="grid gap-1 leading-none">
                    <FieldLabel htmlFor="terms" className="text-xs font-normal text-muted-foreground cursor-pointer">
                      Tôi đồng ý với{" "}
                      <Link href="/terms" className="underline hover:text-primary">Điều khoản</Link>
                      {" "}và{" "}
                      <Link href="/privacy" className="underline hover:text-primary">Chính sách bảo mật</Link>.
                    </FieldLabel>
                    {errors.terms && <FieldError>{errors.terms.message}</FieldError>}
                  </div>
                </Field>

                <Button type="submit" size="2xl" className="w-full text-base" disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
                </Button>
              </FieldGroup>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t bg-muted/30 py-6 text-center">
          <div className="text-sm text-balance text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-bold text-foreground hover:text-primary transition-colors">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
