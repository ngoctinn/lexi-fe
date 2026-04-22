import { toast } from "sonner";
import { saveFlashcardFromSession } from "@/features/flashcards/actions/practice-actions";
import {
  analyzeTurnText,
  type AnalyzedSentenceItem,
} from "@/features/session/actions/analyze-turn";
import { translateWordAction } from "@/features/session/actions/translate-word";

interface SaveTurnToFlashcardInput {
  sessionId: string;
  turnIndex: number;
  sourceText: string;
  translatedText: string;
}

interface TranslateTurnResult {
  translatedText: string;
  analysisItems: AnalyzedSentenceItem[];
}

function shouldUseMockSessionApi() {
  return process.env.NEXT_PUBLIC_USE_SESSION_MOCK === "true";
}

function buildTranslatedText(
  sourceText: string,
  analysisItems: AnalyzedSentenceItem[],
) {
  // Lấy các cụm từ (phrasal verbs, idioms) nếu có
  const phraseItems = analysisItems.filter((item) => item.type === "phrase");
  
  if (phraseItems.length > 0) {
    return phraseItems
      .map((item) => {
        const baseText = item.base ? ` (${item.base})` : "";
        const meaningText = item.definition_vi ? `: ${item.definition_vi}` : "";
        return `${item.text}${baseText}${meaningText}`;
      })
      .join("\n");
  }

  // Nếu không có cụm từ, trả về null để UI tự xử lý việc hiển thị từng từ khi click
  return null;
}

export const SessionService = {
  async translateTurn(
    sessionId: string,
    turnIndex: number,
    sourceText: string,
  ): Promise<TranslateTurnResult> {
    if (shouldUseMockSessionApi()) {
      const { mockSessionApi } = await import("./session-mock");
      const translatedText = await mockSessionApi.translateTurn(
        sessionId,
        turnIndex,
      );
      return {
        translatedText,
        analysisItems: [],
      };
    }

    try {
      // Gọi API analyze để tách từ/cụm từ
      const analysisItems = await analyzeTurnText(sourceText);
      const translatedText = buildTranslatedText(sourceText, analysisItems);

      return {
        translatedText: translatedText ?? "",
        analysisItems,
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        const { mockSessionApi } = await import("./session-mock");
        const translatedText = await mockSessionApi.translateTurn(
          sessionId,
          turnIndex,
        );
        return {
          translatedText,
          analysisItems: [],
        };
      }
      throw error;
    }
  },

  async translateWord(word: string): Promise<string> {
    if (shouldUseMockSessionApi()) {
      return `Dịch (Mock): ${word} -> Nghĩa của từ`;
    }

    try {
      return await translateWordAction(word);
    } catch (error) {
      this.handleError("Không thể dịch từ này.", "TranslateWord");
      return "Lỗi dịch.";
    }
  },

  async getHint(sessionId: string): Promise<string> {
    if (process.env.NODE_ENV === "development") {
      const { mockSessionApi } = await import("./session-mock");
      return mockSessionApi.getHint(sessionId);
    }
    return "Tính năng gợi ý hiện chưa khả dụng.";
  },

  async saveTurnToFlashcard(
    input: SaveTurnToFlashcardInput,
  ): Promise<{ success: boolean; message: string }> {
    const result = await saveFlashcardFromSession({
      session_id: input.sessionId,
      turn_index: input.turnIndex,
      source_text: input.sourceText,
      translated_text: input.translatedText,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Không thể lưu flashcard.",
      };
    }

    return {
      success: true,
      message: result.message || "Đã lưu vào flashcard.",
    };
  },

  handleError(message: string, context?: string) {
    console.error(`[session] SessionService${context ? `:${context}` : ""} error:`, message);
    toast.error(message);
  },
};
