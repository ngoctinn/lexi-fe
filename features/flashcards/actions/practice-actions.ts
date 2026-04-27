/**
 * @deprecated Use practice-actions-v2.ts instead
 * This file is kept for backward compatibility only
 * 
 * Migration guide:
 * - Import from practice-actions-v2.ts
 * - All functions now have proper error handling and validation
 * - Use React Query hooks from hooks/use-flashcards.ts for client-side
 */

"use server";

// Import and re-export from v2 for backward compatibility
import {
  fetchFlashcards as _fetchFlashcards,
  fetchPracticeQueue as _fetchPracticeQueue,
  getFlashcard as _getFlashcard,
  saveFlashcardFromSession as _saveFlashcardFromSession,
  updateFlashcardSRS as _updateFlashcardSRS,
} from "./practice-actions-v2";

export const fetchFlashcards = _fetchFlashcards;
export const fetchPracticeQueue = _fetchPracticeQueue;
export const getFlashcard = _getFlashcard;
export const saveFlashcardFromSession = _saveFlashcardFromSession;
export const updateFlashcardSRS = _updateFlashcardSRS;
