import { VerifyForm } from "@/features/auth/components/verify-form";

export const metadata = {
  title: "Xác thực Email | Lexi",
  description: "Xác thực địa chỉ email của bạn để kích hoạt tài khoản.",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <VerifyForm 
      email={email} 
    />
  );
}
