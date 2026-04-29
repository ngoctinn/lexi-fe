import { Skeleton } from "@/components/ui/skeleton";

export default function FlashcardsLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header Skeleton */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3 md:px-8">
        <Skeleton className="size-5 rounded" />
        <Skeleton className="h-6 w-36 rounded-lg" />
      </div>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="grid gap-4 lg:grid-cols-[4fr_6fr]">
          {/* Progress Card */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="space-y-4">
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-2.5 w-full rounded-full" />
              <div className="grid gap-3 md:grid-cols-2">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Deck List Card */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="space-y-4">
              <Skeleton className="h-8 w-40 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
