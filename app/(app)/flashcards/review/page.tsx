import { fetchPracticeQueue } from "@/features/flashcards/actions/practice-actions";
import { FlashcardEmptyState } from "@/features/flashcards/components/flashcard-empty-state";
import { FlashcardSession } from "@/features/flashcards/components/flashcard-session";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Flashcards | Lexi",
  description: "Ôn flashcards theo vòng Recall → Reveal → Feedback → Repeat.",
};

export default async function FlashcardReviewPage() {
  const queue = await fetchPracticeQueue();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href="/flashcards">
            <ChevronLeft className="size-4" />
            Về deck overview
          </Link>
        </Button>
      </div>

      {queue.length === 0 ? (
        <FlashcardEmptyState />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <FlashcardSession initialQueue={queue} />
        </div>
      )}
    </div>
  );
}
