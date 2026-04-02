"use server";

import { revalidatePath } from "next/cache";
import { SessionStatus } from "@/features/session/types/session.types";
import { apiRequest } from "@/lib/api/client";

export async function endSession(
  sessionId: string,
  status: SessionStatus.PAUSED | SessionStatus.COMPLETED | SessionStatus.PROCESSING_SCORING = SessionStatus.COMPLETED
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiRequest<{ success: boolean; message?: string }>(`/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    revalidatePath("/sessions");
    revalidatePath(`/session/${sessionId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[endSession Action] Failed:", error.message);
    
    // For development, provide a fallback to allow the flow to continue
    if (process.env.NODE_ENV === "development") {
      return { success: true };
    }
    
    return { success: false, error: error.message ?? "Đã xảy ra lỗi hệ thống khi kết thúc phiên học." };
  }
}
