import { AuthForm } from "@/features/auth/components/auth-form"

export const metadata = {
  title: "Đăng ký | Lexi",
  description: "Tham gia cộng đồng Lexi ngay hôm nay và bắt đầu hành trình học tập chuyên nghiệp.",
}

export default function SignupPage() {
  return <AuthForm mode="signup" className="mx-auto w-full max-w-md" />
}
