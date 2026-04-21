import { toast } from "sonner";
import { saveFlashcardFromSession } from "@/features/flashcards/actions/practice-actions";

interface SaveTurnToFlashcardInput {
  sessionId: string;
  turnIndex: number;
  sourceText: string;
  translatedText: string;
}

export const SessionService = {
  async translateTurn(sessionId: string, turnIndex: number): Promise<string> {
    if (process.env.NODE_ENV === "development") {
      const { mockSessionApi } = await import("./session-mock");
      return mockSessionApi.translateTurn(sessionId, turnIndex);
    }

    return "Tính năng dịch chưa sẵn dùng trong sản phẩm.";
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
