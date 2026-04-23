"use server";

import { apiRequest } from "@/lib/api/client";
import { updateTag } from "next/cache";

export interface ProfileData {
  display_name?: string;
  email?: string;
  current_level?: string;
  target_level?: string;
  learning_goal_text?: string;
  learning_goal?: string;
  avatar_url?: string;
  is_new_user?: boolean;
}

/**
 * Fetch thông tin profile từ Backend
 * Layer: Interface Adapter (Server Action)
 */
export async function getProfile(): Promise<ProfileData | null> {
  try {
    // Gọi API Backend: GET /profile và gắn cache tag để có thể invalidate sau khi update.
    const profile = await apiRequest<ProfileData>("/profile", {
      next: { tags: ["profile"] },
    });
    return profile;
  } catch (error) {
    console.error("[profile] fetchProfile failed:", error);
    return null;
  }
}

/**
 * Cập nhật thông tin profile (Dùng cho cả Onboarding và Edit Profile)
 * Layer: Interface Adapter (Server Action)
 */
export async function updateProfile(data: {
  display_name?: string;
  current_level?: string;
  target_level?: string;
  learning_goal_text?: string;
  learning_goal?: string;
  is_new_user?: boolean;
  avatar_url?: string;
}) {
  try {
    // Gọi API Backend: PATCH /profile theo yêu cầu chuẩn kiến trúc
    const result = await apiRequest("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    // Invalidate cache để các Server Components cập nhật lại dữ liệu
    updateTag("profile");

    return { success: true, data: result };
  } catch (error) {
    console.error("[profile] updateProfile failed:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Đã có lỗi xảy ra khi cập nhật hồ sơ.",
    };
  }
}
