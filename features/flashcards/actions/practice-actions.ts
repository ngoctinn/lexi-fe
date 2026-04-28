"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api/fetch";
import type { ApiResponse, ActionResult } from "@/lib/api/types";
import { z } from "zod";
import {
  FlashcardSchema,
  CreateFlashcardSchema,
  ReviewFlashcardSchema,
  FlashcardListResponseSchema,
  FlashcardResponseSchema,
  ReviewResponseSchema,
  type Flashcard,
  type ReviewDifficulty,
  type CreateFlashcardInput,
} from "../schemas/flashcard.schema";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  NetworkError,
  TimeoutError,
  parseApiError,
  getUserFriendlyMessage,
} from "../lib/errors";
import { withRetry } from "../lib/retry";

/**
 * Normalize text input
 */
function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Parse API error response and throw appropriate error
 */
function handleApiError(status: number, data: any): never {
  const { message, code } = parseApiError(status, data);

  switch (status) {
    case 400:
      throw new ValidationError(message);
    case 401:
      throw new UnauthorizedError(message);
    case 404:
      throw new NotFoundError(message);
    case 409:
      throw new ConflictError(message);
    case 408:
    case 429:
      throw new TimeoutError(message);
    default:
      if (status >= 500) {
        throw new NetworkError(message);
      }
      throw new Error(message);
  }
}

/**
 * Fetch flashcards with pagination and validation
 */
export async function fetchFlashcards(
  limit: number = 20,
  lastKey?: string,
): Promise<{ cards: Flashcard[]; nextKey?: string }> {
  try {
    // Validate inputs
    if (limit < 1 || limit > 100) {
      throw new ValidationError("Limit must be between 1 and 100");
    }

    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (lastKey) {
      params.append("last_key", lastKey);
    }

    const response = await withRetry(
      () =>
        apiFetch<ApiResponse<{ cards: Flashcard[]; next_key?: string }>>(
          `/flashcards?${params.toString()}`,
        ),
      {
        maxAttempts: 3,
        shouldRetry: (error) => error?.retryable ?? false,
      },
    );

    // Validate response structure
    if (!response.success) {
      handleApiError(400, response);
    }

    // Validate and parse flashcards with detailed logging
    const cards = (response.data?.cards ?? []).map((card, index) => {
      try {
        // Log raw card data for debugging
        console.log(`[fetchFlashcards] Card ${index}:`, JSON.stringify(card, null, 2));
        
        const parsed = FlashcardSchema.parse(card);
        console.log(`[fetchFlashcards] Card ${index} parsed successfully`);
        return parsed;
      } catch (error) {
        console.error(`[fetchFlashcards] Card ${index} validation failed`);
        console.error("[fetchFlashcards] Raw card data:", JSON.stringify(card, null, 2));
        console.error("[fetchFlashcards] Validation error:", error);
        
        // Log detailed Zod error
        if (error instanceof z.ZodError) {
          console.error("[fetchFlashcards] Zod validation errors:");
          error.errors.forEach((err) => {
            console.error(`  - Path: ${err.path.join('.')}`);
            console.error(`    Message: ${err.message}`);
            console.error(`    Received: ${JSON.stringify(err)}`);
          });
        }
        
        // Return a more specific error message
        throw new ValidationError(
          `Invalid flashcard data from server at index ${index}. Check server logs for details.`
        );
      }
    });

    return {
      cards,
      nextKey: response.data?.next_key,
    };
  } catch (error) {
    console.error("[fetchFlashcards] Error:", error);

    if (error instanceof ValidationError) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new NetworkError("Failed to fetch flashcards");
  }
}

/**
 * Fetch due flashcards for practice
 */
