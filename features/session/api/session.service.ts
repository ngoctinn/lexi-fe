import { toast } from "sonner";
import { saveFlashcardFromSession } from "@/features/flashcards/actions/practice-actions";
import { translateWordAction, type TranslateWordResult } from "@/features/session/actions/translate-word";

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

export const SessionService = {
  async translateTurn(
    sourceText: string,
  ): Promise<TranslateTurnResult> {
    try {
      // Tách câu thành từng từ và dịch từng từ
      const words = sourceText.split(/\s+/).filter(w => w.length > 0);
      const translations: string[] = [];
      
      for (const word of words) {
        try {
          const result = await translateWordAction(word, sourceText);
          translations.push(result.translation_vi || word);
        } catch {
          // Nếu dịch từ thất bại, giữ nguyên từ gốc
          translations.push(word);
        }
      }
      
      const translatedText = translations.join(" ");
      return { translatedText };
    } catch (error) {
      throw error;
    }
  },

  async translateWord(word: string, context: string): Promise<TranslateWordResult> {
    try {
      return await translateWordAction(word, context);
    } catch {
      this.handleError("Không thể dịch từ này.", "TranslateWord");
      return { word, translation_vi: "Lỗi dịch.", definition_vi: "" };
    }
  },

  async getHint(): Promise<string> {
    return "Tính năng gợi ý hiện chưa khả dụng.";
  },

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
      return { success: false, message: result.message || "Không thể lưu flashcard." };
    }
    return { success: true, message: result.message || "Đã lưu vào flashcard." };
  },

  async saveTurnToFlashcard(
    input: SaveTurnToFlashcardInput,
  ): Promise<{ success: boolean; message: string }> {
    return this.saveWordToFlashcard(input);
  },

  handleError(message: string, context?: string) {
    console.error(`[session] SessionService${context ? `:${context}` : ""} error:`, message);
    toast.error(message);
  },
};
