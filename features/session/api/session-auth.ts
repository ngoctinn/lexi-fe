"use server";

import { cookies } from "next/headers";

import {
  MOCK_AUTH_COOKIE_NAME,
  MOCK_AUTH_COOKIE_VALUE,
} from "@/features/auth/mock-auth";

export async function isMockAuthSession() {
  const cookieStore = await cookies();

  return (
    cookieStore.get(MOCK_AUTH_COOKIE_NAME)?.value === MOCK_AUTH_COOKIE_VALUE
  );
}
