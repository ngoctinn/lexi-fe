"use server";

import type { Session } from "@/features/session/types/session.types";
import { mockSessionApi } from "../api/session-mock";

export async function getSessions(): Promise<Session[]> {
  return mockSessionApi.getSessions();
}
