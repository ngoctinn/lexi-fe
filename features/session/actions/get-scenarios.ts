"use server";

import type { Scenario } from "@/features/session/types/session.types";
import { mockSessionApi } from "../api/session-mock";

export async function getScenarios(): Promise<Scenario[]> {
  return mockSessionApi.getScenarios();
}
