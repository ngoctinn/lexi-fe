export const MOCK_AUTH_COOKIE_NAME = "lexi_mock_auth";
export const MOCK_AUTH_COOKIE_VALUE = "admin";
export const MOCK_SESSION_TOKEN = "mock-session-token";

export const MOCK_ADMIN_LOGIN = {
  email: "admin@lexi.app",
  password: "admin1234",
} as const;

export const MOCK_ADMIN_PROFILE = {
  display_name: "Lexi Admin",
  email: "admin@lexi.app",
  current_level: "B2",
  target_level: "C1",
  learning_goal_text: "Quản trị hệ thống",
  learning_goal: "C1",
  avatar_url: "https://api.dicebear.com/9.x/lorelei/svg?seed=LexiAdmin",
  is_new_user: false,
};

export const isMockAuthEnabled = process.env.NODE_ENV !== "production";

export function isMockAdminCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === MOCK_ADMIN_LOGIN.email &&
    password === MOCK_ADMIN_LOGIN.password
  );
}
