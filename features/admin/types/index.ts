import type {
  Scenario,
  SessionLevel,
} from "@/features/session/types/session.types";

export type AdminUserStatus = "active" | "invited" | "paused" | "review";

export interface AdminUser {
  id: string;
  display_name: string;
  email: string;
  current_level: SessionLevel;
  target_level: SessionLevel;
  learning_goal_text: string;
  learning_goal?: string;
  status: AdminUserStatus;
  sessions_completed: number;
  streak: number;
  last_active_at: string;
  updated_at: string;
  notes: string;
  avatar_url?: string;
}

export interface AdminScenario extends Scenario {
  updated_at: string;
  notes: string;
}
