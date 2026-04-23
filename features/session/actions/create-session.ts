"use server";

import { apiRequest } from "@/lib/api/client";
import type {
  CreateSessionDto,
  CreateSessionResult,
} from "@/features/session/types/session.types";

export async function createSession(
  dto: CreateSessionDto,
): Promise<CreateSessionResult> {
  try {
    const result = await apiRequest<CreateSessionResult>("/sessions", {
      method: "POST",
      body: JSON.stringify(dto),
      cache: "no-store",
    });

    return {
      success: Boolean(result.success),
      session_id: result.session_id,
      error: result.success ? undefined : result.error,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Không thể tạo phiên học.",
    };
  }
}
