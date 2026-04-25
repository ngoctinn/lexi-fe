"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse, ActionResult } from "@/lib/api/types";
import type { GetSessionResult, Session } from "@/features/session/types/session.types";

/**
 * Get session by ID
 * Pure Next.js pattern: return errors, don't throw
 */
export async function getSession(sessionId: string): Promise<GetSessionResult> {
  const response = await apiFetch<ApiResponse<Session>>(
    `/sessions/${sessionId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể tải phiên học.",
    };
  }

  return {
    success: true,
    session: response.data,
  };
}
