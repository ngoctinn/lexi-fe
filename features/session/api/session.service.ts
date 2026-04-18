import { toast } from "sonner";

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

  handleError(message: string, context?: string) {
    console.error(`[SessionService${context ? `:${context}` : ""}]`, message);
    toast.error(message);
  },
};
