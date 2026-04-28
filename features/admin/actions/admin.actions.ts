"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse, ActionResult } from "@/lib/api/types";
import type { AdminScenario, AdminUser } from "@/features/admin/types";

/**
 * Get all users (admin only)
 * Pure Next.js pattern: fetch directly from /admin/users
 * Fallback to empty array if user is not admin (403 Forbidden)
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiFetch<ApiResponse<{ users: AdminUser[]; total_count: number }>>(
    "/admin/users",
    {
      cache: "no-store", // Always fresh data for admin
    }
  );

  if (!response.success) {
    // If Forbidden (403), user is not admin
    if (response.message?.includes("Forbidden") || response.error?.includes("Forbidden")) {
      console.warn("[admin] User is not admin, access denied");
      return [];
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
  const response = await apiFetch<ApiResponse<{ scenarios: AdminScenario[]; total_count: number }>>(
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
  const userId = user.user_id || user.id;
  
  const response = await apiFetch<ApiResponse<AdminUser>>(
    `/admin/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        display_name: user.display_name,
        current_level: user.current_level,
        target_level: user.target_level,
        is_active: user.is_active !== false,
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
      scenario_title: scenario.scenario_title,
      context: scenario.context,
      difficulty_level: scenario.difficulty_level,
      roles: scenario.roles,
      goals: scenario.goals,
      order: scenario.order,
      notes: scenario.notes,
      is_active: scenario.is_active,
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
