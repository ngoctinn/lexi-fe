/**
 * Error handling utilities for API responses
 */

export interface ApiErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  isRetryable: boolean;
}

const ERROR_MESSAGES: Record<string, ApiErrorInfo> = {
  WORD_NOT_FOUND: {
    code: "WORD_NOT_FOUND",
    message: "Word not found in dictionary",
    userMessage: "Từ này không có trong từ điển. Vui lòng thử từ khác.",
    isRetryable: false,
  },
  DICTIONARY_SERVICE_ERROR: {
    code: "DICTIONARY_SERVICE_ERROR",
    message: "Dictionary service temporarily unavailable",
    userMessage: "Dịch vụ từ điển tạm thời không khả dụng. Vui lòng thử lại sau vài giây.",
    isRetryable: true,
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Request validation failed",
    userMessage: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
    isRetryable: false,
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Authentication failed",
    userMessage: "Phiên đã hết hạn. Vui lòng đăng nhập lại.",
    isRetryable: false,
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "Permission denied",
    userMessage: "Bạn không có quyền thực hiện hành động này.",
    isRetryable: false,
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "Resource not found",
    userMessage: "Không tìm thấy tài nguyên. Vui lòng thử lại.",
    isRetryable: false,
  },
  SERVICE_ERROR: {
    code: "SERVICE_ERROR",
    message: "External service error",
    userMessage: "Lỗi dịch vụ. Vui lòng thử lại sau.",
    isRetryable: true,
  },
  SUBMISSION_FAILED: {
    code: "SUBMISSION_FAILED",
    message: "Turn submission failed",
    userMessage: "Không thể gửi câu trả lời. Vui lòng thử lại.",
    isRetryable: true,
  },
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
