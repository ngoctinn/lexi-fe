"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";
import { getErrorMessage } from "@/features/session/utils/error-handler";

export interface TranslateSentenceResult {
  sentence_en: string;
  sentence_vi: string;
  error?: string;
  errorCode?: string;
}

/**
 * Translate sentence
 * Pure Next.js pattern: return fallback on error
 */
export async function translateSentenceAction(
  sentence: string,
): Promise<TranslateSentenceResult> {
  const response = await apiFetch<ApiResponse<TranslateSentenceResult>>(
    "/vocabulary/translate-sentence",
    {
      method: "POST",
      body: JSON.stringify({ sentence }),
      cache: "no-store",
    }
  );

  if (!response.success) {
    const errorInfo = getErrorMessage(response.error);
    console.error("[translateSentence] API error:", response.message, response.error);
    return {
      sentence_en: sentence,
      sentence_vi: "",
      error: errorInfo.userMessage,
      errorCode: response.error,
    };
  }

  return response.data ?? {
    sentence_en: sentence,
    sentence_vi: "Lỗi khi dịch câu.",
  };
}
