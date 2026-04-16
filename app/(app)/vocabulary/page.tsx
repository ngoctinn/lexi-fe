import { Suspense } from "react";
import { FlashcardList } from "@/features/vocabulary/components/flashcard/flashcard-list";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export default function VocabularyPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
      <PageHeader icon={BookOpen} title="Sổ tay từ vựng" />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-[250px]" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        }
      >
        <FlashcardList />
      </Suspense>
    </div>
  );
}
