"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";
import type { GetSessionResult, Session } from "@/features/session/types/session.types";

/**
 * Get session by ID
 * Pure Next.js pattern: return errors, don't throw
 */
export async function getSession(sessionId: string): Promise<GetSessionResult> {
  console.log("[getSession] Fetching session:", { sessionId });
  
  const response = await apiFetch<ApiResponse<{ session: Session }>>(
    `/sessions/${sessionId}`,
    {
      cache: "no-store",
    }
  );

  console.log("[getSession] API Response:", {
    success: response.success,
    message: response.message,
    session_id: response.data?.session?.session_id,
  });

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể tải phiên học.",
    };
  }

  const session = response.data?.session;

  if (!session) {
    return {
      success: false,
      error: "Phiên học không tồn tại.",
    };
  }

  return {
    success: true,
    session,
  };
}
