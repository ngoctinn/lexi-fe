"use server";

import { redirect } from "next/navigation";
import { 
  loginSchema, 
  signupSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from "../types/schema";

export type AuthActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: any;
};

const initialState: AuthActionState = {
  success: false,
  message: "",
};

export async function loginAction(
  prevState: AuthActionState, 
  formData: FormData
): Promise<AuthActionState> {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const rawData = Object.fromEntries(formData.entries());
  const validated = loginSchema.safeParse({
    ...rawData,
    remember: rawData.remember === "on",
  });

  if (!validated.success) {
    return {
      success: false,
      message: "Vui lòng kiểm tra lại thông tin.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // TODO: Implement actual authentication here (e.g. AWS Cognito, NextAuth, etc.)
  console.log("Logging in with:", validated.data);

  // For demonstration, let's assume login is successful if not 'error@example.com'
  if (validated.data.email === "error@example.com") {
    return {
      success: false,
      message: "Email hoặc mật khẩu không chính xác.",
    };
  }

  // Redirect on success
  redirect("/dashboard");
}

export async function signupAction(
  prevState: AuthActionState, 
  formData: FormData
): Promise<AuthActionState> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const rawData = Object.fromEntries(formData.entries());
  const validated = signupSchema.safeParse({
    ...rawData,
    terms: rawData.terms === "on",
  });

  if (!validated.success) {
    return {
      success: false,
      message: "Vui lòng xem lại thông tin đăng ký.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  console.log("Signing up with:", validated.data);

  // TODO: Implement actual signup here
  return {
    success: true,
    message: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.",
  };
}

export async function forgotPasswordAction(
  prevState: AuthActionState, 
  formData: FormData
): Promise<AuthActionState> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const rawData = Object.fromEntries(formData.entries());
  const validated = forgotPasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Email không hợp lệ.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  console.log("Forgot password for:", validated.data);

  // TODO: Implement actual forgot password logic
  return {
    success: true,
    message: "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu vào email của bạn.",
  };
}

export async function resetPasswordAction(
  prevState: AuthActionState, 
  formData: FormData
): Promise<AuthActionState> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const rawData = Object.fromEntries(formData.entries());
  const validated = resetPasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Vui lòng kiểm tra mã OTP và mật khẩu mới.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  console.log("Resetting password with OTP:", validated.data);

  // TODO: Implement actual password reset logic
  return {
    success: true,
    message: "Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.",
  };
}
