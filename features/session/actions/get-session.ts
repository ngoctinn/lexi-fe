"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse, ActionResult } from "@/lib/api/types";
import type { GetSessionResult, Session } from "@/features/session/types/session.types";

/**
 * Get session by ID
 * Pure Next.js pattern: return errors, don't throw
 */
export async function getSession(sessionId: string): Promise<GetSessionResult> {
  console.log("[getSession] Fetching session:", { sessionId });
  
  const response = await apiFetch<ApiResponse<Session | { session: Session }>>(
    `/sessions/${sessionId}`,
    {
      cache: "no-store",
    }
  );

  console.log("[getSession] API Response:", {
    success: response.success,
    message: response.message,
    dataKeys: response.data ? Object.keys(response.data) : null,
    session_id: (response.data as Session)?.session_id,
    fullResponse: JSON.stringify(response).substring(0, 500),
  });

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể tải phiên học.",
    };
  }

  // Handle both response formats:
  // 1. Direct: { data: { session_id, ... } }
  // 2. Nested: { data: { session: { session_id, ... } } }
  const sessionData = response.data as Session | { session: Session };
  const session = 'session_id' in sessionData 
    ? (sessionData as Session)
    : (sessionData as { session: Session }).session;

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
