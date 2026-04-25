/**
 * Standard API response format from backend
 * All endpoints return this structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Standard error result for Server Actions
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Helper to create success result
 */
export function successResult<T>(data: T, message?: string): ActionResult<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Helper to create error result
 */
export function errorResult(error: string): ActionResult {
  return {
    success: false,
    error,
  };
}
