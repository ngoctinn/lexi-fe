"use server";

import { revalidatePath } from "next/cache";
import { apiFetchServer } from "@/lib/api-server";
import { VocabularyItem, SaveFlashcardInput } from "../types";

export async function getFlashcardsAction(): Promise<VocabularyItem[]> {
  const data = (await apiFetchServer("/flashcards", {
    method: "GET",
    cache: "no-store",
  })) as VocabularyItem[];
  return data;
}

export async function saveFlashcardAction(
  data: SaveFlashcardInput,
): Promise<{ success: boolean; message: string }> {
  try {
    // Gọi API thực tế từ backend
    // Nếu chưa có API thực tế, bạn có thể comment out đoạn này và dùng mock bên dưới
    await apiFetchServer("/flashcards", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Revalidate bảng tử vựng
    revalidatePath("/vocabulary");

    return { success: true, message: `Đã lưu "${data.word}" vào sổ tay.` };
  } catch (error) {
    console.error("Failed to save flashcard:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi kết nối server",
    };
  }
}

export async function deleteFlashcardAction(
  id: string,
): Promise<{ success: boolean; message: string }> {
  await apiFetchServer(`/flashcards/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/vocabulary");

  return { success: true, message: "Đã xóa từ vựng." };
}
