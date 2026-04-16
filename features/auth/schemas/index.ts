import { z } from "zod";

// --- Base Rules ---
const emailRule = z
  .string()
  .email("Email không hợp lệ")
  .min(1, "Vui lòng nhập email");
const passwordBaseRule = z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự");
const passwordStrongRule = passwordBaseRule
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ hoa")
  .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất một chữ thường")
  .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một chữ số")
  .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất một ký tự đặc biệt");

const otpRule = z.string().length(6, "Mã xác thực phải có 6 chữ số");

// --- Schemas ---
export const loginSchema = z.object({
  email: emailRule,
  password: passwordBaseRule,
  remember: z.boolean().optional(),
});

export const signupSchema = z.object({
  email: emailRule,
  password: passwordStrongRule,
});

export const forgotPasswordSchema = z.object({
  email: emailRule,
});

export const resetPasswordSchema = z
  .object({
    otp: otpRule,
    password: passwordStrongRule,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const verifySchema = z.object({
  otp: otpRule,
});

// --- Types ---
export type LoginSchema = z.infer<typeof loginSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type VerifySchema = z.infer<typeof verifySchema>;
