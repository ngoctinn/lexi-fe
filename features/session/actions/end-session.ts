"use server";

import { mockSessionApi } from "../api/session-mock";

export async function endSession(
  sessionId: string,
): Promise<{ success: boolean; error?: string }> {
  return mockSessionApi.endSession(sessionId);
}
