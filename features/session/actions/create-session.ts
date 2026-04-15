"use server";

import type { CreateSessionDto, CreateSessionResult } from "@/features/session/types/session.types";
import { mockSessionApi } from "../api/session-mock";

export async function createSession(dto: CreateSessionDto): Promise<CreateSessionResult> {
  return mockSessionApi.createSession(dto);
}
