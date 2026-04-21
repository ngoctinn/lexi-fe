"use server";

import { revalidatePath } from "next/cache";

import { getScenarios } from "@/features/session/actions/get-scenarios";
import type { AdminScenario, AdminUser } from "@/features/admin/types";
import { DEFAULT_SCENARIO_CONTEXT } from "@/features/session/constants/scenario-contexts";

const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function cloneUser(user: AdminUser): AdminUser {
  return { ...user };
}

function cloneScenario(scenario: AdminScenario): AdminScenario {
  const roles = normalizeList(scenario.roles).slice(0, 2);

  return {
    ...scenario,
    roles: [...roles],
    goals: [...scenario.goals],
  };
}

function offsetIso(offsetMs: number) {
  return new Date(Date.now() - offsetMs).toISOString();
}

function normalizeText(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeList(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function normalizeLevel(
  value: string | undefined,
  fallback: (typeof LEVEL_OPTIONS)[number],
): (typeof LEVEL_OPTIONS)[number] {
  if (
    value &&
    LEVEL_OPTIONS.includes(value as (typeof LEVEL_OPTIONS)[number])
  ) {
    return value as (typeof LEVEL_OPTIONS)[number];
  }

  return fallback;
}

function createUserId(displayName: string) {
  const base = displayName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `user-${base || "new"}-${Date.now().toString(36)}`;
}

function createScenarioId(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `scenario-${base || "new"}-${Date.now().toString(36)}`;
}

function buildSeedUsers(): AdminUser[] {
  return [
    {
      id: "user-1001",
      display_name: "Nguyễn Minh Anh",
      email: "minhanh@lexi.app",
      current_level: "A2",
      target_level: "B1",
      learning_goal_text: "Du lịch tự tin",
      status: "active",
      sessions_completed: 18,
      streak: 9,
      last_active_at: offsetIso(2 * HOUR_IN_MS),
      updated_at: offsetIso(45 * 60 * 1000),
      notes: "Ưu tiên các kịch bản hỏi đường, check-in và gọi món.",
    },
    {
      id: "user-1002",
      display_name: "Trần Quốc Huy",
      email: "quochuy@lexi.app",
      current_level: "B1",
      target_level: "B2",
      learning_goal_text: "Phỏng vấn việc làm",
      status: "review",
      sessions_completed: 12,
      streak: 4,
      last_active_at: offsetIso(28 * HOUR_IN_MS),
      updated_at: offsetIso(3 * HOUR_IN_MS),
      notes: "Cần thêm phản hồi ngữ pháp và luyện câu trả lời dài hơn.",
    },
    {
      id: "user-1003",
      display_name: "Lê Thu Hà",
      email: "thuha@lexi.app",
      current_level: "A1",
      target_level: "A2",
      learning_goal_text: "Giao tiếp cơ bản",
      status: "invited",
      sessions_completed: 0,
      streak: 0,
      last_active_at: offsetIso(3 * DAY_IN_MS),
      updated_at: offsetIso(3 * DAY_IN_MS),
      notes: "Mới onboard, cần hướng dẫn chọn lộ trình đầu tiên.",
    },
    {
      id: "user-1004",
      display_name: "Phạm Gia Bảo",
      email: "giabao@lexi.app",
      current_level: "B2",
      target_level: "C1",
      learning_goal_text: "Họp nhóm công việc",
      status: "active",
      sessions_completed: 27,
      streak: 16,
      last_active_at: offsetIso(4 * HOUR_IN_MS),
      updated_at: offsetIso(90 * 60 * 1000),
      notes: "Đang luyện phản biện và trình bày ý kiến trong cuộc họp.",
    },
    {
      id: "user-1005",
      display_name: "Vũ Ngọc Linh",
      email: "ngoclinh@lexi.app",
      current_level: "A2",
      target_level: "B1",
      learning_goal_text: "Đặt món và mua sắm",
      status: "paused",
      sessions_completed: 9,
      streak: 2,
      last_active_at: offsetIso(6 * DAY_IN_MS),
      updated_at: offsetIso(6 * DAY_IN_MS),
      notes: "Tạm dừng vì lịch học bận, nên gợi ý quay lại bằng flashcard.",
    },
    {
      id: "user-1006",
      display_name: "Bùi Hải Yến",
      email: "haiyen@lexi.app",
      current_level: "C1",
      target_level: "C2",
      learning_goal_text: "Thuyết trình sản phẩm",
      status: "active",
      sessions_completed: 34,
      streak: 22,
      last_active_at: offsetIso(75 * 60 * 1000),
      updated_at: offsetIso(30 * 60 * 1000),
      notes: "Phù hợp các kịch bản pitching, đàm phán và phản biện.",
    },
  ];
}

let adminUsers: AdminUser[] = buildSeedUsers();
let adminScenarios: AdminScenario[] | null = null;

async function ensureAdminScenarios() {
  if (adminScenarios) {
    return adminScenarios;
  }

  const scenarios = await getScenarios();

  adminScenarios = scenarios.map((scenario, index) => ({
    ...scenario,
    updated_at: offsetIso((index + 1) * 18 * HOUR_IN_MS),
    notes: `${scenario.scenario_title} hiện được tối ưu cho level ${
      scenario.difficulty_level ?? "B1"
    } và đã sẵn sàng cho học viên mới.`,
  }));

  return adminScenarios;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return adminUsers.map(cloneUser);
}

export async function getAdminScenarios(): Promise<AdminScenario[]> {
  const scenarios = await ensureAdminScenarios();
  return scenarios.map(cloneScenario);
}

export async function upsertAdminUser(user: AdminUser): Promise<{
  success: boolean;
  user?: AdminUser;
  error?: string;
}> {
  const now = new Date().toISOString();
  const displayName = normalizeText(user.display_name, "Người dùng mới");
  const email = normalizeText(user.email, "new-user@lexi.app");
  const currentLevel = normalizeLevel(user.current_level, "A2");
  const targetLevel = normalizeLevel(
    user.target_level ?? user.learning_goal,
    currentLevel,
  );
  const legacyGoalText = normalizeText(user.learning_goal ?? "", "");
  const learningGoalText = normalizeText(
    user.learning_goal_text ??
      (LEVEL_OPTIONS.includes(legacyGoalText as (typeof LEVEL_OPTIONS)[number])
        ? ""
        : legacyGoalText),
    "Chưa xác định",
  );

  const normalizedUser: AdminUser = {
    ...user,
    id: normalizeText(user.id, createUserId(displayName)),
    display_name: displayName,
    email,
    current_level: currentLevel,
    target_level: targetLevel,
    learning_goal_text: learningGoalText,
    learning_goal: targetLevel,
    sessions_completed: Number.isFinite(user.sessions_completed)
      ? Math.max(0, Math.trunc(user.sessions_completed))
      : 0,
    streak: Number.isFinite(user.streak)
      ? Math.max(0, Math.trunc(user.streak))
      : 0,
    last_active_at: normalizeText(user.last_active_at, now),
    updated_at: now,
    notes: user.notes.trim(),
  };

  const nextUsers = adminUsers.some((item) => item.id === normalizedUser.id)
    ? adminUsers.map((item) =>
        item.id === normalizedUser.id ? normalizedUser : item,
      )
    : [normalizedUser, ...adminUsers];

  adminUsers = nextUsers;

  revalidatePath("/admin");
  revalidatePath("/admin/users");

  return {
    success: true,
    user: cloneUser(normalizedUser),
  };
}

export async function upsertAdminScenario(scenario: AdminScenario): Promise<{
  success: boolean;
  scenario?: AdminScenario;
  error?: string;
}> {
  const scenarios = await ensureAdminScenarios();
  const now = new Date().toISOString();
  const roles = normalizeList(scenario.roles).slice(0, 2);
  const goals = normalizeList(scenario.goals);
  const normalizedScenario: AdminScenario = {
    ...scenario,
    scenario_id: normalizeText(
      scenario.scenario_id,
      createScenarioId(scenario.scenario_title),
    ),
    scenario_title: normalizeText(scenario.scenario_title, "Kịch bản mới"),
    context: normalizeText(scenario.context, DEFAULT_SCENARIO_CONTEXT),
    roles,
    goals,
    usage_count: Number.isFinite(scenario.usage_count)
      ? Math.max(0, Math.trunc(scenario.usage_count))
      : 0,
    order:
      typeof scenario.order === "number" && Number.isFinite(scenario.order)
        ? Math.max(0, Math.trunc(scenario.order))
        : undefined,
    updated_at: now,
    notes: scenario.notes.trim(),
  };

  const nextScenarios = scenarios.some(
    (item) => item.scenario_id === normalizedScenario.scenario_id,
  )
    ? scenarios.map((item) =>
        item.scenario_id === normalizedScenario.scenario_id
          ? normalizedScenario
          : item,
      )
    : [normalizedScenario, ...scenarios];

  adminScenarios = nextScenarios;

  revalidatePath("/admin");
  revalidatePath("/admin/scenarios");

  return {
    success: true,
    scenario: cloneScenario(normalizedScenario),
  };
}
