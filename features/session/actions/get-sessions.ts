"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";
import type { Session } from "@/features/session/types/session.types";

/**
 * Get all sessions for current user
 * Pure Next.js pattern: fetch directly, handle errors gracefully
 */
export async function getSessions(): Promise<Session[]> {
  try {
    const response = await apiFetch<ApiResponse<{ sessions: Session[] }>>(
      "/sessions",
      {
        cache: "no-store",
      }
    );

    if (!response.success) {
      console.error("[getSessions] API error:", response.message);
      return [];
    }

    return response.data?.sessions ?? [];
  } catch (error) {
    console.error("[getSessions] Error:", error instanceof Error ? error.message : error);
    return [];
  }
}
