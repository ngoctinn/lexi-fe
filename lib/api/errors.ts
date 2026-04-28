/**
 * Unified API Error Handling
 * Single source of truth for error handling across all features
 */

/**
 * Standard error response from API
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  code?: string;
}

/**
 * Error information with user-friendly message
 */
export interface ErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  isRetryable: boolean;
  statusCode?: number;
}

/**
 * Base API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isRetryable: boolean = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400, false);
    this.name = "ValidationError";
  }
}

/**
 * Authentication error (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401, false);
    this.name = "UnauthorizedError";
  }
}

/**
 * Authorization error (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403, false);
    this.name = "ForbiddenError";
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Not found") {
    super(message, "NOT_FOUND", 404, false);
    this.name = "NotFoundError";
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = "Conflict") {
    super(message, "CONFLICT", 409, false);
    this.name = "ConflictError";
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends ApiError {
  constructor(message: string = "Too many requests") {
    super(message, "RATE_LIMIT", 429, true);
    this.name = "RateLimitError";
  }
}

/**
 * Server error (5xx)
 */
export class ServerError extends ApiError {
  constructor(message: string = "Server error", statusCode: number = 500) {
    super(message, "SERVER_ERROR", statusCode, true);
    this.name = "ServerError";
  }
}

/**
 * Network error
 */
export class NetworkError extends ApiError {
  constructor(message: string = "Network error") {
    super(message, "NETWORK_ERROR", 0, true);
    this.name = "NetworkError";
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends ApiError {
  constructor(message: string = "Request timeout") {
    super(message, "TIMEOUT", 0, true);
    this.name = "TimeoutError";
  }
}

/**
 * Vietnamese error messages
 */
const ERROR_MESSAGES: Record<string, ErrorInfo> = {
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Request validation failed",
    userMessage: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
    isRetryable: false,
    statusCode: 400,
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Authentication failed",
    userMessage: "Phiên đã hết hạn. Vui lòng đăng nhập lại.",
    isRetryable: false,
    statusCode: 401,
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "Permission denied",
    userMessage: "Bạn không có quyền thực hiện hành động này.",
    isRetryable: false,
    statusCode: 403,
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "Resource not found",
    userMessage: "Không tìm thấy tài nguyên. Vui lòng thử lại.",
    isRetryable: false,
    statusCode: 404,
  },
  CONFLICT: {
    code: "CONFLICT",
    message: "Resource conflict",
    userMessage: "Tài nguyên đã tồn tại. Vui lòng thử lại.",
    isRetryable: false,
    statusCode: 409,
  },
  RATE_LIMIT: {
    code: "RATE_LIMIT",
    message: "Too many requests",
    userMessage: "Quá nhiều yêu cầu. Vui lòng thử lại sau vài giây.",
    isRetryable: true,
    statusCode: 429,
  },
  SERVER_ERROR: {
    code: "SERVER_ERROR",
    message: "Server error",
    userMessage: "Lỗi máy chủ. Vui lòng thử lại sau.",
    isRetryable: true,
    statusCode: 500,
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "Network error",
    userMessage: "Lỗi kết nối. Vui lòng kiểm tra kết nối internet.",
    isRetryable: true,
    statusCode: 0,
  },
  TIMEOUT: {
    code: "TIMEOUT",
    message: "Request timeout",
    userMessage: "Yêu cầu hết thời gian chờ. Vui lòng thử lại.",
    isRetryable: true,
    statusCode: 0,
  },
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
  SUBMISSION_FAILED: {
    code: "SUBMISSION_FAILED",
    message: "Turn submission failed",
    userMessage: "Không thể gửi câu trả lời. Vui lòng thử lại.",
    isRetryable: true,
  },
};

/**
 * Parse HTTP status code to error info
 */
export function parseHttpError(status: number, data?: any): ErrorInfo {
  const message = data?.message || data?.error || `HTTP ${status}`;

  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 409:
      return ERROR_MESSAGES.CONFLICT;
    case 429:
      return ERROR_MESSAGES.RATE_LIMIT;
    case 408:
      return ERROR_MESSAGES.TIMEOUT;
    default:
      if (status >= 500) {
        return {
          code: "SERVER_ERROR",
          message,
          userMessage: ERROR_MESSAGES.SERVER_ERROR.userMessage,
          isRetryable: true,
          statusCode: status,
        };
      }
      return {
        code: `HTTP_${status}`,
        message,
        userMessage: "Đã có lỗi xảy ra. Vui lòng thử lại.",
        isRetryable: false,
        statusCode: status,
      };
  }
}

/**
 * Get error info by code
 */
export function getErrorInfo(code: string): ErrorInfo {
  return (
    ERROR_MESSAGES[code] || {
      code,
      message: "Unknown error",
      userMessage: "Đã có lỗi xảy ra. Vui lòng thử lại.",
      isRetryable: false,
    }
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(code: string): string {
  return getErrorInfo(code).userMessage;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (error instanceof ApiError) {
    return error.isRetryable;
  }
  if (error?.retryable !== undefined) {
    return error.retryable;
  }
  return false;
}

/**
 * Throw appropriate error based on HTTP status
 */
export function throwHttpError(status: number, data?: any): never {
  const message = data?.message || data?.error || `HTTP ${status}`;

  switch (status) {
    case 400:
      throw new ValidationError(message);
    case 401:
      throw new UnauthorizedError(message);
    case 403:
      throw new ForbiddenError(message);
    case 404:
      throw new NotFoundError(message);
    case 409:
      throw new ConflictError(message);
    case 429:
      throw new RateLimitError(message);
    case 408:
      throw new TimeoutError(message);
    default:
      if (status >= 500) {
        throw new ServerError(message, status);
      }
      throw new ApiError(message, `HTTP_${status}`, status, false);
  }
}
