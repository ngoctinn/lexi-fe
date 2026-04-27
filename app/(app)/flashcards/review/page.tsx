import { FlashcardSessionClient } from "@/features/flashcards/components/flashcard-session-client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Flashcards | Lexi",
  description: "Ôn flashcards theo vòng Recall → Reveal → Feedback → Repeat.",
};

export default function FlashcardReviewPage() {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href="/flashcards">
            <ChevronLeft className="size-4" />
            Về deck overview
          </Link>
        </Button>

        <FlashcardSessionClient />
      </div>
    </main>
  );
}
