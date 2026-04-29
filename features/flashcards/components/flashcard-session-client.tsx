"use client";

import { usePracticeQueue } from "../hooks/use-flashcards";
import { FlashcardSession } from "./flashcard-session";
import { FlashcardEmptyState } from "./flashcard-empty-state";
import { FlashcardSessionSkeleton } from "./flashcard-skeleton";
import { FlashcardErrorBoundary } from "./flashcard-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Client wrapper for flashcard session with React Query
 * Handles loading, error, and caching
 */
export function FlashcardSessionClient() {
  const { data, isLoading, error, refetch } = usePracticeQueue();

  if (isLoading) {
    return <FlashcardSessionSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center px-4">
        <Alert variant="destructive" className="max-w-md">
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
              className="w-full"
            >
              <RefreshCw className="mr-2 size-4" />
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const queue = data || [];

  return (
    <FlashcardErrorBoundary>
      {queue.length === 0 ? (
        <FlashcardEmptyState />
      ) : (
        <FlashcardSession initialQueue={queue} />
      )}
    </FlashcardErrorBoundary>
  );
}
