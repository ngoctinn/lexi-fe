import type {
  CreateSessionDto,
  GetSessionResult,
  Scenario,
  Session,
} from "../types/session.types";
import { SessionStatus, TurnSpeaker } from "../types/session.types";

const mockScenarios: Scenario[] = [
  {
    scenario_id: "s1",
    name: "Phỏng vấn xin việc",
    description:
      "Luyện tập trả lời các câu hỏi phỏng vấn vị trí kỹ sư phần mềm.",
    is_active: true,
    usage_count: 124,
  },
  {
    scenario_id: "s2",
    name: "Shopping",
    description: "Hội thoại khi đi mua sắm, trả giá tại cửa hàng quần áo.",
    is_active: true,
    usage_count: 45,
  },
  {
    scenario_id: "s3",
    name: "Sân bay",
    description: "Làm thủ tục hải quan và check-in tại sân bay quốc tế.",
    is_active: true,
    usage_count: 89,
  },
];

const mockSessions: Session[] = [
  {
    session_id: "mock-1",
    user_id: "u1",
    scenario_id: "s1",
    scenario_name: "Phỏng vấn xin việc",
    ai_name: "Alex (Tuyển dụng)",
    ai_gender: "male",
    level: "B2",
    status: SessionStatus.COMPLETED,
    total_turns: 8,
    user_turns: 4,
    hint_used_count: 2,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    scoring: {
      overall: 82.5,
      fluency: 85,
      pronunciation: 80,
      grammar: 75,
      vocabulary: 90,
      feedback:
        "Bạn trả lời khá lưu loát, tuy nhiên cần chú ý một số lỗi ngữ pháp về thì hiện tại hoàn thành.",
    },
    turns: [
      {
        turn_index: 0,
        speaker: TurnSpeaker.AI,
        content:
          "Hello! Thank you for coming today. Could you start by introducing yourself?",
        translated_content:
          "Xin chào! Cảm ơn bạn đã đến hôm nay. Bạn có thể bắt đầu bằng việc giới thiệu bản thân không?",
        is_hint_used: false,
      },
    ],
  },
  {
    session_id: "mock-2",
    user_id: "u1",
    scenario_id: "s2",
    scenario_name: "Shopping",
    ai_name: "Maria (Bán hàng)",
    ai_gender: "female",
    level: "B1",
    status: SessionStatus.PAUSED,
    total_turns: 3,
    user_turns: 1,
    hint_used_count: 0,
    created_at: new Date().toISOString(),
    turns: [],
  },
];

export const mockSessionApi = {
  async getScenarios(): Promise<Scenario[]> {
    return mockScenarios;
  },

  async getSessions(): Promise<Session[]> {
    return mockSessions;
  },

  async getSession(sessionId: string): Promise<GetSessionResult> {
    const existing = mockSessions.find(
      (session) => session.session_id === sessionId,
    );
    if (existing) {
      return { success: true, session: existing };
    }

    return {
      success: true,
      session: {
        session_id: sessionId,
        user_id: "u1",
        scenario_id: "s1",
        scenario_name: "Luyện nói tự do",
        ai_name: "Alex",
        ai_gender: "female",
        level: "B1",
        status: SessionStatus.ACTIVE,
        total_turns: 1,
        user_turns: 0,
        hint_used_count: 0,
        created_at: new Date().toISOString(),
        turns: [
          {
            turn_index: 0,
            speaker: TurnSpeaker.AI,
            content: "Hello! Let's start with a short introduction.",
            translated_content:
              "Xin chào! Hãy bắt đầu với một phần giới thiệu ngắn.",
            is_hint_used: false,
          },
        ],
      },
    };
  },

  async createSession(
    dto: CreateSessionDto,
  ): Promise<{ success: boolean; session_id?: string; error?: string }> {
    const sessionId = `mock-${Date.now()}`;
    mockSessions.unshift({
      session_id: sessionId,
      user_id: "u1",
      scenario_id: dto.scenario_id,
      scenario_name: dto.scenario_id.startsWith("custom:")
        ? "Kịch bản tùy chỉnh"
        : (mockScenarios.find(
            (scenario) => scenario.scenario_id === dto.scenario_id,
          )?.name ?? "Luyện nói tự do"),
      ai_name: dto.ai_gender === "male" ? "Alex" : "Maria",
      ai_gender: dto.ai_gender,
      level: dto.level,
      status: SessionStatus.SETUP,
      total_turns: 0,
      user_turns: 0,
      hint_used_count: 0,
      created_at: new Date().toISOString(),
      turns: [],
    });

    return { success: true, session_id: sessionId };
  },

  async endSession(
    sessionId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const index = mockSessions.findIndex(
      (session) => session.session_id === sessionId,
    );
    if (index >= 0) {
      mockSessions[index] = {
        ...mockSessions[index],
        status: SessionStatus.COMPLETED,
      };
    }

    return { success: true };
  },

  async translateTurn(sessionId: string, turnIndex: number): Promise<string> {
    const s = mockSessions.find((ms) => ms.session_id === sessionId);
    const t = s?.turns?.find((tt) => tt.turn_index === turnIndex);
    if (t?.translated_content) return t.translated_content as string;
    if (t?.content) return `Mẫu dịch: ${t.content}`;
    return "Bản dịch mẫu không khả dụng.";
  },

  async getHint(sessionId: string): Promise<string> {
    // Simple mock hints based on session id
    const hints = [
      "Hãy trả lời ngắn gọn và nêu 1 ví dụ.",
      "Sử dụng thì quá khứ cho hành động đã hoàn tất.",
      "Thêm một câu nối để làm rõ ý.",
    ];
    const idx =
      Math.abs(
        sessionId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
      ) % hints.length;
    return hints[idx];
  },
};
