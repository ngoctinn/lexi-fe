"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Loading skeleton for flashcard overview
 */
export function FlashcardOverviewSkeleton() {
  return (
    <main className="flex-1 px-4 py-4 md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-6xl grid items-start gap-4 lg:grid-cols-[4fr_6fr]">
        {/* Progress Card */}
        <Card size="sm" className="self-start border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Queue Card */}
        <Card size="sm" className="self-start border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

/**
 * Loading skeleton for flashcard session
 */
export function FlashcardSessionSkeleton() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      {/* Progress */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Card */}
      <div className="flex min-h-96 items-center justify-center rounded-2xl border border-border/60 bg-muted/10 p-8">
        <div className="w-full space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton for queue row
 */
export function QueueRowSkeleton() {
  return (
    <div className="flex items-start gap-3 border-b border-border/60 px-4 py-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="shrink-0 space-y-1 text-right">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}
