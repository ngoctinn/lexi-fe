"use server";

import { revalidatePath } from "next/cache";
import { VocabularyItem, SaveFlashcardInput } from "../types";

// Mock Database cho đến khi thiết lập DynamoDB
let mockDatabase: VocabularyItem[] = [
  {
    id: "1",
    word: "ubiquitous",
    meaning: "Có mặt ở khắp mọi nơi",
    type: "adj",
    addedAt: new Date().toISOString(),
  },
  {
    id: "2",
    word: "eloquent",
    meaning: "Có khả năng hùng biện, nói hay",
    type: "adj",
    addedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export async function getFlashcardsAction(): Promise<VocabularyItem[]> {
  // Giả lập network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockDatabase;
}

import { apiFetchServer } from "@/lib/api-server";

export async function saveFlashcardAction(
  data: SaveFlashcardInput
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
    
    // Fallback sang mock hoặc báo lỗi
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Có lỗi xảy ra khi kết nối server" 
    };
  }
}

export async function deleteFlashcardAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  mockDatabase = mockDatabase.filter((item) => item.id !== id);

  revalidatePath("/vocabulary");
  
  return { success: true, message: "Đã xóa từ vựng." };
}
