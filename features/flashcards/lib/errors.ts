/**
 * Flashcard-specific error handling
 */

export class FlashcardError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = "FlashcardError";
  }
}

export class ValidationError extends FlashcardError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400, false);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends FlashcardError {
  constructor(message: string = "Flashcard not found") {
    super(message, "NOT_FOUND", 404, false);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends FlashcardError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401, false);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends FlashcardError {
  constructor(message: string = "Conflict") {
    super(message, "CONFLICT", 409, false);
    this.name = "ConflictError";
  }
}

export class NetworkError extends FlashcardError {
  constructor(message: string = "Network error") {
    super(message, "NETWORK_ERROR", 0, true);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends FlashcardError {
  constructor(message: string = "Request timeout") {
    super(message, "TIMEOUT", 0, true);
    this.name = "TimeoutError";
  }
}

/**
 * Parse API error response
 */
export function parseApiError(
  status: number,
  data: any,
): { message: string; code: string; retryable: boolean } {
  const message = data?.message || data?.error || `HTTP ${status}`;
  const code = data?.code || `HTTP_${status}`;

  // Determine if error is retryable
  const retryable =
    status >= 500 || // Server errors
    status === 408 || // Request timeout
    status === 429; // Rate limit

  return { message, code, retryable };
}

/**
 * User-friendly error messages (Vietnamese)
 */
export const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  NOT_FOUND: "Không tìm thấy flashcard.",
  UNAUTHORIZED: "Bạn không có quyền truy cập.",
  CONFLICT: "Flashcard đã tồn tại.",
  NETWORK_ERROR: "Lỗi kết nối. Vui lòng kiểm tra internet.",
  TIMEOUT: "Yêu cầu hết thời gian. Vui lòng thử lại.",
  HTTP_400: "Yêu cầu không hợp lệ.",
  HTTP_401: "Bạn cần đăng nhập.",
  HTTP_403: "Bạn không có quyền.",
  HTTP_404: "Không tìm thấy.",
  HTTP_409: "Dữ liệu bị xung đột.",
  HTTP_413: "Dữ liệu quá lớn.",
  HTTP_500: "Lỗi máy chủ. Vui lòng thử lại sau.",
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(code: string): string {
  return ERROR_MESSAGES[code] || "Có lỗi xảy ra. Vui lòng thử lại.";
}
