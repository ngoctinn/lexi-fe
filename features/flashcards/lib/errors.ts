/**
 * Flashcard-specific error handling
 * Re-exports from unified error handler for backward compatibility
 */

export {
  ApiError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  NetworkError,
  TimeoutError,
  ServerError,
  RateLimitError,
  ForbiddenError,
  parseHttpError as parseApiError,
  getErrorInfo,
  getUserFriendlyMessage,
  isRetryableError,
  throwHttpError,
  type ApiErrorResponse,
  type ErrorInfo,
} from "@/lib/api/errors";

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
