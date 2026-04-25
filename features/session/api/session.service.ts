import { toast } from "sonner";
import { saveFlashcardFromSession } from "@/features/flashcards/actions/practice-actions";
import { translateWordAction, type TranslateWordResult } from "@/features/session/actions/translate-word";
import { translateSentenceAction } from "@/features/session/actions/translate-sentence";

interface SaveTurnToFlashcardInput {
  sessionId: string;
  turnIndex: number;
  sourceText: string;
  translatedText: string;
  vocabData?: TranslateWordResult;
}

interface TranslateTurnResult {
  translatedText: string;
}

/**
 * Session Service - Pure Next.js pattern
 * Uses Server Actions for all API calls
 */
export const SessionService = {
  /**
   * Translate entire sentence using /vocabulary/translate-sentence endpoint
   * Pure Next.js pattern: use Server Action
   */
  async translateTurn(sourceText: string): Promise<TranslateTurnResult> {
    const result = await translateSentenceAction(sourceText);
    return { translatedText: result.sentence_vi };
  },

  /**
   * Translate single word with context
   */
  async translateWord(word: string, context: string): Promise<TranslateWordResult> {
    const result = await translateWordAction(word, context);
    if (!result.translation_vi || result.translation_vi === "Lỗi khi gọi API dịch.") {
      this.handleError("Không thể dịch từ này.", "TranslateWord");
    }
    return result;
  },

  /**
   * Get hint (placeholder - backend doesn't support this yet)
   */
  async getHint(): Promise<string> {
    return "Tính năng gợi ý hiện chưa khả dụng.";
  },

  /**
   * Save word to flashcard
   * Pure Next.js pattern: use Server Action
   */
  async saveWordToFlashcard(
    input: SaveTurnToFlashcardInput,
  ): Promise<{ success: boolean; message: string }> {
    const result = await saveFlashcardFromSession({
      session_id: input.sessionId,
      turn_index: input.turnIndex,
      source_text: input.sourceText,
      translated_text: input.translatedText,
      translation_vi: input.vocabData?.translation_vi,
      definition_vi: input.vocabData?.definition_vi,
      part_of_speech: input.vocabData?.part_of_speech,
      phonetic: input.vocabData?.phonetic,
      audio_url: input.vocabData?.audio_url,
      example_sentence: input.vocabData?.example_sentence,
    });
    
    if (!result.success) {
      return { 
        success: false, 
        message: result.error || "Không thể lưu flashcard." 
      };
    }
    
    return { 
      success: true, 
      message: result.message || "Đã lưu vào flashcard." 
    };
  },

  handleError(message: string, context?: string) {
    console.error(`[session] SessionService${context ? `:${context}` : ""} error:`, message);
    toast.error(message);
  },
};
