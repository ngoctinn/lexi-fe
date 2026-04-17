import { fetchPracticeQueue } from "@/features/flashcards/actions/practice-actions";
import { FlashcardDeckOverview } from "@/features/flashcards/components/deck-overview";
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
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
      <PageHeader icon={BookOpen} title="Luyện từ vựng" />

      <div className="flex flex-1 items-start justify-center">
        <FlashcardDeckOverview queue={queue} />
      </div>
    </div>
  );
}
