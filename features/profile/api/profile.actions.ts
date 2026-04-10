"use server";

import { apiRequest } from "@/lib/api/client";
import { updateTag } from "next/cache";

/**
 * Fetch thông tin profile từ Backend
 * Layer: Interface Adapter (Server Action)
 */
export async function getProfile() {
  try {
    // Gọi API Backend: GET /profile
    // Tận dụng cơ chế cache của Next.js với tag 'profile'
    const profile = await apiRequest("/profile", {
      next: { tags: ["profile"], revalidate: 0 },
    });
    return profile;
  } catch (error) {
    console.error("Fetch profile failed:", error);
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
    console.error("Update profile failed:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Đã có lỗi xảy ra khi cập nhật hồ sơ." 
    };
  }
}
