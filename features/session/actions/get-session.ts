"use server";

import { apiRequest } from "@/lib/api/client";
import type { GetSessionResult } from "@/features/session/types/session.types";

export async function getSession(sessionId: string): Promise<GetSessionResult> {
  return apiRequest<GetSessionResult>(`/sessions/${sessionId}`, {
    cache: "no-store",
  });
}
