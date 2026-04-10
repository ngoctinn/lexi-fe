import { fetchPracticeQueue } from "@/features/flashcards/actions/practice-actions";
import { FlashcardSession } from "@/features/flashcards/components/flashcard-session";
import { SessionSummary } from "@/features/flashcards/components/session-summary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcard SRS | Lexi",
  description: "Ôn tập từ vựng với phương pháp lặp lại ngắt quãng (Spaced Repetition)",
};

export default async function FlashcardPracticePage() {
  // Bring data fetching to the server
  const queue = await fetchPracticeQueue();

  return (
    <div className="container mx-auto px-4 max-w-5xl h-[calc(100vh-8rem)] flex items-center justify-center">
      {queue.length === 0 ? (
        <SessionSummary reviewedCount={0} retentionRate={100} />
      ) : (
        <FlashcardSession initialQueue={queue} />
      )}
    </div>
  );
}
