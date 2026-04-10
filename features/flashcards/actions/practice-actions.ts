"use server";

import { Flashcard, ReviewDifficulty } from "../types";
import { revalidatePath } from "next/cache";

// Mock data generation for initial implementation
const MOCK_FLASHCARDS: Flashcard[] = [
  {
    flashcard_id: "01HGWY0Z57N3F0H19ZK2B7V2M1",
    user_id: "user_123",
    word: "resilient",
    word_type: "adj",
    phonetic: "/rɪˈzɪl.jənt/",
    definition_vi: "Kiên cường, mau phục hồi (sau cú sốc hoặc tổn thương)",
    example_sentence: "Babies are generally far more resilient than new parents realize.",
    review_count: 2,
    interval_days: 1,
    difficulty: 0,
    last_reviewed_at: null,
    next_review_at: new Date().toISOString(),
  },
  {
    flashcard_id: "01HGWY0Z57N3F0H19ZK2B7V2M2",
    user_id: "user_123",
    word: "ephemeral",
    word_type: "adj",
    phonetic: "/ɪˈfem.ər.əl/",
    definition_vi: "Phù du, chóng tàn, tồn tại trong thời gian ngắn",
    example_sentence: "Fame in the world of rock and pop is largely ephemeral.",
    review_count: 5,
    interval_days: 4,
    difficulty: 3,
    last_reviewed_at: new Date(Date.now() - 86400000).toISOString(),
    next_review_at: new Date().toISOString(),
  },
  {
    flashcard_id: "01HGWY0Z57N3F0H19ZK2B7V2M3",
    user_id: "user_123",
    word: "ubiquitous",
    word_type: "adj",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    definition_vi: "Có mặt ở khắp mọi nơi, phổ biến",
    example_sentence: "The mobile phone, that most ubiquitous of consumer-electronic appliances, is about to enter a new age.",
    review_count: 0,
    interval_days: 1,
    difficulty: 0,
    last_reviewed_at: null,
    next_review_at: new Date().toISOString(),
  },
  {
    flashcard_id: "01HGWY0Z57N3F0H19ZK2B7V2M4",
    user_id: "user_123",
    word: "pragmatic",
    word_type: "adj",
    phonetic: "/præɡˈmæt.ɪk/",
    definition_vi: "Thực tế, thực dụng (giải quyết vấn đề theo cách logic hơn là lý thuyết)",
    example_sentence: "In business, the pragmatic approach to problems is often more successful than an idealistic one.",
    review_count: 1,
    interval_days: 2,
    difficulty: 2,
    last_reviewed_at: new Date(Date.now() - 172800000).toISOString(),
    next_review_at: new Date().toISOString(),
  }
];

export async function fetchPracticeQueue(): Promise<Flashcard[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Return the mock queue
  return MOCK_FLASHCARDS;
}

export async function updateFlashcardSRS(flashcardId: string, difficultyStr: ReviewDifficulty): Promise<{ success: boolean }> {
  // Map difficulty string to numeric scale (0-5) based on plan
  let numericDifficulty = 0;
  switch (difficultyStr) {
    case "forgot":
      numericDifficulty = 0;
      break;
    case "hard":
      numericDifficulty = 2; // 1-2
      break;
    case "good":
      numericDifficulty = 3; // 3
      break;
    case "easy":
      numericDifficulty = 5; // 4-5
      break;
  }

  // Log for debugging
  console.log(`[Action] Updating flashcard ${flashcardId} with review level: ${difficultyStr} (Val: ${numericDifficulty})`);
  
  // Simulate API call to backend
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // In a real implementation we would:
  // 1. Get user session (from cookie/Auth)
  // 2. Call our Go/Python backend SRS endpoint
  // 3. Handle errors
  
  return { success: true };
}
