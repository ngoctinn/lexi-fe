import { SessionStatus } from "../types/session.types";

/**
 * Pure domain logic for Sessions.
 * Contains rules for status transitions, role permissions, and scoring logic.
 */

export const SessionDomain = {
  /**
   * Checks if a session can be interacted with based on its status.
   */
  isInteractable: (status: SessionStatus): boolean => {
    return status === SessionStatus.ACTIVE || status === SessionStatus.PAUSED;
  },

  /**
   * Validates if a user can request a hint.
   */
  canRequestHint: (status: SessionStatus, hintCount: number, limit: number = 5): boolean => {
    return status === SessionStatus.ACTIVE && hintCount < limit;
  },

  /**
   * Determine the next logic status after a turn is saved.
   */
  getNextStatusAfterTurn: (currentStatus: SessionStatus): SessionStatus => {
    return currentStatus;
  }
};
