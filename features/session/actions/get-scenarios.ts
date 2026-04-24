"use server";

import { apiRequestPublic } from "@/lib/api/client";
import type { Scenario } from "@/features/session/types/session.types";

export async function getScenarios(): Promise<Scenario[]> {
  const response = await apiRequestPublic<{
    success: boolean;
    data?: {
      scenarios?: Scenario[];
    };
  }>("/scenarios", {
    cache: "no-store",
  });

  return response.data?.scenarios ?? [];
}
