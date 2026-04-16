import { fetchPracticeQueue } from "@/features/flashcards/actions/practice-actions";
import { FlashcardSession } from "@/features/flashcards/components/flashcard-session";
import { SessionSummary } from "@/features/flashcards/components/session-summary";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards | Lexi",
  description: "Ôn tập flashcard theo SRS trong một màn hình riêng.",
};

export default async function FlashcardPracticePage() {
  const queue = await fetchPracticeQueue();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href="/vocabulary">
            <ChevronLeft className="size-4" />
            Quay lại deck
          </Link>
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {queue.length === 0 ? (
          <SessionSummary reviewedCount={0} retentionRate={100} />
        ) : (
          <FlashcardSession initialQueue={queue} />
        )}
      </div>
    </div>
  );
}
