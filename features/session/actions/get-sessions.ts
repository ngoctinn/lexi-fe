"use server";

import { apiRequest } from "@/lib/api/client";
import type { Session } from "@/features/session/types/session.types";
import { isMockAuthSession } from "../api/session-auth";
import { mockSessionApi } from "../api/session-mock";

export async function getSessions(): Promise<Session[]> {
  if (await isMockAuthSession()) {
    return mockSessionApi.getSessions();
  }

  try {
    const response = await apiRequest<{
      success: boolean;
      sessions?: Session[];
    }>("/sessions", {
      cache: "no-store",
    });

    return response.sessions ?? [];
  } catch (err) {
    // Don't let a single failing API call crash the whole dashboard server render.
    // Surface the error in server logs for debugging and return an empty list.
    console.error("[session] getSessions failed:", err);
    return [];
  }
}
