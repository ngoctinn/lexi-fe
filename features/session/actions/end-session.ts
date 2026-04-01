"use server";

import { revalidatePath } from "next/cache";
import { SessionStatus } from "@/features/session/types/session.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function endSession(
  sessionId: string,
  status: SessionStatus.PAUSED | SessionStatus.COMPLETED | SessionStatus.PROCESSING_SCORING = SessionStatus.COMPLETED
): Promise<{ success: boolean; error?: string }> {
  const idToken = "";

  try {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message ?? `HTTP ${res.status}` };
    }

    revalidatePath("/sessions");
    revalidatePath(`/session/${sessionId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Không thể kết nối đến máy chủ." };
  }
}
