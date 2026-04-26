"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse, ActionResult } from "@/lib/api/types";
import type {
  CreateSessionDto,
  CreateSessionResult,
} from "@/features/session/types/session.types";

/**
 * Create new speaking session
 * Pure Next.js pattern: return errors, don't throw
 */
export async function createSession(
  dto: CreateSessionDto,
): Promise<CreateSessionResult> {
  const response = await apiFetch<
    ApiResponse<{ session_id: string; user_id: string } | { session: { session_id: string; user_id: string } }>
  >("/sessions", {
    method: "POST",
    body: JSON.stringify(dto),
    cache: "no-store",
  });

  console.log("[createSession] API Response:", {
    success: response.success,
    message: response.message,
    data: response.data,
    fullResponse: JSON.stringify(response),
  });

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể tạo phiên học.",
    };
  }

  // Handle both response formats:
  // 1. Direct: { data: { session_id, user_id } }
  // 2. Nested: { data: { session: { session_id, user_id } } }
  const data = response.data as { session_id?: string; user_id?: string } | { session: { session_id: string; user_id: string } };
  const sessionId = 'session_id' in data ? data.session_id : data.session?.session_id;
  const userId = 'user_id' in data ? data.user_id : data.session?.user_id;
  
  console.log("[createSession] Extracted values:", {
    sessionId,
    userId,
  });

  return {
    success: true,
    session_id: sessionId,
    user_id: userId,
  };
}
