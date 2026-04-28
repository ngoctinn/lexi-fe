"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse, ActionResult } from "@/lib/api/types";

/**
 * End/complete speaking session
 * Pure Next.js pattern: return errors, don't throw
 */
export async function endSession(
  sessionId: string,
): Promise<ActionResult> {
  // Validate input
  if (!sessionId) {
    return {
      success: false,
      error: "Session ID không hợp lệ.",
    };
  }

  const response = await apiFetch<ApiResponse<unknown>>(
    `/sessions/${sessionId}/complete`,
    {
      method: "POST",
      cache: "no-store",
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể kết thúc phiên học.",
    };
  }

  return { success: true };
}
