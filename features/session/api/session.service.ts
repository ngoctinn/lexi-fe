import { toast } from "sonner";
import { saveFlashcardFromSession } from "@/features/flashcards/actions/practice-actions";
import type { AnalyzedSentenceItem } from "@/features/session/actions/analyze-turn";
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
  analysisItems: AnalyzedSentenceItem[];
}

export const SessionService = {
  async translateTurn(
    sessionId: string,
    turnIndex: number,
    sourceText: string,
  ): Promise<TranslateTurnResult> {
    try {
      // Dịch toàn bộ câu bằng AWS Translate
      const result = await translateSentenceAction(sourceText);
      return { translatedText: result.sentence_vi, analysisItems: [] };
    } catch (error) {
      throw error;
    }
  },

  async translateWord(word: string, context: string): Promise<TranslateWordResult> {
    try {
      return await translateWordAction(word, context);
    } catch (error) {
      this.handleError("Không thể dịch từ này.", "TranslateWord");
      return { word, translation_vi: "Lỗi dịch.", definition_vi: "" };
    }
  },

  async getHint(sessionId: string): Promise<string> {
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
