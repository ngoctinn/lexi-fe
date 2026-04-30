"use server";

import { revalidatePath } from "next/cache";
import { apiFetchDirect } from "@/lib/api/fetch";
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

/**
 * Get all users (admin only)
 * Endpoint: GET /admin/users
 * Returns empty array if user is not admin (403 Forbidden)
 * 
 * Note: Backend actually returns {success: true, data: {users: [], total_count: 0}}
 * despite docs saying direct body
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const response = await apiFetchDirect<any>("/admin/users", {
      cache: "no-store",
    });

    if (!response) {
      return [];
    }

    const data = response.data || response;
    const users = data.users || [];
    
    return users;
  } catch (error: any) {
    if (error?.message?.includes("Forbidden") || error?.message?.includes("403")) {
      return [];
    }
    return [];
  }
}

/**
 * Get all scenarios (admin only)
 * Endpoint: GET /admin/scenarios
 * Returns empty array if user is not admin (403 Forbidden)
 * 
 * Note: Backend actually returns {success: true, data: {scenarios: [], total_count: 0}}
 * despite docs saying direct body
 */
export async function getAdminScenarios(): Promise<AdminScenario[]> {
  try {
    const response = await apiFetchDirect<any>("/admin/scenarios", {
      cache: "no-store",
    });

    if (!response) {
      return [];
    }

    const data = response.data || response;
    const scenarios = data.scenarios || [];
    
    return scenarios;
  } catch (error: any) {
    if (error?.message?.includes("Forbidden") || error?.message?.includes("403")) {
      return [];
    }
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
    const response = await apiFetchDirect<any>(
      `/admin/users/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

    if (!response) {
      return {
        success: false,
        error: "Empty response from server",
      };
    }

    // Backend returns {success: true, data: {...}}
    const user = response.data || response;

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return {
      success: true,
      data: user,
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
    const response = await apiFetchDirect<any>(
      "/admin/scenarios",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (!response) {
      return {
        success: false,
        error: "Empty response from server",
      };
    }

    // Backend returns {success: true, data: {...}}
    const scenario = response.data || response;

    revalidatePath("/admin");
    revalidatePath("/admin/scenarios");

    return {
      success: true,
      data: scenario,
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
    const response = await apiFetchDirect<any>(
      `/admin/scenarios/${scenarioId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

    if (!response) {
      return {
        success: false,
        error: "Empty response from server",
      };
    }

    // Backend returns {success: true, data: {...}}
    const scenario = response.data || response;

    revalidatePath("/admin");
    revalidatePath("/admin/scenarios");

    return {
      success: true,
      data: scenario,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Không thể cập nhật kịch bản.",
    };
  }
}
