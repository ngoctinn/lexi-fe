import { Skeleton } from "@/components/ui/skeleton";

export default function FlashcardReviewLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header Skeleton */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3 md:px-8 h-20">
        <Skeleton className="size-10 rounded-lg" />
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-6 w-40 rounded-lg" />
      </div>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex w-full max-w-3xl flex-col gap-4 mx-auto">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Flashcard */}
          <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-lg min-h-[416px] flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-6 text-center">
              <Skeleton className="h-12 w-48 rounded-lg mx-auto" />
              <Skeleton className="h-6 w-32 rounded mx-auto" />
              <Skeleton className="h-6 w-40 rounded mx-auto" />
            </div>
          </div>

          {/* Controls Area - Fixed height */}
          <div className="min-h-[180px] flex flex-col justify-start">
            <Skeleton className="h-4 w-64 rounded mx-auto" />
          </div>
        </div>
      </main>
    </div>
  );
}
