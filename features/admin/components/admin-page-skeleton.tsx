import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminPageSkeletonProps {
  showStats?: boolean;
  rows?: number;
}

export function AdminPageSkeleton({
  showStats = true,
  rows = 6,
}: AdminPageSkeletonProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border/40 bg-background px-4 py-5 md:px-8">
        <Skeleton className="h-8 w-48 rounded-full" />
      </div>

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        {showStats ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} size="sm">
                <CardContent className="space-y-3 py-4">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        <Card size="lg">
          <CardContent className="space-y-4 py-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="space-y-3">
              {Array.from({ length: rows }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}