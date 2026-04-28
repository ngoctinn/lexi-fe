"use server";

import { getSessions } from "@/features/session/actions/get-sessions";
import { fetchFlashcards, fetchPracticeQueue } from "@/features/flashcards/actions/practice-actions";

export interface DashboardStats {
  flashcardCount: number;
  flashcardDueToday: number;
  sessionsCount: number;
  totalSessionTime: string;
}

/**
 * Calculate dashboard stats from API data
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Fetch data in parallel
    const [sessions, flashcardsResponse, dueFlashcards] = await Promise.all([
      getSessions(),
      fetchFlashcards(100), // Get flashcards with max limit
      fetchPracticeQueue(), // Get due flashcards
    ]);

    // Calculate stats
    const flashcardCount = flashcardsResponse.cards.length;
    const flashcardDueToday = dueFlashcards.length;

    const sessionsCount = sessions.length;

    // Calculate total session time (rough estimate: 15 min per session)
    const totalMinutes = sessionsCount * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalSessionTime = `${hours}h ${minutes}m`;

    return {
      flashcardCount,
      flashcardDueToday,
      sessionsCount,
      totalSessionTime,
    };
  } catch (error) {
    console.error("[getDashboardStats] Error:", error);
    
    // Return default stats on error
    return {
      flashcardCount: 0,
      flashcardDueToday: 0,
      sessionsCount: 0,
      totalSessionTime: "0h 0m",
    };
  }
}
