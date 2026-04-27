export interface Flashcard {
  flashcard_id: string; // ULID
  user_id: string;
  word: string;
  source_session_id?: string;
  source_turn_index?: number;

  // SRS Data
  review_count: number;
  interval_days: number;
  difficulty: number;
  last_reviewed_at: string | null; // ISO Date string
  next_review_at: string; // ISO Date string

  // Vocabulary Data
  word_type?: string; // Loại từ (n, v, adj...)
  translation_vi?: string; // Bản dịch tiếng Việt
  phonetic?: string; // Cách phát âm (IPA)
  audio_url?: string; // Audio
  example_sentence?: string; // Câu ví dụ mẫu
}

export type ReviewDifficulty = "forgot" | "hard" | "good" | "easy";
