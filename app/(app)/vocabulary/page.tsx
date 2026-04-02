import { Suspense } from "react";
import { FlashcardList } from "@/features/vocabulary/components/flashcard/flashcard-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function VocabularyPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Sổ tay từ vựng</h1>
        <p className="text-muted-foreground">
          Quản lý và ôn tập các từ vựng bạn đã lưu từ các cuộc hội thoại.
        </p>
      </div>

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
