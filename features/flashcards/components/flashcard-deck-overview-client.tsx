"use client";

import { useFlashcards } from "../hooks/use-flashcards";
import { FlashcardDeckOverview } from "./deck-overview";
import { FlashcardOverviewSkeleton } from "./flashcard-skeleton";
import { FlashcardErrorBoundary } from "./flashcard-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Client wrapper for flashcard overview with React Query
 * Handles loading, error, and caching
 * Uses GET /flashcards to fetch ALL flashcards (not just due cards)
 */
export function FlashcardDeckOverviewClient() {
  const { data, isLoading, error, refetch } = useFlashcards(100); // Fetch up to 100 cards

  if (isLoading) {
    return <FlashcardOverviewSkeleton />;
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Không thể tải flashcard</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              {error instanceof Error
                ? error.message
                : "Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại."}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="mr-2 size-4" />
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <FlashcardErrorBoundary>
      <FlashcardDeckOverview queue={data?.cards || []} />
    </FlashcardErrorBoundary>
  );
}
