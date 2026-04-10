export interface Flashcard {
  flashcard_id: string; // ULID
  user_id: string;
  word: string;

  // SRS Data
  review_count: number;
  interval_days: number;
  difficulty: number;
  last_reviewed_at: string | null; // ISO Date string
  next_review_at: string; // ISO Date string

  // Vocabulary Data
  word_type?: string;           // Loại từ (n, v, adj...)
  definition_vi?: string;       // Định nghĩa tiếng Việt
  phonetic?: string;            // Cách phát âm (IPA)
  audio_url?: string;           // Audio
  example_sentence?: string;    // Câu ví dụ mẫu
}

export type ReviewDifficulty = "forgot" | "hard" | "good" | "easy";

export interface ReviewResponse {
  flashcard_id: string;
  difficulty: ReviewDifficulty;
}
