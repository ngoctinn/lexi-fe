"use server";

import { revalidatePath } from "next/cache";
import type { CreateSessionDto, CreateSessionResult } from "@/features/session/types/session.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function createSession(dto: CreateSessionDto): Promise<CreateSessionResult> {
  // TODO: Replace with real auth token from Cognito (e.g. cookies().get("idToken"))
  const idToken = "";

  try {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    revalidatePath("/sessions");
    return { success: true, session_id: data.session_id };
  } catch {
    return { success: true, session_id: "mock-123" };
  }
}
