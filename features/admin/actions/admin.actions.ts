"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api/fetch";
import type { ActionResult } from "@/lib/api/types";
import type {
  AdminScenario,
  AdminUser,
  UpdateAdminUserRequest,
  CreateAdminScenarioRequest,
  UpdateAdminScenarioRequest,
} from "@/features/admin/types";

/**
 * Admin API Response Types (Direct body, no wrapper)
 * Source: lexi-be/docs/api/07-admin-VERIFIED.md
 */
interface AdminUsersResponse {
  users: AdminUser[];
  total_count: number;
}

interface AdminScenariosResponse {
  scenarios: AdminScenario[];
  total_count: number;
}

interface AdminErrorResponse {
  error: string;
}

/**
 * Get all users (admin only)
 * Endpoint: GET /admin/users
 * Returns empty array if user is not admin (403 Forbidden)
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const response = await apiFetch<AdminUsersResponse>("/admin/users", {
      cache: "no-store",
    });

    return response.users ?? [];
  } catch (error: any) {
    // Check if 403 Forbidden
    if (error?.message?.includes("Forbidden") || error?.status === 403) {
      console.warn("[admin] User is not admin, access denied");
      return [];
    }

    console.error("[admin] getAdminUsers failed:", error);
    return [];
  }
}

/**
 * Get all scenarios (admin only)
 * Endpoint: GET /admin/scenarios
 * Returns empty array if user is not admin (403 Forbidden)
 */
export async function getAdminScenarios(): Promise<AdminScenario[]> {
  try {
    const response = await apiFetch<AdminScenariosResponse>("/admin/scenarios", {
      cache: "no-store",
    });

    return response.scenarios ?? [];
  } catch (error: any) {
    // Check if 403 Forbidden
    if (error?.message?.includes("Forbidden") || error?.status === 403) {
      console.warn("[admin] User is not admin, access denied");
      return [];
    }

    console.error("[admin] getAdminScenarios failed:", error);
    return [];
  }
}

/**
 * Update user (admin only)
 * Endpoint: PATCH /admin/users/{userId}
 */
export async function updateAdminUser(
  userId: string,
  data: UpdateAdminUserRequest
): Promise<ActionResult<AdminUser>> {
  try {
    const response = await apiFetch<AdminUser>(
      `/admin/users/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Không thể cập nhật người dùng.",
    };
  }
}

/**
 * Create scenario (admin only)
 * Endpoint: POST /admin/scenarios
 */
export async function createAdminScenario(
  data: CreateAdminScenarioRequest
): Promise<ActionResult<AdminScenario>> {
  try {
    const response = await apiFetch<AdminScenario>(
      "/admin/scenarios",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    revalidatePath("/admin");
    revalidatePath("/admin/scenarios");

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Không thể tạo kịch bản.",
    };
  }
}

/**
 * Update scenario (admin only)
 * Endpoint: PATCH /admin/scenarios/{scenarioId}
 */
export async function updateAdminScenario(
  scenarioId: string,
  data: UpdateAdminScenarioRequest
): Promise<ActionResult<AdminScenario>> {
  try {
    const response = await apiFetch<AdminScenario>(
      `/admin/scenarios/${scenarioId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

    revalidatePath("/admin");
    revalidatePath("/admin/scenarios");

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Không thể cập nhật kịch bản.",
    };
  }
}
