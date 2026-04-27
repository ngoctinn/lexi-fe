import { FlashcardDeckOverviewClient } from "@/features/flashcards/components/flashcard-deck-overview-client";
import { PageHeader } from "@/components/shared/page-header";
import { BookOpen } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện từ vựng | Lexi",
  description: "Hai card tối giản: tiến độ học và danh sách theo SRS.",
};

export default function FlashcardOverviewPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={BookOpen} title="Luyện từ vựng" />
      <FlashcardDeckOverviewClient />
    </div>
  );
}
