"use server";

import type { GetSessionResult } from "@/features/session/types/session.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getSession(sessionId: string): Promise<GetSessionResult> {
  try {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      cache: "no-store",
      // Do not cache — always fetch fresh state for conversation
    });

    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return { success: true, session: data };
  } catch (error) {
    console.error("[getSession] Failed:", error);
    return {
      success: false,
      error: "Không thể tải phiên học.",
    };
  }
}
