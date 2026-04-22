"use server";

import { apiRequest } from "@/lib/api/client";
import type { GetSessionResult } from "@/features/session/types/session.types";
import { isMockAuthSession } from "../api/session-auth";
import { mockSessionApi } from "../api/session-mock";

export async function getSession(sessionId: string): Promise<GetSessionResult> {
  if (await isMockAuthSession()) {
    return mockSessionApi.getSession(sessionId);
  }

  return apiRequest<GetSessionResult>(`/sessions/${sessionId}`, {
    cache: "no-store",
  });
}
