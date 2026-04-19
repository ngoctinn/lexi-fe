"use server";

import { cookies } from "next/headers";

import {
  MOCK_AUTH_COOKIE_NAME,
  MOCK_AUTH_COOKIE_VALUE,
  isMockAuthEnabled,
} from "../mock-auth";
import { resetMockProfile } from "@/features/profile/api/profile.actions";

const mockAuthCookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
};

export async function signInMockSession() {
  if (!isMockAuthEnabled) {
    return { success: false, error: "Mock login is disabled." };
  }

  const cookieStore = await cookies();

  cookieStore.set(
    MOCK_AUTH_COOKIE_NAME,
    MOCK_AUTH_COOKIE_VALUE,
    mockAuthCookieOptions,
  );

  return { success: true };
}

export async function clearMockAuthSession() {
  const cookieStore = await cookies();

  cookieStore.set(MOCK_AUTH_COOKIE_NAME, "", {
    ...mockAuthCookieOptions,
    maxAge: 0,
  });

  await resetMockProfile();

  return { success: true };
}
