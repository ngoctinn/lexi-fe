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
    ApiResponse<{ session_id: string; user_id: string }>
  >("/sessions", {
    method: "POST",
    body: JSON.stringify(dto),
    cache: "no-store",
  });

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể tạo phiên học.",
    };
  }

  return {
    success: true,
    session_id: response.data?.session_id,
    user_id: response.data?.user_id,
  };
}