export async function fetchPracticeQueue(): Promise<Flashcard[]> {
  try {
    const response = await withRetry(
      () =>
        apiFetch<ApiResponse<{ cards: Flashcard[] }>>("/flashcards/due", {
          cache: "no-store",
        }),
      {
        maxAttempts: 3,
        shouldRetry: (error) => error?.retryable ?? false,
      },
    );

    if (!response.success) {
      handleApiError(400, response);
    }

    // Validate and parse flashcards
    const cards = (response.data?.cards ?? []).map((card) => {
      try {
        return FlashcardSchema.parse(card);
      } catch (error) {
        console.error("[fetchPracticeQueue] Invalid flashcard data:", card, error);
        throw new ValidationError("Invalid flashcard data from server");
      }
    });

    return cards;
  } catch (error) {
    console.error("[fetchPracticeQueue] Error:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new NetworkError("Failed to fetch practice queue");
  }
}

/**
 * Get single flashcard by ID
 */
export async function getFlashcard(
  flashcardId: string,
): Promise<Flashcard | null> {
  try {
    // Validate input
    if (!flashcardId || typeof flashcardId !== "string") {
      throw new ValidationError("Invalid flashcard ID");
    }

    const response = await withRetry(
      () =>
        apiFetch<ApiResponse<Flashcard>>(`/flashcards/${flashcardId}`, {
          cache: "no-store",
        }),
      {
        maxAttempts: 3,
        shouldRetry: (error) => error?.retryable ?? false,
      },
    );

    if (!response.success) {
      if (response.message?.includes("not found")) {
        return null;
      }
      handleApiError(404, response);
    }

    if (!response.data) {
      return null;
    }

    // Validate and parse flashcard
    try {
      return FlashcardSchema.parse(response.data);
    } catch (error) {
      console.error("[getFlashcard] Invalid flashcard data:", response.data, error);
      throw new ValidationError("Invalid flashcard data from server");
    }
  } catch (error) {
    console.error("[getFlashcard] Error:", error);

    if (error instanceof ValidationError) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new NetworkError("Failed to fetch flashcard");
  }
}

/**
 * Save flashcard from session
 */
export async function saveFlashcardFromSession(
  input: any,
): Promise<ActionResult<{ flashcard_id?: string; word?: string }>> {
  try {
    // Normalize text
    const sourceText = normalizeText(input.source_text || "");
    const translatedText = normalizeText(input.translated_text || "");

    if (!sourceText || !translatedText) {
      return {
        success: false,
        error: "Không đủ dữ liệu để tạo flashcard.",
      };
    }

    // Prepare and validate input - ensure required fields are present
    const createInput: CreateFlashcardInput = {
      word: sourceText,
      word_type: input.part_of_speech || "phrase", // ✅ Required by API
      translation_vi: input.translation_vi || translatedText, // ✅ Required by API
      phonetic: input.phonetic,
      audio_url: input.audio_url,
      example_sentence: input.example_sentence || sourceText,
    };

    // Validate with schema
    const validatedInput = CreateFlashcardSchema.parse(createInput);

    const response = await withRetry(
      () =>
        apiFetch<
          ApiResponse<{ flashcard_id?: string; word?: string; message?: string }>
        >("/flashcards", {
          method: "POST",
          body: JSON.stringify(validatedInput),
          cache: "no-store",
        }),
      {
        maxAttempts: 3,
        shouldRetry: (error) => error?.retryable ?? false,
      },
    );

    if (!response.success) {
      // Handle specific errors
      if (response.message?.includes("Duplicate")) {
        return {
          success: false,
          error: "Từ này đã tồn tại trong flashcard của bạn.",
        };
      }

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
  } catch (error) {
    console.error("[saveFlashcardFromSession] Error:", error);

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: getUserFriendlyMessage(error.name),
      };
    }

    return {
      success: false,
      error: "Có lỗi xảy ra. Vui lòng thử lại.",
    };
  }
}

/**
 * Update flashcard SRS (Spaced Repetition System)
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
  try {
    // Validate inputs
    if (!flashcardId || typeof flashcardId !== "string") {
      return {
        success: false,
        error: "Invalid flashcard ID",
      };
    }

    // Validate difficulty
    const reviewInput = ReviewFlashcardSchema.parse({
      rating: difficultyStr,
    });

    const response = await withRetry(
      () =>
        apiFetch<
          ApiResponse<{
            interval_days?: number;
            review_count?: number;
            next_review_at?: string;
          }>
        >(`/flashcards/${flashcardId}/review`, {
          method: "POST",
          body: JSON.stringify(reviewInput),
        }),
      {
        maxAttempts: 3,
        shouldRetry: (error) => error?.retryable ?? false,
      },
    );

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
  } catch (error) {
    console.error("[updateFlashcardSRS] Error:", error);

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: getUserFriendlyMessage(error.name),
      };
    }

    return {
      success: false,
      error: "Không thể lưu tiến độ. Vui lòng thử lại.",
    };
  }
}


