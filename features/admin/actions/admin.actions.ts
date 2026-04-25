"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse, ActionResult } from "@/lib/api/types";
import type { AdminScenario, AdminUser } from "@/features/admin/types";

// Temporary mock data for development (fallback when user is not admin)
const MOCK_USERS: AdminUser[] = [
  {
    id: "user-1001",
    display_name: "Nguyễn Minh Anh",
    email: "minhanh@lexi.app",
    current_level: "A2",
    target_level: "B1",
    learning_goal_text: "Du lịch tự tin",
    status: "active",
    sessions_completed: 18,
    streak: 9,
    last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    notes: "Ưu tiên các kịch bản hỏi đường, check-in và gọi món.",
  },
  {
    id: "user-1002",
    display_name: "Trần Quốc Huy",
    email: "quochuy@lexi.app",
    current_level: "B1",
    target_level: "B2",
    learning_goal_text: "Phỏng vấn việc làm",
    status: "review",
    sessions_completed: 12,
    streak: 4,
    last_active_at: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    notes: "Cần thêm phản hồi ngữ pháp và luyện câu trả lời dài hơn.",
  },
];

/**
 * Get all users (admin only)
 * Pure Next.js pattern: fetch directly from /admin/users
 * Fallback to mock data if user is not admin (403 Forbidden)
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiFetch<ApiResponse<{ users: AdminUser[] }>>(
    "/admin/users",
    {
      cache: "no-store", // Always fresh data for admin
    }
  );

  if (!response.success) {
    // If Forbidden (403), user is not admin - use mock data
    if (response.message?.includes("Forbidden") || response.error?.includes("Forbidden")) {
      console.warn("[admin] User is not admin, using mock data for development");
      return MOCK_USERS;
    }
    
    console.error("[admin] getAdminUsers failed:", response.message);
    return [];
  }

  return response.data?.users ?? [];
}

/**
 * Get all scenarios (admin only)
 * Pure Next.js pattern: fetch directly from /admin/scenarios
 * Fallback to public scenarios if user is not admin (403 Forbidden)
 */
export async function getAdminScenarios(): Promise<AdminScenario[]> {
  const response = await apiFetch<ApiResponse<{ scenarios: AdminScenario[] }>>(
    "/admin/scenarios",
    {
      cache: "no-store", // Always fresh data for admin
    }
  );

  if (!response.success) {
    // If Forbidden (403), user is not admin - fallback to public scenarios
    if (response.message?.includes("Forbidden") || response.error?.includes("Forbidden")) {
      console.warn("[admin] User is not admin, fetching public scenarios instead");
      
      // Fetch public scenarios as fallback
      const publicResponse = await apiFetch<ApiResponse<{ scenarios: AdminScenario[] }>>(
        "/scenarios",
        { cache: "no-store" }
      );
      
      if (publicResponse.success) {
        return publicResponse.data?.scenarios ?? [];
      }
    }
    
    console.error("[admin] getAdminScenarios failed:", response.message);
    return [];
  }

  return response.data?.scenarios ?? [];
}

/**
 * Update user (admin only)
 * Pure Next.js pattern: return errors, don't throw
 */
export async function upsertAdminUser(
  user: AdminUser
): Promise<ActionResult<AdminUser>> {
  const response = await apiFetch<ApiResponse<AdminUser>>(
    `/admin/users/${user.id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        display_name: user.display_name,
        current_level: user.current_level,
        target_level: user.target_level,
        learning_goal_text: user.learning_goal_text,
        is_active: user.status === "active",
        role: user.role || "user",
      }),
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể cập nhật người dùng.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");

  return {
    success: true,
    data: response.data,
  };
}

/**
 * Create or update scenario (admin only)
 * Pure Next.js pattern: return errors, don't throw
 */
export async function upsertAdminScenario(
  scenario: AdminScenario
): Promise<ActionResult<AdminScenario>> {
  // Determine if this is create or update based on scenario_id
  const isUpdate = Boolean(scenario.scenario_id);
  
  const endpoint = isUpdate
    ? `/admin/scenarios/${scenario.scenario_id}`
    : "/admin/scenarios";
  
  const method = isUpdate ? "PATCH" : "POST";

  const response = await apiFetch<ApiResponse<AdminScenario>>(endpoint, {
    method,
    body: JSON.stringify({
      scenario_id: scenario.scenario_id,
      title: scenario.scenario_title,
      description: scenario.context,
      level: scenario.difficulty_level,
      roles: scenario.roles,
      goals: scenario.goals,
    }),
  });

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể lưu kịch bản.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/scenarios");

  return {
    success: true,
    data: response.data,
  };
}
