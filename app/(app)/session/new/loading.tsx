import { Skeleton } from "@/components/ui/skeleton";

export default function NewSessionLoading() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page Header Skeleton */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3 md:px-8">
        <Skeleton className="size-5 rounded" />
        <Skeleton className="h-6 w-40 rounded-lg" />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid h-full w-full gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
          {/* Left Section - Learning Path */}
          <section className="flex min-h-0 flex-col overflow-y-auto pr-2">
            <div className="flex flex-col items-center justify-start py-6">
              {/* Header */}
              <div className="mb-8 flex w-full flex-col gap-4 text-left">
                <div className="max-w-xs space-y-2">
                  <Skeleton className="h-6 w-48 rounded-lg" />
                  <Skeleton className="h-4 w-64 rounded" />
                </div>
              </div>

              {/* Learning Path Cards */}
              <div className="w-full space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton className="size-12 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48 rounded-lg" />
                          <Skeleton className="h-4 w-full rounded" />
                          <Skeleton className="h-4 w-3/4 rounded" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-6 w-24 rounded-full" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Section - Recent Sessions */}
          <aside className="hidden min-h-0 flex-1 flex-col gap-4 lg:flex">
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    <Skeleton className="h-4 w-48 rounded" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* Recent Sessions List */}
                <div className="space-y-3">
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

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
