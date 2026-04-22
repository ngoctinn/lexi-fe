import { z } from "zod";

export const ONBOARDING_LEVEL_OPTIONS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

export type OnboardingLevel = (typeof ONBOARDING_LEVEL_OPTIONS)[number];

export const onboardingSchema = z.object({
  display_name: z.string().trim().min(2, "Tên hiển thị ít nhất 2 ký tự"),
  current_level: z.string().min(1, "Vui lòng chọn trình độ hiện tại của bạn"),
  target_level: z.string().min(1, "Vui lòng chọn trình độ mục tiêu của bạn"),
  learning_goal_text: z.string().trim().max(120).optional().default(""),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

export type OnboardingActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};
