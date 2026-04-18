import { Skeleton } from "@/components/ui/skeleton";

export default function FlashcardsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-56 rounded-xl" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[4fr_6fr]">
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
    </div>
  );
}
