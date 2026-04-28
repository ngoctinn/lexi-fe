/**
 * Error handling utilities for API responses
 * Re-exports from unified error handler for backward compatibility
 */

export {
  getErrorInfo,
  getUserFriendlyMessage,
  isRetryableError,
  type ErrorInfo,
} from "@/lib/api/errors";

/**
 * Format error for display in UI
 */
export function formatErrorForDisplay(error: any): string {
  if (error?.userMessage) {
    return error.userMessage;
  }
  if (error?.message) {
    return error.message;
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
