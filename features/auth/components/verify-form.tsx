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
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Logo } from "@/components/shared/logo";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { translateCognitoError } from "../utils/auth-errors";
import { verifySchema, type VerifySchema } from "../schemas";

interface VerifyFormProps extends React.ComponentProps<"div"> {
  email?: string;
}

export function VerifyForm({ className, email = "", ...props }: VerifyFormProps) {
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
    setValue,
    watch,
  } = useForm<VerifySchema>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onVerify = async (data: VerifySchema) => {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: data.otp,
      });

      if (isSignUpComplete) {
        toast.success("Xác thực thành công! Bạn có thể đăng nhập ngay.");
        router.push("/login?verified=true");
      }
    } catch (error: any) {
      console.error("Verification Error:", error);
      toast.error(translateCognitoError(error));
    }
  };

  const handleResendCode = async () => {
    try {
      await resendSignUpCode({ username: email });
      toast.success("Đã gửi lại mã xác nhận mới vào email của bạn.");
    } catch (error: any) {
      console.error("Resend Error:", error);
      toast.error("Không thể gửi lại mã. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card size="lg" className="mx-auto w-full overflow-visible shadow-lg">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Logo size="default" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Xác thực tài khoản
          </CardTitle>
          <CardDescription>
            Chúng tôi đã gửi mã xác thực 6 số đến <br className="hidden sm:inline" />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-6 sm:px-8">
          <form onSubmit={handleSubmit(onVerify)} noValidate>
            <div className="grid gap-8">
              <div className="flex flex-col gap-6 items-center">
                <Field className="w-full h-auto" data-invalid={!!errors.otp}>
                  <InputOTP
                    id="otp"
                    maxLength={6}
                    value={watch("otp")}
                    onChange={(val) => setValue("otp", val, { shouldValidate: isSubmitted })}
                    containerClassName="w-full"
                    aria-invalid={!!errors.otp}
                  >
                    <InputOTPGroup className="w-full justify-between gap-1">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          size="2xl"
                          className="rounded-xl border shadow-inset-input aspect-square"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  {errors.otp && <FieldError className="text-center mt-2">{errors.otp.message}</FieldError>}
                </Field>

                <div className="text-sm text-muted-foreground">
                  Bạn chưa nhận được mã?{" "}
                  <button
                    type="button"
                    className="font-bold text-foreground hover:text-primary transition-colors"
                    onClick={handleResendCode}
                  >
                    Gửi lại ngay
                  </button>
                </div>
              </div>

              <Button type="submit" size="2xl" className="w-full text-base" disabled={isSubmitting}>
                {isSubmitting ? "Đang xác nhận..." : "Xác minh tài khoản"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t bg-muted/30 py-6">
          <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all">
            <ArrowLeft className="size-4" />
            Quay lại đăng nhập
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
