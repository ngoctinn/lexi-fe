"use server";

import { redirect } from "next/navigation";
import { updateProfile } from "@/features/profile/api/profile.actions";
import { onboardingSchema, type OnboardingActionState } from "../types/schema";

/**
 * Server Action xử lý lưu thông tin onboarding
 * Layer 3: Interface Adapter
 */
export async function saveOnboardingAction(
  prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  // 1. Chuyển đổi và Validate dữ liệu form
  const rawData = {
    display_name: formData.get("display_name"),
    current_level: formData.get("current_level"),
    target_level: formData.get("target_level"),
    learning_goal_text: formData.get("learning_goal_text"),
  };

  const validated = onboardingSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Vui lòng kiểm tra lại thông tin.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // 2. Gọi hàm updateProfile (đã được chuẩn hóa dùng PATCH /profile)
    // Truyền thêm is_new_user: false để đánh dấu hoàn thành onboarding
    const result = await updateProfile({
      ...validated.data,
      learning_goal: validated.data.target_level,
      is_new_user: false,
    });

    if (!result.success) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Onboarding failed:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Đã có lỗi xảy ra khi lưu thiết lập.",
    };
  }

  // 3. Thành công -> Chuyển hướng về Dashboard
  // AppLayout sẽ không redirect về /onboarding nữa vì is_new_user đã là false
  redirect("/dashboard");
}
