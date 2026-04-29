import { FlashcardSessionClient } from "@/features/flashcards/components/flashcard-session-client";
import { PageHeader } from "@/components/shared/page-header";
import { BookOpen } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Flashcards | Lexi",
  description: "Ôn flashcards theo vòng Recall → Reveal → Feedback → Repeat.",
};

export default function FlashcardReviewPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={BookOpen} title="Ôn tập flashcard" backHref="/flashcards" />
      
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <FlashcardSessionClient />
      </main>
    </div>
  );
}
