"use server";

import { apiRequestPublic } from "@/lib/api/client";
import type { Scenario } from "@/features/session/types/session.types";
import { isMockAuthSession } from "../api/session-auth";
import { mockSessionApi } from "../api/session-mock";

export async function getScenarios(): Promise<Scenario[]> {
  if (await isMockAuthSession()) {
    return mockSessionApi.getScenarios();
  }

  const response = await apiRequestPublic<{
    success: boolean;
    scenarios?: Scenario[];
  }>("/scenarios", {
    cache: "no-store",
  });

  return response.scenarios ?? [];
}
