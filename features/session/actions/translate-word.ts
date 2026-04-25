"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";

interface TranslateWordApiResponse {
  word: string;
  translation_vi: string;
  part_of_speech: string;
  definition_vi: string;
  phonetic: string;
  audio_url: string;
  example_sentence: string;
  source_api: string;
  detected_phrase?: string;
  phrase_type?: string;
}

export interface TranslateWordResult {
  word: string;
  translation_vi: string;
  definition_vi: string;
  part_of_speech?: string;
  phonetic?: string;
  audio_url?: string;
  example_sentence?: string;
  detected_phrase?: string;
  is_phrase?: boolean;
}

/**
 * Translate word with context
 * Pure Next.js pattern: return fallback on error
 */
export async function translateWordAction(
  word: string,
  context?: string,
): Promise<TranslateWordResult> {
  const response = await apiFetch<ApiResponse<TranslateWordApiResponse>>(
    "/vocabulary/translate",
    {
      method: "POST",
      body: JSON.stringify({ word, context }),
      cache: "no-store",
    }
  );

  if (!response.success) {
    console.error("[translateWord] API error:", response.message);
    return {
      word,
      translation_vi: "Lỗi khi gọi API dịch.",
      definition_vi: "",
    };
  }

  const payload = response.data ?? {
    word,
    translation_vi: "",
    definition_vi: "",
    part_of_speech: "",
    phonetic: "",
    audio_url: "",
    example_sentence: "",
    source_api: "",
  };

  return {
    word: payload.word,
    translation_vi: payload.translation_vi || "Không có bản dịch.",
    definition_vi: payload.definition_vi || "",
    part_of_speech: payload.part_of_speech || undefined,
    phonetic: payload.phonetic || undefined,
    audio_url: payload.audio_url || undefined,
    example_sentence: payload.example_sentence || undefined,
    detected_phrase: payload.detected_phrase || undefined,
    is_phrase: payload.phrase_type === "phrase",
  };
}
