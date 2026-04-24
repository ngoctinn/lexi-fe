"use server";

import { apiRequest } from "@/lib/api/client";
import type { GetSessionResult, Session } from "@/features/session/types/session.types";

export async function getSession(sessionId: string): Promise<GetSessionResult> {
  try {
    const response = await apiRequest<{
      success: boolean;
      data?: Session;
    }>(`/sessions/${sessionId}`, {
      cache: "no-store",
    });

    return {
      success: response.success ?? false,
      session: response.data,
      error: response.success ? undefined : "Không thể tải phiên học.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Không thể tải phiên học.",
    };
  }
}
