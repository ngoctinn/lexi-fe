export interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  type: "noun" | "verb" | "adj" | "adv" | "phrase" | "other";
  addedAt: string;
}

// Có thể mở rộng thêm khi kết nối DynamoDB
export interface SaveFlashcardInput {
  word: string;
  meaning: string;
  type: VocabularyItem["type"];
}
