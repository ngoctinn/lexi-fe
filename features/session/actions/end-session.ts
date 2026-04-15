"use server";

import { SessionStatus } from "@/features/session/types/session.types";
import { mockSessionApi } from "../api/session-mock";

export async function endSession(
  sessionId: string,
  status: SessionStatus.PAUSED | SessionStatus.COMPLETED | SessionStatus.PROCESSING_SCORING = SessionStatus.COMPLETED
): Promise<{ success: boolean; error?: string }> {
  if (status === SessionStatus.PAUSED || status === SessionStatus.PROCESSING_SCORING || status === SessionStatus.COMPLETED) {
    return mockSessionApi.endSession(sessionId);
  }

  return { success: false, error: "Trạng thái phiên học không hợp lệ." };
}
