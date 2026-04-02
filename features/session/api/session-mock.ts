"use client";

/**
 * Mock responses for session-related features.
 * In a real application, these might be handled by MSW or conditional API calls.
 */

export const mockSessionService = {
  getHint: async (sessionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return "I would like to order a double espresso, please.";
  },

  translateTurn: async (sessionId: string, turnIndex: number) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "Đây là bản dịch mẫu cho câu hội thoại này.";
  },

  generateUploadKey: (sessionId: string) => {
    return `sessions/${sessionId}/turn_${Date.now()}.webm`;
  },
  
  getMockUploadUrl: () => {
    return "http://localhost:3000/mock-upload";
  }
};
