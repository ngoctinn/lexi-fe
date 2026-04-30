import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

export default function FlashcardsLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header Skeleton */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3 md:px-8">
        <BookOpen className="size-5 text-muted-foreground" />
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
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>

          {/* Queue Card */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="space-y-4">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 border-b pb-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
