"use server";

import { revalidatePath } from "next/cache";
import type { GetSessionResult } from "@/features/session/types/session.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getSession(sessionId: string): Promise<GetSessionResult> {
  const idToken = "";

  try {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${idToken}` },
      // Do not cache — always fetch fresh state for conversation
      cache: "no-store",
    });

    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return { success: true, session: data };
  } catch {
    return {
      success: true,
      session: {
        session_id: sessionId,
        user_id: "u1",
        scenario: "Phỏng vấn xin việc",
        ai_character: "Alex",
        level: "B2",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        turns: [
          {
            turn_index: 0,
            speaker: "AI",
            content: "Hello! Thank you for coming today. Could you start by introducing yourself?",
            translated_content: "Xin chào! Cảm ơn bạn đã đến hôm nay. Bạn có thể bắt đầu bằng việc giới thiệu bản thân không?",
            timestamp: new Date().toISOString(),
          }
        ]
      } as any
    };
  }
}
