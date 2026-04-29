import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header Skeleton */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3 md:px-8">
        <Skeleton className="size-5 rounded" />
        <Skeleton className="h-6 w-32 rounded-lg" />
      </div>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Column 1 */}
          <div className="space-y-4">
            {/* Metric Card */}
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="space-y-3">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-10 w-16 rounded-lg" />
                  <Skeleton className="h-5 w-12 rounded" />
                </div>
                <Skeleton className="h-4 w-full rounded" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              </div>
            </div>

            {/* Tile */}
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded" />
                  </div>
                  <Skeleton className="size-5 rounded" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            {/* Metric Card */}
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="space-y-3">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-10 w-16 rounded-lg" />
                  <Skeleton className="h-5 w-12 rounded" />
                </div>
                <Skeleton className="h-4 w-full rounded" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              </div>
            </div>

            {/* Tile */}
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded" />
                  </div>
                  <Skeleton className="size-5 rounded" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>

          {/* Column 3 - Recent Sessions */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              <div className="space-y-3 pt-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/60 bg-muted/20 p-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-4 w-32 rounded" />
                        </div>
                        <Skeleton className="h-3 w-40 rounded" />
                      </div>
                      <Skeleton className="size-4 rounded" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
