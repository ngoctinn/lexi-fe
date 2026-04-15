"use server";

import type { GetSessionResult } from "@/features/session/types/session.types";
import { mockSessionApi } from "../api/session-mock";

export async function getSession(sessionId: string): Promise<GetSessionResult> {
  return mockSessionApi.getSession(sessionId);
}
