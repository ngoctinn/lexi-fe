/**
 * React Query hooks for flashcard operations
 * Handles caching, refetching, and offline support
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFlashcards,
  fetchPracticeQueue,
  getFlashcard,
  saveFlashcardFromSession,
  updateFlashcardSRS,
} from "../actions/practice-actions";
import { calculateFlashcardStatistics } from "../lib/statistics";
import type {
  Flashcard,
  ReviewDifficulty,
  CreateFlashcardInput,
} from "../schemas/flashcard.schema";
import type { ActionResult } from "@/lib/api/types";

/**
 * Query keys for React Query
 */
export const flashcardQueryKeys = {
  all: ["flashcards"] as const,
  lists: () => [...flashcardQueryKeys.all, "list"] as const,
  list: (limit: number, lastKey?: string) =>
    [...flashcardQueryKeys.lists(), { limit, lastKey }] as const,
  details: () => [...flashcardQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...flashcardQueryKeys.details(), id] as const,
  queue: () => [...flashcardQueryKeys.all, "queue"] as const,
  statistics: () => [...flashcardQueryKeys.all, "statistics"] as const,
};

/**
 * Fetch all flashcards with pagination
 */
export function useFlashcards(limit: number = 20, lastKey?: string) {
  return useQuery({
    queryKey: flashcardQueryKeys.list(limit, lastKey),
    queryFn: () => fetchFlashcards(limit, lastKey),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Fetch practice queue (due flashcards)
 */
export function usePracticeQueue() {
  return useQuery({
    queryKey: flashcardQueryKeys.queue(),
    queryFn: fetchPracticeQueue,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Fetch single flashcard
 */
export function useFlashcard(id: string) {
  return useQuery({
    queryKey: flashcardQueryKeys.detail(id),
    queryFn: () => getFlashcard(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!id,
  });
}

/**
 * Save flashcard from session
 */
export function useSaveFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveFlashcardFromSession,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: flashcardQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: flashcardQueryKeys.queue(),
      });
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Update flashcard SRS (review)
 */
export function useReviewFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      flashcardId,
      difficulty,
    }: {
      flashcardId: string;
      difficulty: ReviewDifficulty;
    }) => updateFlashcardSRS(flashcardId, difficulty),
    onSuccess: (data, variables) => {
      // Update specific flashcard
      queryClient.setQueryData(
        flashcardQueryKeys.detail(variables.flashcardId),
        (old: Flashcard | undefined) => {
          if (!old) return old;
          return {
            ...old,
            interval_days: data.data?.interval_days ?? old.interval_days,
            review_count: data.data?.review_count ?? old.review_count,
            next_review_at: data.data?.next_review_at ?? old.next_review_at,
          };
        },
      );

      // Invalidate queue (due cards may have changed)
      queryClient.invalidateQueries({
        queryKey: flashcardQueryKeys.queue(),
      });
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Prefetch practice queue
 */
export function usePrefetchPracticeQueue(queryClient: any) {
  return () =>
    queryClient.prefetchQuery({
      queryKey: flashcardQueryKeys.queue(),
      queryFn: fetchPracticeQueue,
      staleTime: 2 * 60 * 1000,
    });
}

/**
 * Calculate flashcard statistics from all flashcards
 * Note: Computed client-side since /flashcards/statistics endpoint doesn't exist
 */
export function useFlashcardStatistics() {
  const { data: flashcardsData } = useFlashcards(100); // Fetch all cards for statistics
  
  return {
    data: flashcardsData?.cards ? calculateFlashcardStatistics(flashcardsData.cards) : null,
    isLoading: false,
    error: null,
  };
}
