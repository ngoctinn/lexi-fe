import type {
  CreateSessionDto,
  GetSessionResult,
  Scenario,
  Session,
  Turn,
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

function cloneTurn(turn: Turn): Turn {
  return { ...turn };
}

function cloneSession(session: Session): Session {
  return {
    ...session,
    scoring: session.scoring ? { ...session.scoring } : session.scoring,
    turns: session.turns?.map(cloneTurn),
  };
}

function cloneScenario(scenario: Scenario): Scenario {
  return {
    ...scenario,
    goals: [...scenario.goals],
    user_roles: [...scenario.user_roles],
    ai_roles: [...scenario.ai_roles],
  };
}

const mockScenarios: Scenario[] = [
  {
    scenario_id: "s1",
    scenario_title: "Chào hỏi cơ bản",
    context: "Giao tiếp xã hội",
    my_character: "Người mới",
    ai_character: "Bạn mới quen",
    goals: ["Giới thiệu tên", "Hỏi thăm", "Tạm biệt lịch sự"],
    user_roles: ["Người mới", "Bạn mới quen"],
    ai_roles: ["Người mới", "Bạn mới quen"],
    is_active: true,
    usage_count: 210,
    difficulty_level: "A1",
    order: 1,
  },
  {
    scenario_id: "s1_2",
    scenario_title: "Gọi cà phê",
    context: "Tại quán cà phê",
    my_character: "Khách hàng",
    ai_character: "Barista",
    goals: ["Chọn đồ uống", "Chọn size", "Hỏi về giá"],
    user_roles: ["Khách hàng", "Barista"],
    ai_roles: ["Khách hàng", "Barista"],
    is_active: true,
    usage_count: 150,
    difficulty_level: "A1",
    order: 2,
  },
  {
    scenario_id: "s1_3",
    scenario_title: "Hỏi đường",
    context: "Đi lại & Hỏi đường",
    my_character: "Du khách",
    ai_character: "Người dân địa phương",
    goals: ["Hỏi vị trí", "Hỏi phương tiện", "Cảm ơn"],
    user_roles: ["Du khách", "Người dân địa phương"],
    ai_roles: ["Du khách", "Người dân địa phương"],
    is_active: true,
    usage_count: 95,
    difficulty_level: "A1",
    order: 3,
  },
  {
    scenario_id: "s1_4",
    scenario_title: "Tại hiệu thuốc",
    context: "Sức khỏe & Y tế",
    my_character: "Bệnh nhân",
    ai_character: "Dược sĩ",
    goals: ["Mô tả triệu chứng", "Hỏi liều dùng", "Thanh toán"],
    user_roles: ["Bệnh nhân", "Dược sĩ"],
    ai_roles: ["Bệnh nhân", "Dược sĩ"],
    is_active: true,
    usage_count: 40,
    difficulty_level: "A1",
    order: 4,
  },
  {
    scenario_id: "s1_5",
    scenario_title: "Check-in khách sạn",
    context: "Du lịch & Khách sạn",
    my_character: "Khách du lịch",
    ai_character: "Lễ tân",
    goals: ["Cung cấp thông tin đặt phòng", "Hỏi giờ ăn sáng", "Nhận phòng"],
    user_roles: ["Khách du lịch", "Lễ tân"],
    ai_roles: ["Khách du lịch", "Lễ tân"],
    is_active: true,
    usage_count: 120,
    difficulty_level: "A1",
    order: 5,
  },
  {
    scenario_id: "s1_6",
    scenario_title: "Mua vé xem phim",
    context: "Đời sống hàng ngày",
    my_character: "Người xem",
    ai_character: "Nhân viên quầy vé",
    goals: ["Chọn phim", "Chọn chỗ ngồi", "Thanh toán"],
    user_roles: ["Người xem", "Nhân viên quầy vé"],
    ai_roles: ["Người xem", "Nhân viên quầy vé"],
    is_active: true,
    usage_count: 80,
    difficulty_level: "A1",
    order: 6,
  },
  {
    scenario_id: "s1_7",
    scenario_title: "Đổi tiền ngoại tệ",
    context: "Tài chính & Ngân hàng",
    my_character: "Khách hàng",
    ai_character: "Giao dịch viên",
    goals: ["Hỏi tỷ giá", "Yêu cầu đổi tiền", "Xác nhận số tiền"],
    user_roles: ["Khách hàng", "Giao dịch viên"],
    ai_roles: ["Khách hàng", "Giao dịch viên"],
    is_active: true,
    usage_count: 30,
    difficulty_level: "A1",
    order: 7,
  },
  {
    scenario_id: "s2",
    scenario_title: "Mua sắm ở cửa hàng",
    context: "Mua sắm",
    my_character: "Khách hàng",
    ai_character: "Nhân viên bán hàng",
    goals: ["Hỏi giá sản phẩm", "Nhờ tư vấn kích cỡ", "Thanh toán lịch sự"],
    user_roles: ["Khách hàng", "Nhân viên bán hàng"],
    ai_roles: ["Khách hàng", "Nhân viên bán hàng"],
    is_active: true,
    usage_count: 45,
    difficulty_level: "A2",
    order: 8,
  },
  {
    scenario_id: "s3",
    scenario_title: "Đặt món ăn",
    context: "Ẩm thực & Nhà hàng",
    my_character: "Thực khách",
    ai_character: "Nhân viên phục vụ",
    goals: ["Gọi món từ menu", "Hỏi về nguyên liệu", "Thanh toán và tip"],
    user_roles: ["Thực khách", "Nhân viên phục vụ"],
    ai_roles: ["Thực khách", "Nhân viên phục vụ"],
    is_active: true,
    usage_count: 133,
    difficulty_level: "A2",
    order: 9,
  },
  {
    scenario_id: "s4",
    scenario_title: "Làm thủ tục sân bay",
    context: "Du lịch & Hàng không",
    my_character: "Hành khách",
    ai_character: "Nhân viên check-in",
    goals: [
      "Check-in chuyến bay",
      "Hỏi hành lý",
      "Trao đổi về cổng lên máy bay",
    ],
    user_roles: ["Hành khách", "Nhân viên check-in"],
    ai_roles: ["Hành khách", "Nhân viên check-in"],
    is_active: true,
    usage_count: 89,
    difficulty_level: "B1",
    order: 10,
  },
  {
    scenario_id: "s5",
    scenario_title: "Phỏng vấn xin việc",
    context: "Công việc & Sự nghiệp",
    my_character: "Ứng viên",
    ai_character: "Nhà tuyển dụng",
    goals: [
      "Giới thiệu bản thân",
      "Nêu kinh nghiệm làm việc",
      "Trả lời câu hỏi tình huống",
    ],
    user_roles: ["Ứng viên", "Nhà tuyển dụng"],
    ai_roles: ["Ứng viên", "Nhà tuyển dụng"],
    is_active: true,
    usage_count: 124,
    difficulty_level: "B1",
    order: 11,
  },
  {
    scenario_id: "s6",
    scenario_title: "Họp nhóm công việc",
    context: "Công sở & Hội họp",
    my_character: "Thành viên nhóm",
    ai_character: "Trưởng nhóm",
    goals: ["Báo cáo tiến độ", "Đề xuất ý kiến", "Phản hồi feedback lịch sự"],
    user_roles: ["Thành viên nhóm", "Trưởng nhóm"],
    ai_roles: ["Thành viên nhóm", "Trưởng nhóm"],
    is_active: true,
    usage_count: 77,
    difficulty_level: "B2",
    order: 12,
  },
  {
    scenario_id: "s7",
    scenario_title: "Thuyết trình sản phẩm",
    context: "Kinh doanh & Thuyết trình",
    my_character: "Người thuyết trình",
    ai_character: "Nhà đầu tư",
    goals: [
      "Trình bày vấn đề & giải pháp",
      "Demo tính năng chính",
      "Trả lời câu hỏi khó",
    ],
    user_roles: ["Người thuyết trình", "Nhà đầu tư"],
    ai_roles: ["Người thuyết trình", "Nhà đầu tư"],
    is_active: true,
    usage_count: 55,
    difficulty_level: "C1",
    order: 13,
  },
  {
    scenario_id: "s8",
    scenario_title: "Thảo luận tin tức thời sự",
    context: "Xã hội & Thế giới",
    my_character: "Người tham gia",
    ai_character: "Chuyên gia bình luận",
    goals: [
      "Nêu quan điểm rõ ràng",
      "Phân tích vấn đề đa chiều",
      "Phản biện lịch sự",
    ],
    user_roles: ["Người tham gia", "Chuyên gia bình luận"],
    ai_roles: ["Người tham gia", "Chuyên gia bình luận"],
    is_active: true,
    usage_count: 38,
    difficulty_level: "C2",
    order: 14,
  },
];


let mockSessionSequence = 9;

const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

let mockSessions: Session[] = [
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
    created_at: new Date(now - 35 * 60 * 1000).toISOString(),
    turns: [],
  },
  {
    session_id: "mock-3",
    user_id: "u1",
    scenario_id: "s3",
    ai_gender: "female",
    level: "A2",
    prompt_snapshot: buildPromptSnapshot(mockScenarios[2], {
      ai_gender: "female",
      level: "A2",
    }),
    total_turns: 6,
    user_turns: 3,
    hint_used_count: 1,
    created_at: new Date(now - 4 * hour).toISOString(),
    scoring: {
      overall: 84,
      fluency: 86,
      pronunciation: 82,
      grammar: 79,
      vocabulary: 88,
      feedback:
        "Bạn phản hồi tự nhiên ở phần gọi món, chỉ cần giữ nhịp câu đều hơn một chút.",
    },
    turns: [],
  },
  {
    session_id: "mock-4",
    user_id: "u1",
    scenario_id: "s4",
    ai_gender: "male",
    level: "B1",
    prompt_snapshot: buildPromptSnapshot(mockScenarios[3], {
      ai_gender: "male",
      level: "B1",
    }),
    total_turns: 5,
    user_turns: 2,
    hint_used_count: 0,
    created_at: new Date(now - 10 * hour).toISOString(),
    scoring: {
      overall: 79,
      fluency: 80,
      pronunciation: 77,
      grammar: 76,
      vocabulary: 83,
      feedback:
        "Phần hỏi hành lý ổn, nhưng bạn có thể mở rộng câu trả lời hơn khi gặp tình huống sân bay.",
    },
    turns: [],
  },
  {
    session_id: "mock-5",
    user_id: "u1",
    scenario_id: "s5",
    ai_gender: "female",
    level: "B2",
    prompt_snapshot: buildPromptSnapshot(mockScenarios[4], {
      ai_gender: "female",
      level: "B2",
    }),
    total_turns: 7,
    user_turns: 4,
    hint_used_count: 2,
    created_at: new Date(now - 1 * day).toISOString(),
    scoring: {
      overall: 87.5,
      fluency: 88,
      pronunciation: 86,
      grammar: 84,
      vocabulary: 90,
      feedback:
        "Cách trả lời rõ ràng và đúng trọng tâm. Hãy luyện thêm phần ví dụ cụ thể để tăng độ thuyết phục.",
    },
    turns: [],
  },
  {
    session_id: "mock-6",
    user_id: "u1",
    scenario_id: "s6",
    ai_gender: "male",
    level: "B2",
    prompt_snapshot: buildPromptSnapshot(mockScenarios[5], {
      ai_gender: "male",
      level: "B2",
    }),
    total_turns: 2,
    user_turns: 1,
    hint_used_count: 0,
    created_at: new Date(now - 2 * day).toISOString(),
    turns: [],
  },
  {
    session_id: "mock-7",
    user_id: "u1",
    scenario_id: "s7",
    ai_gender: "female",
    level: "C1",
    prompt_snapshot: buildPromptSnapshot(mockScenarios[6], {
      ai_gender: "female",
      level: "C1",
    }),
    total_turns: 8,
    user_turns: 4,
    hint_used_count: 1,
    created_at: new Date(now - 3 * day).toISOString(),
    scoring: {
      overall: 90,
      fluency: 91,
      pronunciation: 89,
      grammar: 87,
      vocabulary: 92,
      feedback:
        "Bạn giữ được mạch thuyết trình tốt. Phần phản biện sẽ mạnh hơn nếu thêm ví dụ số liệu cụ thể.",
    },
    turns: [],
  },
  {
    session_id: "mock-8",
    user_id: "u1",
    scenario_id: "s8",
    ai_gender: "male",
    level: "C2",
    prompt_snapshot: buildPromptSnapshot(mockScenarios[7], {
      ai_gender: "male",
      level: "C2",
    }),
    total_turns: 10,
    user_turns: 5,
    hint_used_count: 3,
    created_at: new Date(now - 5 * day).toISOString(),
    scoring: {
      overall: 92,
      fluency: 93,
      pronunciation: 91,
      grammar: 90,
      vocabulary: 94,
      feedback:
        "Bài thảo luận rất chắc, vốn từ tốt. Bạn đã sẵn sàng cho các chủ đề có độ học thuật cao hơn.",
    },
    turns: [],
  },
];

