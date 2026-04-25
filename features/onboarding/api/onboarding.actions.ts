"use server";

import { redirect } from "next/navigation";
import { updateProfile } from "@/features/profile/api/profile.actions";
import { onboardingSchema, type OnboardingActionState } from "../types/schema";

/**
 * Server Action - Save onboarding data
 * Pure Next.js pattern: return errors, don't throw
 */
export async function saveOnboardingAction(
  prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  // 1. Validate form data
  const display_name = formData.get("display_name");
  const current_level = formData.get("current_level");
  const target_level = formData.get("target_level");
  const learning_goal_text = formData.get("learning_goal_text");

  const rawData = {
    display_name,
    current_level,
    target_level,
    learning_goal_text,
  };

  const validated = onboardingSchema.safeParse(rawData);

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Vui lòng kiểm tra lại thông tin.",
      errors: fieldErrors,
    };
  }

  // 2. Update profile via PATCH /profile
  // Mark is_new_user: false to complete onboarding
  const result = await updateProfile({
    ...validated.data,
    learning_goal: validated.data.target_level,
    is_new_user: false,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error || "Đã có lỗi xảy ra khi lưu thiết lập.",
    };
  }

  // 3. Success -> Redirect to dashboard
  redirect("/dashboard");
}
