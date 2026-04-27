import { z } from "zod";

/**
 * Flashcard validation schemas
 * Single source of truth for data validation
 */

// Word validation: a-z, A-Z, 0-9, spaces, hyphens, apostrophes, forward slashes
const WORD_REGEX = /^[a-zA-Z0-9\s\-'/]+$/;

export const FlashcardSchema = z.object({
  flashcard_id: z.string().min(1, "Flashcard ID is required"),
  user_id: z.string().min(1, "User ID is required"),
  word: z
    .string()
    .min(1, "Word is required")
    .max(100, "Word must be 100 characters or less")
    .regex(WORD_REGEX, "Word contains invalid characters"),
  source_session_id: z.string().optional(),
  source_turn_index: z.number().int().nonnegative().optional(),

  // SRS Data
  review_count: z.number().int().nonnegative().default(0),
  interval_days: z.number().int().nonnegative().default(0),
  difficulty: z.number().min(1.3).max(2.5).default(2.5),
  last_reviewed_at: z.string().datetime().nullable().default(null),
  next_review_at: z.string().datetime(),

  // Vocabulary Data
  word_type: z.string().optional(),
  translation_vi: z.string().optional(),
  phonetic: z.string().optional(),
  audio_url: z.string().url().optional(),
  example_sentence: z.string().optional(),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;

/**
 * Create flashcard input validation
 */
export const CreateFlashcardSchema = z.object({
  word: z
    .string()
    .min(1, "Word is required")
    .max(100, "Word must be 100 characters or less")
    .regex(WORD_REGEX, "Word contains invalid characters"),
  word_type: z.string().optional(),
  translation_vi: z.string().optional(),
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
 * Review difficulty validation
 */
export const ReviewDifficultySchema = z.enum(["forgot", "hard", "good", "easy"]);
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
 * Statistics response schema
 */
export const StatisticsSchema = z.object({
  total_count: z.number().nonnegative(),
  due_today: z.number().nonnegative(),
  reviewed_last_7_days: z.number().nonnegative(),
  maturity: z.object({
    new: z.number().nonnegative(),
    learning: z.number().nonnegative(),
    mature: z.number().nonnegative(),
  }),
  average_ease_factor: z.number().min(1.3).max(2.5),
});

export type Statistics = z.infer<typeof StatisticsSchema>;
