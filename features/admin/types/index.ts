import type {
  Scenario,
  SessionLevel,
} from "@/features/session/types/session.types";

export type AdminUserStatus = "active" | "invited" | "paused" | "review";

export interface AdminUser {
  user_id: string;
  display_name: string;
  email: string;
  current_level: SessionLevel;
  target_level: SessionLevel;
  role: "user" | "admin";
  is_active: boolean;
  total_words_learned: number;
  joined_at: string;
  // Legacy fields for backward compatibility
  id?: string;
  status?: AdminUserStatus;
  learning_goal_text?: string;
  learning_goal?: string;
  sessions_completed?: number;
  streak?: number;
  last_active_at?: string;
  updated_at?: string;
  notes?: string;
  avatar_url?: string;
}

export interface AdminScenario extends Scenario {
  scenario_id: string;
  scenario_title: string;
  context: string;
  roles: string[];
  goals: string[];
  is_active: boolean;
  usage_count: number;
  difficulty_level: SessionLevel;
  order: number;
  notes: string;
  created_at: string;
  updated_at: string;
}
