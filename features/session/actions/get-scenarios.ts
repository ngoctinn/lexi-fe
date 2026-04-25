"use server";

import { apiPublicFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";
import type { Scenario } from "@/features/session/types/session.types";

/**
 * Get all scenarios (public endpoint, no auth required)
 * Pure Next.js pattern: fetch directly
 */
export async function getScenarios(): Promise<Scenario[]> {
  const response = await apiPublicFetch<ApiResponse<{ scenarios: Scenario[] }>>(
    "/scenarios",
    {
      cache: "no-store", // Always fresh data for scenarios
    }
  );

  if (!response.success) {
    console.error("[session] getScenarios failed:", response.message);
    return [];
  }

  return response.data?.scenarios ?? [];
}
