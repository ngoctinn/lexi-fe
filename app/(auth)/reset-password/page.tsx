import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = {
  title: "Đặt lại mật khẩu | Lexi",
  description: "Đặt lại mật khẩu mới cho tài khoản Lexi của bạn.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm className="mx-auto w-full max-w-md" />;
}
