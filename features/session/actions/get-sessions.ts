"use server";

import { apiRequest } from "@/lib/api/client";
import type { Session } from "@/features/session/types/session.types";

export async function getSessions(): Promise<Session[]> {
  try {
    const response = await apiRequest<{
      success: boolean;
      data?: {
        sessions?: Session[];
      };
    }>("/sessions", {
      cache: "no-store",
    });

    return response.data?.sessions ?? [];
  } catch (err) {
    // Don't let a single failing API call crash the whole dashboard server render.
    // Surface the error in server logs for debugging and return an empty list.
    console.error("[session] getSessions failed:", err);
    return [];
  }
}
