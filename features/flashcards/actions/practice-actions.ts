"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse, ActionResult } from "@/lib/api/types";
import { Flashcard, ReviewDifficulty } from "../types";

interface SaveFlashcardFromSessionInput {
  session_id: string;
  turn_index: number;
  source_text: string;
  translated_text: string;
  translation_vi?: string;
  definition_vi?: string;
  part_of_speech?: string;
  phonetic?: string;
  audio_url?: string;
  example_sentence?: string;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Fetch flashcards with pagination
 * Pure Next.js pattern: fetch directly
 */
export async function fetchFlashcards(
  limit: number = 20,
  lastKey?: string,
): Promise<{ cards: Flashcard[]; nextKey?: string }> {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  if (lastKey) {
    params.append("last_key", lastKey);
  }

  const response = await apiFetch<
    ApiResponse<{ cards: Flashcard[]; next_key?: string }>
  >(`/flashcards?${params.toString()}`);

  if (!response.success) {
    console.error("[fetchFlashcards] Error:", response.message);
    return { cards: [] };
  }

  return {
    cards: response.data?.cards ?? [],
    nextKey: response.data?.next_key,
  };
}

/**
 * Fetch due flashcards for practice
 */
export async function fetchPracticeQueue(): Promise<Flashcard[]> {
  const response = await apiFetch<ApiResponse<{ cards: Flashcard[] }>>(
    "/flashcards/due"
  );

  if (!response.success) {
    console.error("[fetchPracticeQueue] Error:", response.message);
    return [];
  }

  return response.data?.cards ?? [];
}

/**
 * Get single flashcard by ID
 */
export async function getFlashcard(flashcardId: string): Promise<Flashcard | null> {
  const response = await apiFetch<ApiResponse<Flashcard>>(
    `/flashcards/${flashcardId}`
  );

  if (!response.success) {
    console.error("[getFlashcard] Error:", response.message);
    return null;
  }

  return response.data ?? null;
}

/**
 * Save flashcard from session turn
 * Pure Next.js pattern: return errors, don't throw
 */
export async function saveFlashcardFromSession(
  input: SaveFlashcardFromSessionInput,
): Promise<ActionResult<{ flashcard_id?: string; word?: string }>> {
  const sourceText = normalizeText(input.source_text);
  const translatedText = normalizeText(input.translated_text);

  if (!sourceText || !translatedText) {
    return {
      success: false,
      error: "Không đủ dữ liệu để tạo flashcard.",
    };
  }

  const response = await apiFetch<
    ApiResponse<{ flashcard_id?: string; word?: string; message?: string }>
  >("/flashcards", {
    method: "POST",
    body: JSON.stringify({
      vocab: sourceText,
      vocab_type: input.part_of_speech || "phrase",
      translation_vi: input.translation_vi || translatedText,
      definition_vi: input.definition_vi || "",
      phonetic: input.phonetic,
      audio_url: input.audio_url,
      example_sentence: input.example_sentence || sourceText,
      source_api: "session",
      source_session_id: input.session_id,
      source_turn_index: input.turn_index,
    }),
    cache: "no-store",
  });

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể lưu flashcard.",
    };
  }

  revalidatePath("/flashcards");
  revalidatePath("/flashcards/review");

  return {
    success: true,
    data: response.data,
    message: response.data?.message || "Đã lưu vào flashcard.",
  };
}

/**
 * Update flashcard SRS (Spaced Repetition System)
 * Pure Next.js pattern: return errors, don't throw
 */
export async function updateFlashcardSRS(
  flashcardId: string,
  difficultyStr: ReviewDifficulty,
): Promise<
  ActionResult<{
    interval_days?: number;
    review_count?: number;
    next_review_at?: string;
  }>
> {
  const ratingMap: Record<ReviewDifficulty, string> = {
    forgot: "forgot",
    hard: "hard",
    good: "good",
    easy: "easy",
  };

  const rating = ratingMap[difficultyStr];

  const response = await apiFetch<
    ApiResponse<{
      interval_days?: number;
      review_count?: number;
      next_review_at?: string;
    }>
  >(`/flashcards/${flashcardId}/review`, {
    method: "POST",
    body: JSON.stringify({ rating }),
  });

  if (!response.success) {
    return {
      success: false,
      error: response.message || "Không thể cập nhật flashcard.",
    };
  }

  revalidatePath("/flashcards/review");

  return {
    success: true,
    data: response.data,
  };
}
