import { toast } from "sonner";

/**
 * Service for session-related API calls.
 * Orchestrates calls between mocks and real backend.
 */
export const SessionService = {
  /**
   * Translates a specific turn.
   */
  async translateTurn(sessionId: string, turnIndex: number): Promise<string> {
    // In dev, use mock
    if (process.env.NODE_ENV === "development") {
      const { mockSessionService } = await import("./session-mock");
      return mockSessionService.translateTurn(sessionId, turnIndex);
    }
    
    // In prod, call real API
    // const res = await fetch(`/api/session/${sessionId}/translate?turn=${turnIndex}`);
    // return (await res.json()).translation;
    return "Tính năng dịch chưa sẵn dụng trong sản phẩm.";
  },

  /**
   * Gets a hint for the current session state.
   */
  async getHint(sessionId: string): Promise<string> {
    if (process.env.NODE_ENV === "development") {
      const { mockSessionService } = await import("./session-mock");
      return mockSessionService.getHint(sessionId);
    }
    return "Tính năng gợi ý đang được bảo trì.";
  },

  /**
   * Helper to handle errors uniformly.
   */
  handleError(message: string, context?: string) {
    console.error(`[SessionService${context ? `:${context}` : ""}]`, message);
    toast.error(message);
  }
};
