import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--pattern-foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--pattern-foreground)_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg md:p-8">
          {/* Header */}
          <div className="mb-6 space-y-2 text-center">
            <Skeleton className="h-8 w-64 rounded-lg mx-auto" />
            <Skeleton className="h-4 w-80 rounded mx-auto" />
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
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

            {/* Submit Button */}
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
