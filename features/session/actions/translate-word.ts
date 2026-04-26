"use server";

import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse } from "@/lib/api/types";
import { getErrorMessage } from "@/features/session/utils/error-handler";

interface VocabularyDefinition {
  part_of_speech: string;
  definition_en: string;
  definition_vi: string;
  example_en: string;
  example_vi: string;
}

interface TranslateWordApiResponse {
  word: string;
  translation_vi: string;
  phonetic: string;
  audio_url?: string;
  definitions: VocabularyDefinition[];
  synonyms: string[];
  response_time_ms: number;
  cached: boolean;
}

export interface TranslateWordResult {
  word: string;
  translation_vi: string;
  phonetic?: string;
  audio_url?: string;
  definitions: VocabularyDefinition[];
  synonyms: string[];
  response_time_ms?: number;
  cached?: boolean;
  // Backward compatibility helpers
  definition_vi: string;
  part_of_speech?: string;
  example_sentence?: string;
  error?: string;
  errorCode?: string;
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
    const errorInfo = getErrorMessage(response.error);
    console.error("[translateWord] API error:", response.message, response.error);
    return {
      word,
      translation_vi: "",
      definitions: [],
      synonyms: [],
      definition_vi: "",
      error: errorInfo.userMessage,
      errorCode: response.error,
    };
  }

  const payload = response.data;

  if (!payload) {
    return {
      word,
      translation_vi: "Không có bản dịch.",
      definitions: [],
      synonyms: [],
      definition_vi: "",
    };
  }

  // Backward compatibility: extract first definition for legacy fields
  const firstDef = payload.definitions?.[0];

  return {
    word: payload.word,
    translation_vi: payload.translation_vi || "Không có bản dịch.",
    phonetic: payload.phonetic || undefined,
    audio_url: payload.audio_url || undefined,
    definitions: payload.definitions || [],
    synonyms: payload.synonyms || [],
    response_time_ms: payload.response_time_ms,
    cached: payload.cached,
    // Backward compatibility
    definition_vi: firstDef?.definition_vi || "",
    part_of_speech: firstDef?.part_of_speech || undefined,
    example_sentence: firstDef?.example_en || undefined,
  };
}
