"use server";

import type { Session } from "@/features/session/types/session.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getSessions(): Promise<Session[]> {
  const idToken = "";

  try {
    const res = await fetch(`${API_BASE}/sessions`, {
      headers: { Authorization: `Bearer ${idToken}` },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    const mockCreated = new Date();
    mockCreated.setHours(mockCreated.getHours() - 2);

    return [
      {
        session_id: "mock-1",
        user_id: "u1",
        scenario: "Phỏng vấn xin việc",
        ai_character: "Alex (Tuyển dụng)",
        level: "B2",
        status: "COMPLETED",
        created_at: mockCreated.toISOString(),
        scoring: {
          overall: 82.5,
          fluency: 85,
          pronunciation: 80,
          grammar: 75,
          vocabulary: 90,
          feedback: "Bạn trả lời khá lưu loát, tuy nhiên cần chú ý một số lỗi ngữ pháp về thì hiện tại hoàn thành."
        },
        hint_used_count: 2,
        skip_used_count: 0,
        new_words_count: 5
      },
      {
        session_id: "mock-2",
        user_id: "u1",
        scenario: "Shopping",
        ai_character: "Maria (Bán hàng)",
        level: "B1",
        status: "PAUSED",
        created_at: new Date().toISOString(),
      }
    ] as any;
  }
}
