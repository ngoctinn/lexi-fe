"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";

export interface TranslateSentenceResult {
  sentence_en: string;
  sentence_vi: string;
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
    console.error("[translateSentence] API error:", response.message);
    return {
      sentence_en: sentence,
      sentence_vi: "Lỗi khi dịch câu.",
    };
  }

  return response.data ?? {
    sentence_en: sentence,
    sentence_vi: "Lỗi khi dịch câu.",
  };
}
