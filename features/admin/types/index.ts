import type { SessionLevel } from "@/features/session/types/session.types";

/**
 * AdminUser type - matches API response from GET /admin/users
 * Source: API_ENDPOINTS_COMPLETE.md
 */
export interface AdminUser {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  current_level: SessionLevel;
  target_level: SessionLevel;
  role: "user" | "admin";
  is_active: boolean;
  total_words_learned: number;
  joined_at: string;
  learning_goal_text: string;
  status: string;
  sessions_completed: number;
  streak: number;
  last_active_at: string;
  updated_at: string;
  notes?: string;
}

/**
 * AdminScenario type - matches API response from GET /admin/scenarios
 * Source: API_ENDPOINTS_COMPLETE.md
 */
export interface AdminScenario {
  scenario_id: string;
  scenario_title: string;
  context: string;
  difficulty_level: SessionLevel;
  roles: {
    user_role: string;
    ai_role: string;
  };
  goals: string[];
  order?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Request body for PATCH /admin/users/{userId}
 */
export interface UpdateAdminUserRequest {
  display_name?: string;
  current_level?: string;
  target_level?: string;
  is_active?: boolean;
  role?: string;
}

/**
 * Request body for POST/PATCH /admin/scenarios
 */
export interface UpsertAdminScenarioRequest {
  scenario_title: string;
  context: string;
  difficulty_level: string;
  roles: {
    user_role: string;
    ai_role: string;
  };
  goals: string[];
  order?: number;
  notes?: string;
  is_active: boolean;
}
