import { z } from "zod";

export const onboardingSchema = z.object({
  display_name: z.string().min(2, "Tên hiển thị ít nhất 2 ký tự"),
  current_level: z.string().refine((val) => ["A1", "A2", "B1", "B2", "C1", "C2"].includes(val), {
    message: "Vui lòng chọn trình độ hiện tại của bạn",
  }),
  learning_goal: z.string().refine((val) => ["A1", "A2", "B1", "B2", "C1", "C2"].includes(val), {
    message: "Vui lòng chọn mục tiêu của bạn",
  }),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

export type OnboardingActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};
