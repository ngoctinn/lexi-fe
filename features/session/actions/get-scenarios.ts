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
      cache: "no-store",
    }
  );

  if (!response.success) {
    return [];
  }

  return response.data?.scenarios ?? [];
}
