"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api/client";
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

export async function fetchFlashcards(
  limit: number = 20,
  lastKey?: string,
): Promise<{ cards: Flashcard[]; nextKey?: string }> {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  if (lastKey) {
    params.append("last_key", lastKey);
  }

  try {
    const response = await apiRequest<{
      success: boolean;
      data?: {
        cards?: Flashcard[];
        next_key?: string;
      };
    }>(`/flashcards?${params.toString()}`);

    const data = response.data ?? { cards: [] };
    return {
      cards: data.cards ?? [],
      nextKey: data.next_key,
    };
  } catch (error) {
    console.error("[fetchFlashcards] Error:", error);
    throw error;
  }
}

export async function fetchPracticeQueue(): Promise<Flashcard[]> {
  try {
    const response = await apiRequest<{
      success: boolean;
      data?: { cards: Flashcard[] };
    }>("/flashcards/due");
    return response.data?.cards ?? [];
  } catch (error) {
    console.error("[fetchPracticeQueue] Error:", error);
    throw error;
  }
}

export async function getFlashcard(flashcardId: string): Promise<Flashcard> {
  try {
    const response = await apiRequest<{
      success: boolean;
      data?: Flashcard;
    }>(`/flashcards/${flashcardId}`);
    return response.data ?? ({} as Flashcard);
  } catch (error) {
    console.error("[getFlashcard] Error:", error);
    throw error;
  }
}

export async function saveFlashcardFromSession(
  input: SaveFlashcardFromSessionInput,
): Promise<{ success: boolean; message: string }> {
  const sourceText = normalizeText(input.source_text);
  const translatedText = normalizeText(input.translated_text);

  if (!sourceText || !translatedText) {
    return {
      success: false,
      message: "Không đủ dữ liệu để tạo flashcard.",
    };
  }

  try {
    // Gọi API backend để tạo flashcard
    const response = await apiRequest<{
      success: boolean;
      data?: {
        flashcard_id?: string;
        word?: string;
        message?: string;
      };
    }>("/flashcards", {
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

    const data = response.data ?? { message: "" };
    revalidatePath("/flashcards");
    revalidatePath("/flashcards/review");

    return {
      success: true,
      message: data.message || "Đã lưu vào flashcard.",
    };
  } catch (error) {
    console.error("[saveFlashcardFromSession] Error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Không thể lưu flashcard.",
    };
  }
}

export async function updateFlashcardSRS(
  flashcardId: string,
  difficultyStr: ReviewDifficulty,
): Promise<{ success: boolean; intervalDays?: number; reviewCount?: number; nextReviewAt?: string }> {
  // Map difficulty rating to API format
  const ratingMap: Record<ReviewDifficulty, string> = {
    forgot: "forgot",
    hard: "hard",
    good: "good",
    easy: "easy",
  };

  const rating = ratingMap[difficultyStr];

  try {
    const response = await apiRequest<{
      success: boolean;
      data?: {
        interval_days?: number;
        review_count?: number;
        next_review_at?: string;
      };
    }>(`/flashcards/${flashcardId}/review`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    });

    const data = response.data ?? {};
    revalidatePath("/flashcards/review");

    return {
      success: true,
      intervalDays: data.interval_days,
      reviewCount: data.review_count,
      nextReviewAt: data.next_review_at,
    };
  } catch (error) {
    console.error("[updateFlashcardSRS] Error:", error);
    return {
      success: false,
    };
  }
}
