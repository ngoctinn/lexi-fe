"use server";

import { apiRequest } from "@/lib/api/client";
import { isMockAuthSession } from "../api/session-auth";
import { mockSessionApi } from "../api/session-mock";

export async function endSession(
  sessionId: string,
): Promise<{ success: boolean; error?: string }> {
  if (await isMockAuthSession()) {
    return mockSessionApi.endSession(sessionId);
  }

  try {
    await apiRequest<{ success: boolean }>(`/sessions/${sessionId}/complete`, {
      method: "POST",
      cache: "no-store",
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Không thể kết thúc phiên học.",
    };
  }
}
