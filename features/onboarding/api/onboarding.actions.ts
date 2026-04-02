"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api/client";
import { onboardingSchema, type OnboardingActionState } from "../types/schema";

/**
 * Server Action xử lý lưu thông tin onboarding
 * Layer 3: Interface Adapter
 */
export async function saveOnboardingAction(
  prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  // 1. Chuyển đổi và Validate dữ liệu form
  const rawData = {
    display_name: formData.get("display_name"),
    current_level: formData.get("current_level"),
    learning_goal: formData.get("learning_goal"),
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
    // 2. Gọi API Backend (Giả lập theo SRS: PUT /profile & POST /onboarding)
    // Trong thực tế sẽ gửi tới backend serverless
    console.log("Saving onboarding data:", validated.data);
    
    await apiRequest("/profile", {
      method: "PUT",
      body: JSON.stringify(validated.data),
    });

    await apiRequest("/onboarding", {
      method: "POST",
    });

    // 3. Revalidate cache cho profile (Sử dụng profile 'max' theo Next.js 16)
    revalidateTag("profile", "max");
    
  } catch (error) {
    console.error("Onboarding failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Đã có lỗi xảy ra khi lưu thiết lập.",
    };
  }

  // 4. Thành công -> Chuyển hướng về Dashboard
  redirect("/dashboard");
}

/**
 * Helper lấy profile server-side để phục vụ Guard
 */
export async function getProfileStatus() {
  try {
    // Giả lập fetch profile. Next.js sẽ tự động cache nếu dùng fetch hoặc "use cache"
    const profile = await apiRequest("/profile", {});
    return {
      is_onboarded: profile.is_onboarded ?? false,
      user: profile
    };
  } catch (error) {
    return { is_onboarded: null, error };
  }
}
