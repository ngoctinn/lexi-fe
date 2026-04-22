"use server";

import { apiRequestPublic } from "@/lib/api/client";

export interface AnalyzedSentenceItem {
  text: string;
  type: "word" | "phrase";
  base?: string | null;
}

interface AnalyzeSentenceApiResponse {
  items: AnalyzedSentenceItem[];
}

export async function analyzeTurnText(
  text: string,
): Promise<AnalyzedSentenceItem[]> {
  const payload = await apiRequestPublic<AnalyzeSentenceApiResponse>(
    "/vocabulary/analyze",
    {
      method: "POST",
      body: JSON.stringify({ text }),
      cache: "no-store",
    },
  );

  return payload.items || [];
}