export const mockSessionApi = {
  async getScenarios(): Promise<Scenario[]> {
    return mockScenarios.map(cloneScenario);
  },

  async getSessions(): Promise<Session[]> {
    return mockSessions.map(cloneSession);
  },

  async getSession(sessionId: string): Promise<GetSessionResult> {
    const existing = mockSessions.find(
      (session) => session.session_id === sessionId,
    );
    if (existing) {
      return { success: true, session: cloneSession(existing) };
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
    const sessionId = `mock-${mockSessionSequence++}`;
    const matchedScenario =
      mockScenarios.find(
        (scenario) => scenario.scenario_id === dto.scenario_id,
      ) ?? mockScenarios[0];

    mockSessions = [
      {
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
      },
      ...mockSessions,
    ];

    return { success: true, session_id: sessionId };
  },

  async endSession(
    sessionId: string,
  ): Promise<{ success: boolean; error?: string }> {
    mockSessions = mockSessions.map((item) =>
      item.session_id === sessionId && !item.scoring
        ? {
            ...item,
            scoring: buildMockScoring(item),
            updated_at: new Date().toISOString(),
          }
        : item,
    );

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
    const hints = [
      "Trong tình huống này, bạn nên bắt đầu bằng một câu chào lịch sự và nêu rõ mục đích của mình để nhân viên dễ dàng hỗ trợ.\n\nVí dụ bạn có thể sử dụng:\n```text\nHi there! I'm here to check in for my flight to London, and I have my passport ready.\n```",
      "Để yêu cầu một vị trí ngồi cụ thể, hãy sử dụng cấu trúc câu hỏi lịch sự với 'if' hoặc 'would it be possible'.\n\nBạn hãy thử dùng câu này:\n```text\nI was wondering if there are any aisle seats available near the front of the plane?\n```",
      "Khi được hỏi về hành lý, bạn nên liệt kê rõ ràng số lượng kiện hàng ký gửi và xách tay để thủ tục diễn ra nhanh chóng.\n\nCâu trả lời gợi ý:\n```text\nI have one large suitcase to check in and this backpack as my carry-on bag.\n```",
      "Nếu bạn cần hỏi về thời gian hoặc địa điểm (như cửa khởi hành), hãy sử dụng cấu trúc 'Could you tell me...'.\n\nVí dụ cụ thể:\n```text\nCould you please tell me which gate I should go to and what time the boarding starts?\n```",
    ];
    const idx =
      Math.abs(
        sessionId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
      ) % hints.length;
    return hints[idx];
  },
};
