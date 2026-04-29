import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main className="flex min-h-screen flex-col px-4 py-4 md:px-8 md:py-8">
      {/* Page Header Skeleton */}
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="size-6 rounded" />
        <Skeleton className="h-7 w-40 rounded-lg" />
      </div>

      {/* Profile Form Skeleton */}
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Skeleton className="size-24 rounded-full" />
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <Skeleton className="h-5 w-32 rounded-lg mx-auto sm:mx-0" />
                <Skeleton className="h-4 w-48 rounded mx-auto sm:mx-0" />
                <Skeleton className="h-9 w-36 rounded-lg mt-3 mx-auto sm:mx-0" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Native Language */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Target Language */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Proficiency Level */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Learning Goals */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Skeleton className="h-10 w-full sm:w-32 rounded-lg" />
              <Skeleton className="h-10 w-full sm:w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
