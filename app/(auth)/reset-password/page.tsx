import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = {
  title: "Đặt lại mật khẩu | Lexi",
  description: "Đặt lại mật khẩu mới cho tài khoản Lexi của bạn.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <ResetPasswordForm 
      email={email} 
    />
  );
}
