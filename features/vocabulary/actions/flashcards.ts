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

export async function saveFlashcardAction(
  data: SaveFlashcardInput
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newFlashcard: VocabularyItem = {
    id: Math.random().toString(36).substring(7),
    ...data,
    addedAt: new Date().toISOString(),
  };

  mockDatabase = [newFlashcard, ...mockDatabase];

  // Revalidate bảng tử vựng
  revalidatePath("/vocabulary");
  
  return { success: true, message: `Đã lưu "${data.word}" vào sổ tay.` };
}

export async function deleteFlashcardAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  mockDatabase = mockDatabase.filter((item) => item.id !== id);

  revalidatePath("/vocabulary");
  
  return { success: true, message: "Đã xóa từ vựng." };
}
