"use server";

import { apiRequestPublic } from "@/lib/api/client";

interface TranslateWordApiResponse {
  word: string;
  definition_vi: string;
  phonetic?: string;
  example?: string;
}

export async function translateWordAction(word: string): Promise<string> {
  try {
    const payload = await apiRequestPublic<TranslateWordApiResponse>(
      "/vocabulary/translate",
      {
        method: "POST",
        body: JSON.stringify({ word }),
        cache: "no-store",
      },
    );

    return payload.definition_vi || "Không tìm thấy bản dịch.";
  } catch (error) {
    console.error("Translate error:", error);
    return "Lỗi khi gọi API dịch.";
  }
}
