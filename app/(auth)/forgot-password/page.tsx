import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata = {
  title: "Quên mật khẩu | Lexi",
  description: "Yêu cầu khôi phục mật khẩu tài khoản Lexi của bạn.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm className="mx-auto w-full max-w-md" />;
}
