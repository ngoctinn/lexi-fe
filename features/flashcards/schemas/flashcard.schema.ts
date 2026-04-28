import { z } from "zod";

/**
 * Flashcard validation schemas
 * Single source of truth for data validation
 * MUST match API specification exactly
 */

// Word validation: More lenient - accept any non-empty string
// API may return Vietnamese characters, special chars, etc.
const WORD_REGEX = /^.+$/; // Accept any non-empty string

export const FlashcardSchema = z.object({
  flashcard_id: z.string().min(1, "Flashcard ID is required"),
  user_id: z.string().optional(), // ⚠️ API không trả về user_id
  word: z
    .string()
    .min(1, "Word is required")
    .max(200, "Word must be 200 characters or less"), // Increased limit
  word_type: z.string().optional().default("word"), // ⚠️ API không trả về word_type, default "word"
  translation_vi: z.string().optional().default(""), // ⚠️ API có thể trả về empty string
  phonetic: z.string().optional().or(z.literal("")), // ⚠️ API trả về empty string
  audio_url: z.union([
    z.string().url(),
    z.literal(""),
    z.undefined(),
    z.null(),
  ]).optional().transform(val => (val === "" || val === null) ? undefined : val), // ⚠️ Accept empty string and null
  example_sentence: z.string().optional().or(z.literal("")), // ⚠️ API trả về empty string
  
  // SRS Data - API fields
  review_count: z.number().int().nonnegative().default(0),
  interval_days: z.number().int().nonnegative().default(0),
  next_review_at: z.string(), // Accept any string (API returns ISO 8601 with timezone)
  created_at: z.string().optional(), // ⚠️ API không trả về created_at
  updated_at: z.string().optional(), // ⚠️ API không trả về updated_at
  last_reviewed_at: z.string().optional().nullable(), // ⚠️ API trả về last_reviewed_at
  
  // Optional fields for internal use (not sent to API)
  source_session_id: z.string().optional(),
  source_turn_index: z.number().int().nonnegative().optional(),
  difficulty: z.number().min(1.3).max(2.5).default(2.5).optional(),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;

/**
 * Create flashcard input validation - matches API POST /flashcards
 */
export const CreateFlashcardSchema = z.object({
  word: z
    .string()
    .min(1, "Word is required")
    .max(100, "Word must be 100 characters or less")
    .regex(WORD_REGEX, "Word contains invalid characters"),
  word_type: z.string().min(1, "Word type is required"), // ✅ Required by API
  translation_vi: z.string().min(1, "Translation is required"), // ✅ Required by API
  phonetic: z.string().optional(),
  audio_url: z.string().url().optional(),
  example_sentence: z.string().optional(),
});

export type CreateFlashcardInput = z.infer<typeof CreateFlashcardSchema>;

/**
 * Update flashcard input validation
 */
export const UpdateFlashcardSchema = z.object({
  word: z
    .string()
    .min(1, "Word is required")
    .max(100, "Word must be 100 characters or less")
    .regex(WORD_REGEX, "Word contains invalid characters")
    .optional(),
  word_type: z.string().optional(),
  translation_vi: z.string().optional(),
  phonetic: z.string().optional(),
  audio_url: z.string().url().optional(),
  example_sentence: z.string().optional(),
});

export type UpdateFlashcardInput = z.infer<typeof UpdateFlashcardSchema>;

/**
 * Review difficulty validation - matches API POST /flashcards/{id}/review
 */
export const ReviewDifficultySchema = z.enum(["again", "hard", "good", "easy"]);
export type ReviewDifficulty = z.infer<typeof ReviewDifficultySchema>;

/**
 * Review input validation
 */
export const ReviewFlashcardSchema = z.object({
  rating: ReviewDifficultySchema,
});

export type ReviewFlashcardInput = z.infer<typeof ReviewFlashcardSchema>;

/**
 * API Response schemas
 */
export const FlashcardListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    cards: z.array(FlashcardSchema),
    next_key: z.string().optional(),
  }),
});

export const FlashcardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: FlashcardSchema.optional(),
});

export const ReviewResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      interval_days: z.number().optional(),
      review_count: z.number().optional(),
      next_review_at: z.string().optional(),
    })
    .optional(),
});

/**
 * Statistics response schema (computed client-side)
 */
export const StatisticsSchema = z.object({
  total_count: z.number().nonnegative(),
  due_today: z.number().nonnegative(),
  new_cards: z.number().nonnegative(),
  learning_cards: z.number().nonnegative(),
  mature_cards: z.number().nonnegative(),
});

export type Statistics = z.infer<typeof StatisticsSchema>;
