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
    const response = await apiRequest<{
      success: boolean;
      data?: {
        session_id?: string;
        user_id?: string;
      };
    }>("/sessions", {
      method: "POST",
      body: JSON.stringify(dto),
      cache: "no-store",
    });

    return {
      success: Boolean(response.success),
      session_id: response.data?.session_id,
      user_id: response.data?.user_id,
      error: response.success ? undefined : response.error,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Không thể tạo phiên học.",
    };
  }
}
