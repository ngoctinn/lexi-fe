import { VerifyForm } from "@/features/auth/components/verify-form";

export const metadata = {
  title: "Xác thực Email | Lexi",
  description: "Xác thực địa chỉ email của bạn để kích hoạt tài khoản.",
};

export default function VerifyPage() {
  return <VerifyForm className="mx-auto w-full max-w-sm" />;
}
