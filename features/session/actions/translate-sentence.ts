"use server";

import { apiRequest } from "@/lib/api/client";

export interface TranslateSentenceResult {
  sentence_en: string;
  sentence_vi: string;
}

export async function translateSentenceAction(
  sentence: string,
): Promise<TranslateSentenceResult> {
  try {
    return await apiRequest<TranslateSentenceResult>(
      "/vocabulary/translate-sentence",
      {
        method: "POST",
        body: JSON.stringify({ sentence }),
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error("[translateSentence] API error:", error);
    return {
      sentence_en: sentence,
      sentence_vi: "Lỗi khi dịch câu.",
    };
  }
}
