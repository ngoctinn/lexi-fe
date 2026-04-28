import type { Flashcard } from "../schemas/flashcard.schema";

/**
 * Calculate flashcard statistics from queue data
 * Note: This is computed client-side since /flashcards/statistics endpoint doesn't exist
 */
export function calculateFlashcardStatistics(cards: Flashcard[]): {
  total_count: number;
  due_today: number;
  new_cards: number;
  learning_cards: number;
  mature_cards: number;
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let dueToday = 0;
  let newCards = 0;
  let learningCards = 0;
  let matureCards = 0;

  for (const card of cards) {
    // Count new cards (never reviewed)
    if (card.review_count === 0) {
      newCards++;
      dueToday++; // New cards are always due
      continue;
    }

    // Count due cards
    const nextReview = new Date(card.next_review_at);
    if (nextReview <= now) {
      dueToday++;
    }

    // Categorize by maturity
    if (card.review_count < 3 || card.interval_days < 7) {
      learningCards++;
    } else {
      matureCards++;
    }
  }

  return {
    total_count: cards.length,
    due_today: dueToday,
    new_cards: newCards,
    learning_cards: learningCards,
    mature_cards: matureCards,
  };
}
