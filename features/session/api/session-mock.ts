import type {
  CreateSessionDto,
  GetSessionResult,
  Scenario,
  Session,
} from "../types/session.types";
import { TurnSpeaker } from "../types/session.types";

function buildPromptSnapshot(
  scenario: Scenario,
  dto: Pick<CreateSessionDto, "ai_gender" | "level">,
): string {
  return [
    `Scenario: ${scenario.scenario_title}`,
    `Context: ${scenario.context}`,
    `My character: ${scenario.my_character}`,
    `AI character: ${scenario.ai_character}`,
    `Goals: ${scenario.goals.join(" | ")}`,
    `AI gender: ${dto.ai_gender}`,
    `Level: ${dto.level}`,
  ].join("\n");
}

function buildMockScoring(session: Session): NonNullable<Session["scoring"]> {
  const turnCount = Math.max(
    session.total_turns,
    session.turns?.length ?? 0,
    1,
  );
  const hintPenalty = Math.min(session.hint_used_count * 2, 12);
  const baseScore = Math.max(68, 88 - hintPenalty - Math.max(0, 4 - turnCount));

  return {
    fluency: Math.min(100, baseScore + 3),
    pronunciation: Math.min(100, baseScore),
    grammar: Math.min(100, baseScore - 4),
    vocabulary: Math.min(100, baseScore + 5),
    overall: Math.min(100, baseScore + 1),
    feedback:
      "Bài luyện của bạn đã hoàn tất. Hãy xem lại các câu trả lời và tiếp tục luyện để tăng độ tự nhiên khi giao tiếp.",
  };
}

const mockScenarios: Scenario[] = [
  {
    scenario_id: "s1",
    scenario_title: "Phỏng vấn xin việc",
    context: "work",
    my_character: "Ứng viên",
    ai_character: "Nhà tuyển dụng",
    goals: [
      "Giới thiệu bản thân",
      "Nêu kinh nghiệm làm việc",
      "Trả lời câu hỏi tình huống",
    ],
    user_roles: ["Ứng viên", "Kỹ sư phần mềm"],
    ai_roles: ["Nhà tuyển dụng"],
    is_active: true,
    usage_count: 124,
  },
  {
    scenario_id: "s2",
    scenario_title: "Mua sắm ở cửa hàng",
    context: "daily_life",
    my_character: "Khách hàng",
    ai_character: "Nhân viên bán hàng",
    goals: ["Hỏi giá sản phẩm", "Nhờ tư vấn kích cỡ", "Thanh toán lịch sự"],
    user_roles: ["Khách hàng", "Người mua sắm"],
    ai_roles: ["Nhân viên bán hàng"],
    is_active: true,
    usage_count: 45,
  },
  {
    scenario_id: "s3",
    scenario_title: "Làm thủ tục sân bay",
    context: "travel",
    my_character: "Hành khách",
    ai_character: "Nhân viên check-in",
    goals: [
      "Check-in chuyến bay",
      "Hỏi hành lý",
      "Trao đổi về cổng lên máy bay",
    ],
    user_roles: ["Hành khách", "Du khách"],
    ai_roles: ["Nhân viên check-in"],
    is_active: true,
    usage_count: 89,
  },
];

const mockSessions: Session[] = [
  {
    session_id: "mock-1",
    user_id: "u1",
    scenario_id: "s1",
    ai_gender: "male",
    level: "B2",
    prompt_snapshot: buildPromptSnapshot(mockScenarios[0], {
      ai_gender: "male",
      level: "B2",
    }),
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
    ai_gender: "female",
    level: "B1",
    prompt_snapshot: buildPromptSnapshot(mockScenarios[1], {
      ai_gender: "female",
      level: "B1",
    }),
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

    const fallbackScenario = mockScenarios[0];

    return {
      success: true,
      session: {
        session_id: sessionId,
        user_id: "u1",
        scenario_id: fallbackScenario.scenario_id,
        ai_gender: "female",
        level: "B1",
        prompt_snapshot: buildPromptSnapshot(fallbackScenario, {
          ai_gender: "female",
          level: "B1",
        }),
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
    const matchedScenario =
      mockScenarios.find(
        (scenario) => scenario.scenario_id === dto.scenario_id,
      ) ?? mockScenarios[0];

    mockSessions.unshift({
      session_id: sessionId,
      user_id: "u1",
      scenario_id: dto.scenario_id,
      ai_gender: dto.ai_gender,
      level: dto.level,
      prompt_snapshot:
        dto.prompt_snapshot || buildPromptSnapshot(matchedScenario, dto),
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
    const session = mockSessions.find((item) => item.session_id === sessionId);

    if (session && !session.scoring) {
      session.scoring = buildMockScoring(session);
      session.updated_at = new Date().toISOString();
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
