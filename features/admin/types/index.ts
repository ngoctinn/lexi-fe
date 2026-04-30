import type { SessionLevel } from "@/features/session/types/session.types";

/**
 * AdminUser type - matches VERIFIED API response from GET /admin/users
 * Source: lexi-be/docs/api/07-admin-VERIFIED.md
 * Note: Backend uses uppercase enum values (LEARNER, ADMIN)
 */
export interface AdminUser {
  user_id: string;
  email: string;
  display_name: string;
  role: "LEARNER" | "ADMIN";
  is_active: boolean;
  joined_at: string;
  total_words_learned: number;
}

/**
 * AdminScenario type - matches VERIFIED API response from GET /admin/scenarios
 * Source: lexi-be/docs/api/07-admin-VERIFIED.md
 */
export interface AdminScenario {
  scenario_id: string;
  scenario_title: string;
  context: string;
  roles: [string, string]; // Array of exactly 2 role names
  goals: string[];
  is_active: boolean;
  usage_count: number;
  difficulty_level: SessionLevel;
  order: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request body for PATCH /admin/users/{userId}
 * Source: lexi-be/docs/api/07-admin-VERIFIED.md
 */
export interface UpdateAdminUserRequest {
  is_active?: boolean;
  current_level?: string;
  target_level?: string;
}

/**
 * Request body for POST /admin/scenarios
 * Source: lexi-be/docs/api/07-admin-VERIFIED.md
 */
export interface CreateAdminScenarioRequest {
  scenario_title: string;
  context: string;
  roles: [string, string]; // Array of exactly 2 role names
  goals: string[];
  difficulty_level: string;
  order?: number;
  notes?: string;
  is_active?: boolean;
}

/**
 * Request body for PATCH /admin/scenarios/{scenarioId}
 * Source: lexi-be/docs/api/07-admin-VERIFIED.md
 */
export interface UpdateAdminScenarioRequest {
  scenario_title?: string;
  context?: string;
  roles?: [string, string];
  goals?: string[];
  difficulty_level?: string;
  order?: number;
  notes?: string;
  is_active?: boolean;
}
