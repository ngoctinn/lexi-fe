"use server";

import { revalidateTag } from "next/cache";
import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse, ActionResult } from "@/lib/api/types";

export interface ProfileData {
  display_name?: string;
  email?: string;
  current_level?: string;
  target_level?: string;
  learning_goal_text?: string;
  learning_goal?: string;
  avatar_url?: string;
  is_new_user?: boolean;
  role?: string;
}

/**
 * Fetch profile from backend
 * Pure Next.js pattern: fetch directly with cache tags
 */
export async function getProfile(): Promise<ProfileData | null> {
  const response = await apiFetch<ApiResponse<ProfileData>>("/profile", {
    next: { tags: ["profile"] },
  });

  if (!response.success) {
    console.error("[profile] getProfile failed:", response.message);
    return null;
  }

  return response.data ?? null;
}

/**
 * Update profile (used for both Onboarding and Edit Profile)
 * Pure Next.js pattern: return errors, don't throw
 */
export async function updateProfile(data: {
  display_name?: string;
  current_level?: string;
  target_level?: string;
  learning_goal_text?: string;
  learning_goal?: string;
  is_new_user?: boolean;
  avatar_url?: string;
}): Promise<ActionResult<ProfileData>> {
  const response = await apiFetch<ApiResponse<ProfileData>>("/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Đã có lỗi xảy ra khi cập nhật hồ sơ.",
    };
  }

  // Invalidate cache for Server Components to refetch
  revalidateTag("profile", "max");

  return {
    success: true,
    data: response.data,
  };
}
