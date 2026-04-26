"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";
import type { Session } from "@/features/session/types/session.types";

/**
 * Get all sessions for current user
 * Pure Next.js pattern: fetch directly, handle errors gracefully
 */
export async function getSessions(): Promise<Session[]> {
  const response = await apiFetch<ApiResponse<{ sessions: Session[] }>>(
    "/sessions",
    {
      cache: "no-store",
    }
  );

  if (!response.success) {
    return [];
  }

  return response.data?.sessions ?? [];
}
