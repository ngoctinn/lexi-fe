"use server";

import { apiPublicFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";
import type { Scenario } from "@/features/session/types/session.types";

/**
 * Get all scenarios (public endpoint, no auth required)
 * Pure Next.js pattern: fetch directly
 */
export async function getScenarios(): Promise<Scenario[]> {
  try {
    const response = await apiPublicFetch<ApiResponse<{ scenarios: Scenario[] }>>(
      "/scenarios",
      {
        cache: "no-store",
      }
    );

    if (!response.success) {
      console.error("[getScenarios] API error:", response.message);
      return [];
    }

    return response.data?.scenarios ?? [];
  } catch (error) {
    console.error("[getScenarios] Error:", error instanceof Error ? error.message : error);
    return [];
  }
}
