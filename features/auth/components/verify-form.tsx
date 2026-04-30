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
import { Field, FieldError } from "@/components/ui/field";
import { Logo } from "@/components/shared/logo";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { translateCognitoError } from "../utils/auth-errors";
import { verifySchema, type VerifySchema } from "../schemas";

type VerifyFormProps = React.ComponentProps<"div"> & {
  email?: string;
};

export function VerifyForm({
  className,
  email = "",
  ...props
}: VerifyFormProps) {
  const router = useRouter();
  const [resendCountdown, setResendCountdown] = React.useState(0);
  const [isResending, setIsResending] = React.useState(false);

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
    setValue,
    control,
  } = useForm<VerifySchema>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const otp = useWatch({ control, name: "otp" });

  // Countdown timer for resend button
  React.useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown(resendCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

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
    } catch (error) {
      toast.error(translateCognitoError(error));
    }
  };

  const handleResendCode = async () => {
    // Rate limiting: 60 seconds between resend attempts
    if (resendCountdown > 0) {
      toast.error(`Vui lòng chờ ${resendCountdown} giây trước khi gửi lại.`);
      return;
    }

    setIsResending(true);
    try {
      await resendSignUpCode({ username: email });
      toast.success("Đã gửi lại mã xác nhận mới vào email của bạn.");
      setResendCountdown(60); // 60 second cooldown
    } catch (error) {
      toast.error("Không thể gửi lại mã. Vui lòng thử lại sau.");
    } finally {
      setIsResending(false);
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
                Xác thực tài khoản
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground sm:text-base">
                Chúng tôi đã gửi mã xác thực 6 số đến
                <br className="hidden sm:inline" />
                <span className="font-semibold text-foreground">{email}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pt-0 sm:px-6">
          <form onSubmit={handleSubmit(onVerify)} noValidate>
            <div className="grid gap-6">
              <div className="flex flex-col items-center gap-5">
                <Field className="w-full h-auto" data-invalid={!!errors.otp}>
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
                          className="aspect-square rounded-xl border shadow-inset-input"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  {errors.otp && (
                    <FieldError className="mt-2 text-center">
                      {errors.otp.message}
                    </FieldError>
                  )}
                </Field>

                <div className="text-sm text-muted-foreground">
                  Bạn chưa nhận được mã?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    disabled={resendCountdown > 0 || isResending}
                  >
                    {resendCountdown > 0
                      ? `Gửi lại trong ${resendCountdown}s`
                      : "Gửi lại ngay"}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                size="xl"
                className="w-full text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xác nhận..." : "Xác minh tài khoản"}
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
