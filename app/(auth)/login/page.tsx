import { AuthForm } from "@/features/auth/components/auth-form"

export const metadata = {
  title: "Đăng nhập | Lexi",
  description: "Đăng nhập vào tài khoản Lexi của bạn để tiếp tục hành trình học tập.",
}

export default function LoginPage() {
  return <AuthForm mode="login" className="mx-auto w-full max-w-md" />
}
