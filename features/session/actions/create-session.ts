"use server";

import { revalidatePath } from "next/cache";
import type { CreateSessionDto, CreateSessionResult } from "@/features/session/types/session.types";
import { apiRequest } from "@/lib/api/client";

export async function createSession(dto: CreateSessionDto): Promise<CreateSessionResult> {
  try {
    const data = await apiRequest<{ session_id: string }>("/sessions", {
      method: "POST",
      body: JSON.stringify(dto),
    });

    revalidatePath("/sessions");
    return { success: true, session_id: data.session_id };
  } catch (error: any) {
    console.error("[createSession Error]", error.message);
    // For development, we might still want the mock fallback if the API is not yet ready.
    // In a real production-ready app, we'd handle this differently.
    if (process.env.NODE_ENV === "development") {
      return { success: true, session_id: "mock-123" };
    }
    return { success: false, error: error.message };
  }
}
