"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";
import type { Turn } from "@/features/session/types/session.types";

export interface SubmitTurnRequest {
  text: string;
  is_hint_used?: boolean;
  audio_url?: string;
}

export interface SubmitTurnResponse {
  success: boolean;
  session?: {
    session_id: string;
    turns?: Turn[];
  };
  user_turn?: Turn;
  ai_turn?: Turn;
  analysis_keywords?: string[];
  error?: string;
}

/**
 * Submit speaking turn
 * Pure Next.js pattern: return errors, don't throw
 */
export async function submitTurn(
  sessionId: string,
  request: SubmitTurnRequest,
): Promise<SubmitTurnResponse> {
  const response = await apiFetch<ApiResponse<SubmitTurnResponse>>(
    `/sessions/${sessionId}/turns`,
    {
      method: "POST",
      body: JSON.stringify({
        text: request.text,
        is_hint_used: request.is_hint_used ?? false,
        audio_url: request.audio_url,
      }),
      cache: "no-store",
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể gửi lượt nói. Vui lòng thử lại.",
    };
  }

  const data = response.data ?? { success: true };
  return {
    success: data.success ?? true,
    session: data.session,
    user_turn: data.user_turn,
    ai_turn: data.ai_turn,
    analysis_keywords: data.analysis_keywords,
  };
}
