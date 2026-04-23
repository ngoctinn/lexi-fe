"use server";

import { apiRequest } from "@/lib/api/client";
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

export async function submitTurn(
  sessionId: string,
  request: SubmitTurnRequest,
): Promise<SubmitTurnResponse> {
  try {
    const response = await apiRequest<SubmitTurnResponse>(
      `/sessions/${sessionId}/turns`,
      {
        method: "POST",
        body: JSON.stringify({
          text: request.text,
          is_hint_used: request.is_hint_used ?? false,
          audio_url: request.audio_url,
        }),
        cache: "no-store",
      },
    );

    return {
      success: response.success ?? true,
      session: response.session,
      user_turn: response.user_turn,
      ai_turn: response.ai_turn,
      analysis_keywords: response.analysis_keywords,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Không thể gửi lượt nói. Vui lòng thử lại.",
    };
  }
}
