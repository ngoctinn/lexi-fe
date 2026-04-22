import { toast } from "sonner";
import { saveFlashcardFromSession } from "@/features/flashcards/actions/practice-actions";
import {
  analyzeTurnText,
  type AnalyzedSentenceItem,
} from "@/features/session/actions/analyze-turn";

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
  const phraseItems = analysisItems.filter((item) => item.type === "phrase");
  if (phraseItems.length === 0) {
    const splitWords = analysisItems
      .filter((item) => item.type === "word" && item.text.trim())
      .map((item) => item.text)
      .join(" · ");

    return splitWords ? `Tách từ: ${splitWords}` : sourceText;
  }

  return phraseItems
    .map((item) => {
      const baseText = item.base ? ` (${item.base})` : "";
      const meaningText = item.definition_vi ? `: ${item.definition_vi}` : "";
      return `${item.text}${baseText}${meaningText}`;
    })
    .join("\n");
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
      const analysisItems = await analyzeTurnText(sourceText);
      return {
        translatedText: buildTranslatedText(sourceText, analysisItems),
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
    console.error(`[SessionService${context ? `:${context}` : ""}]`, message);
    toast.error(message);
  },
};
