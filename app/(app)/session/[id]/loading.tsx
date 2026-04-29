import { Skeleton } from "@/components/ui/skeleton";

export default function SessionDetailLoading() {
  return (
    <div className="flex w-full flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 lg:px-6 h-16 border-b border-border/60 bg-background/95 backdrop-blur">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton className="size-10 rounded-lg shrink-0" />
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-3 w-64 rounded" />
          </div>
        </div>

        {/* Right: End Button */}
        <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden absolute top-3 right-4 z-20">
        <Skeleton className="size-10 rounded-lg" />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation Area - flex-3 */}
        <main className="flex flex-3 flex-col overflow-hidden relative border-r">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {/* AI Message */}
            <div className="flex gap-3">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="rounded-2xl border border-border/60 bg-card p-4 max-w-2xl">
                  <Skeleton className="h-4 w-full rounded mb-2" />
                  <Skeleton className="h-4 w-5/6 rounded mb-2" />
                  <Skeleton className="h-4 w-4/6 rounded" />
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-3 justify-end">
              <div className="flex-1 space-y-2 flex flex-col items-end">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="rounded-2xl border border-border/60 bg-primary/10 p-4 max-w-2xl">
                  <Skeleton className="h-4 w-64 rounded mb-2" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
              </div>
              <Skeleton className="size-8 rounded-full shrink-0" />
            </div>

            {/* AI Message */}
            <div className="flex gap-3">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="rounded-2xl border border-border/60 bg-card p-4 max-w-2xl">
                  <Skeleton className="h-4 w-full rounded mb-2" />
                  <Skeleton className="h-4 w-5/6 rounded mb-2" />
                  <Skeleton className="h-4 w-3/6 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background/95 backdrop-blur border-t shrink-0 lg:px-8 lg:pb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="size-12 rounded-xl" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar - flex-2, hidden on mobile */}
        <aside className="hidden lg:flex flex-2 flex-col border-l border-border/60 bg-card/50">
          <div className="p-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-12 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card p-3 space-y-2"
              >
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-4/6 rounded" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
