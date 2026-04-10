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

  // NOTE: Trong Amplify v6, việc đăng nhập (signIn) nên được thực hiện ở phía Client 
  // để hỗ trợ các giao thức bảo mật như SRP. 
  // Hãy gọi hàm này từ Client Component sau khi đã thực hiện signIn thành công 
  // để thực hiện các side effects phía server (như redirect hoặc log).
  
  return {
    success: true,
    message: "Đăng nhập thành công!",
  };
}

export async function signupAction(
  prevState: AuthActionState, 
  formData: FormData
): Promise<AuthActionState> {
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

  // Tương tự như Login, việc signUp nên được thực hiện ở phía Client.
  return {
    success: true,
    message: "Đăng ký thành công!",
  };
}

export async function forgotPasswordAction(
  prevState: AuthActionState, 
  formData: FormData
): Promise<AuthActionState> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = forgotPasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Email không hợp lệ.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // NOTE: forgotPassword nên được thực hiện ở phía Client.
  return {
    success: true,
    message: "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu vào email của bạn.",
  };
}

export async function resetPasswordAction(
  prevState: AuthActionState, 
  formData: FormData
): Promise<AuthActionState> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = resetPasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Vui lòng kiểm tra mã OTP và mật khẩu mới.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // NOTE: resetPassword nên được thực hiện ở phía Client.
  return {
    success: true,
    message: "Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.",
  };
}
