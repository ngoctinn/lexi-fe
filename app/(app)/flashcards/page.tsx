import { fetchPracticeQueue } from "@/features/flashcards/actions/practice-actions";
import { FlashcardDeckOverview } from "@/features/flashcards/components/deck-overview";
import { FlashcardEmptyState } from "@/features/flashcards/components/flashcard-empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { BookOpen } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện từ vựng | Lexi",
  description: "Hai card tối giản: tiến độ học và danh sách theo SRS.",
};

export default async function FlashcardOverviewPage() {
  const queue = await fetchPracticeQueue();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={BookOpen} title="Luyện từ vựng" />

      {queue.length === 0 ? (
        <FlashcardEmptyState />
      ) : (
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
          <div className="flex-1">
            <FlashcardDeckOverview queue={queue} />
          </div>
        </div>
      )}
    </div>
  );
}
