"use server";

import { apiRequest } from "@/lib/api/client";

interface TranslateWordApiResponse {
  word: string;
  translation_vi: string;
  part_of_speech: string;
  definition_vi: string;
  phonetic: string;
  audio_url: string;
  example_sentence: string;
  source_api: string;
  detected_phrase?: string;  // Phrase được detect từ context
  phrase_type?: string;      // "phrase" hoặc null
}

export interface TranslateWordResult {
  word: string;
  translation_vi: string;        // Bản dịch ngắn gọn
  definition_vi: string;          // Định nghĩa chi tiết
  part_of_speech?: string;        // Loại từ (noun, verb, adj...)
  phonetic?: string;
  audio_url?: string;
  example_sentence?: string;
  detected_phrase?: string;       // Phrase được detect (e.g., "look for")
  is_phrase?: boolean;            // True nếu là phrase
}

export async function translateWordAction(
  word: string,
  context?: string,
): Promise<TranslateWordResult> {
  try {
    const response = await apiRequest<{
      success: boolean;
      data?: TranslateWordApiResponse;
    }>("/vocabulary/translate", {
      method: "POST",
      body: JSON.stringify({ word, context }),
      cache: "no-store",
    });

    const payload: TranslateWordApiResponse = response.data ?? { 
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
  } catch (error) {
    console.error("[translateWord] API error:", error);
    return {
      word,
      translation_vi: "Lỗi khi gọi API dịch.",
      definition_vi: "",
    };
  }
}
