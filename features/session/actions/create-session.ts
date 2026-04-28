"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";
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
  // Validate input
  if (!dto) {
    return {
      success: false,
      error: "Dữ liệu phiên học không hợp lệ.",
    };
  }

  if (!dto.scenario_id) {
    return {
      success: false,
      error: "Vui lòng chọn một kịch bản.",
    };
  }

  if (!dto.user_role) {
    return {
      success: false,
      error: "Vui lòng chọn vai trò của bạn.",
    };
  }

  if (!dto.ai_role) {
    return {
      success: false,
      error: "Vui lòng chọn vai trò của AI.",
    };
  }

  const response = await apiFetch<
    ApiResponse<{ session: { session_id: string; user_id: string } }>
  >("/sessions", {
    method: "POST",
    body: JSON.stringify(dto),
    cache: "no-store",
  });

  console.log("[createSession] API Response:", {
    success: response.success,
    message: response.message,
    session_id: response.data?.session?.session_id,
    user_id: response.data?.session?.user_id,
  });

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể tạo phiên học.",
    };
  }

  const session = response.data?.session;

  if (!session?.session_id) {
    return {
      success: false,
      error: "Không nhận được session_id từ server.",
    };
  }

  return {
    success: true,
    session_id: session.session_id,
    user_id: session.user_id,
  };
}
