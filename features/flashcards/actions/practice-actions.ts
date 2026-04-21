"use server";

import { revalidatePath } from "next/cache";
import { Flashcard, ReviewDifficulty } from "../types";

// Dữ liệu giả để hiển thị luồng ban đầu trong lúc backend chưa sẵn sàng.
let mockFlashcards: Flashcard[] = [
  {
    flashcard_id: "01HGWY0Z57N3F0H19ZK2B7V2M1",
    user_id: "user_123",
    word: "resilient",
    word_type: "adj",
    phonetic: "/rɪˈzɪl.jənt/",
    definition_vi: "Kiên cường, mau phục hồi (sau cú sốc hoặc tổn thương)",
    example_sentence:
      "Babies are generally far more resilient than new parents realize.",
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
    example_sentence:
      "The mobile phone, that most ubiquitous of consumer-electronic appliances, is about to enter a new age.",
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
    definition_vi:
      "Thực tế, thực dụng (giải quyết vấn đề theo cách logic hơn là lý thuyết)",
    example_sentence:
      "In business, the pragmatic approach to problems is often more successful than an idealistic one.",
    review_count: 1,
    interval_days: 2,
    difficulty: 2,
    last_reviewed_at: new Date(Date.now() - 172800000).toISOString(),
    next_review_at: new Date().toISOString(),
  },
];

interface SaveFlashcardFromSessionInput {
  session_id: string;
  turn_index: number;
  source_text: string;
  translated_text: string;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function createFlashcardId() {
  return `mock-fc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toFlashcardWord(value: string) {
  const normalized = normalizeText(value);
  if (normalized.length <= 64) {
    return normalized;
  }

  return `${normalized.slice(0, 61).trimEnd()}...`;
}

export async function fetchPracticeQueue(): Promise<Flashcard[]> {
  // Giả lập độ trễ của API.
  await new Promise((resolve) => setTimeout(resolve, 800));

  return [...mockFlashcards];
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

  const duplicatedCard = mockFlashcards.find(
    (card) =>
      card.source_session_id === input.session_id &&
      card.source_turn_index === input.turn_index,
  );

  if (duplicatedCard) {
    return {
      success: true,
      message: "Nội dung này đã được lưu trước đó.",
    };
  }

  const newCard: Flashcard = {
    flashcard_id: createFlashcardId(),
    user_id: "user_123",
    word: toFlashcardWord(sourceText),
    definition_vi: translatedText,
    example_sentence: sourceText,
    review_count: 0,
    interval_days: 1,
    difficulty: 0,
    last_reviewed_at: null,
    next_review_at: new Date().toISOString(),
    source_session_id: input.session_id,
    source_turn_index: input.turn_index,
  };

  mockFlashcards = [newCard, ...mockFlashcards];

  revalidatePath("/flashcards");
  revalidatePath("/flashcards/review");

  return {
    success: true,
    message: "Đã lưu vào flashcard.",
  };
}

export async function updateFlashcardSRS(
  flashcardId: string,
  difficultyStr: ReviewDifficulty,
): Promise<{ success: boolean }> {
  // Map mức độ ôn tập sang thang số nội bộ.
  let numericDifficulty = 0;
  switch (difficultyStr) {
    case "forgot":
      numericDifficulty = 0;
      break;
    case "hard":
      numericDifficulty = 2;
      break;
    case "good":
      numericDifficulty = 3;
      break;
    case "easy":
      numericDifficulty = 5;
      break;
  }

  // Giả lập gọi backend.
  await new Promise((resolve) => setTimeout(resolve, 300));

  return { success: flashcardId.length > 0 && numericDifficulty >= 0 };
}
