"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse, ActionResult } from "@/lib/api/types";
import type {
  AdminScenario,
  AdminUser,
  UpdateAdminUserRequest,
  UpsertAdminScenarioRequest,
} from "@/features/admin/types";

/**
 * Get all users (admin only)
 * Endpoint: GET /admin/users
 * Returns empty array if user is not admin (403 Forbidden)
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiFetch<
    ApiResponse<{ users: AdminUser[]; total_count: number }>
  >("/admin/users", {
    cache: "no-store",
  });

  if (!response.success) {
    if (
      response.message?.includes("Forbidden") ||
      response.error?.includes("Forbidden")
    ) {
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
 * Endpoint: GET /admin/scenarios
 * Fallback to public scenarios if user is not admin (403 Forbidden)
 */
export async function getAdminScenarios(): Promise<AdminScenario[]> {
  const response = await apiFetch<
    ApiResponse<{ scenarios: AdminScenario[]; total_count: number }>
  >("/admin/scenarios", {
    cache: "no-store",
  });

  if (!response.success) {
    if (
      response.message?.includes("Forbidden") ||
      response.error?.includes("Forbidden")
    ) {
      console.warn(
        "[admin] User is not admin, fetching public scenarios instead"
      );

      // Fetch public scenarios as fallback
      const publicResponse = await apiFetch<
        ApiResponse<{ scenarios: AdminScenario[] }>
      >("/scenarios", { cache: "no-store" });

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
 * Endpoint: PATCH /admin/users/{userId}
 */
export async function updateAdminUser(
  userId: string,
  data: UpdateAdminUserRequest
): Promise<ActionResult<AdminUser>> {
  const response = await apiFetch<ApiResponse<AdminUser>>(
    `/admin/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
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
 * Create scenario (admin only)
 * Endpoint: POST /admin/scenarios
 */
export async function createAdminScenario(
  data: UpsertAdminScenarioRequest
): Promise<ActionResult<AdminScenario>> {
  const response = await apiFetch<ApiResponse<AdminScenario>>(
    "/admin/scenarios",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể tạo kịch bản.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/scenarios");

  return {
    success: true,
    data: response.data,
  };
}

/**
 * Update scenario (admin only)
 * Endpoint: PATCH /admin/scenarios/{scenarioId}
 */
export async function updateAdminScenario(
  scenarioId: string,
  data: Partial<UpsertAdminScenarioRequest>
): Promise<ActionResult<AdminScenario>> {
  const response = await apiFetch<ApiResponse<AdminScenario>>(
    `/admin/scenarios/${scenarioId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể cập nhật kịch bản.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/scenarios");

  return {
    success: true,
    data: response.data,
  };
}
