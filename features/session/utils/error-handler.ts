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
  COMPLETION_FAILED: {
    code: "COMPLETION_FAILED",
    message: "Session completion failed",
    userMessage: "Không thể kết thúc phiên. Vui lòng thử lại.",
    isRetryable: true,
  },
  BAD_REQUEST: {
    code: "BAD_REQUEST",
    message: "Invalid request",
    userMessage: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.",
    isRetryable: false,
  },
};

/**
 * Get user-friendly error message for API error code
 */
export function getErrorMessage(errorCode?: string): ApiErrorInfo {
  if (!errorCode) {
    return {
      code: "UNKNOWN_ERROR",
      message: "Unknown error occurred",
      userMessage: "Đã xảy ra lỗi. Vui lòng thử lại.",
      isRetryable: true,
    };
  }

  return (
    ERROR_MESSAGES[errorCode] || {
      code: errorCode,
      message: errorCode,
      userMessage: `Lỗi: ${errorCode}. Vui lòng thử lại.`,
      isRetryable: true,
    }
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(errorCode?: string): boolean {
  if (!errorCode) return true;
  return getErrorMessage(errorCode).isRetryable;
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(errorCode?: string, context?: string): string {
  const errorInfo = getErrorMessage(errorCode);
  if (context) {
    return `${context}: ${errorInfo.userMessage}`;
  }
  return errorInfo.userMessage;
}
