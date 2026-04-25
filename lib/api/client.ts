/**
 * @deprecated This file is deprecated. Use lib/api/fetch.ts instead.
 * 
 * Migration guide:
 * - Replace `apiRequest()` with `apiFetch()`
 * - Replace `apiRequestPublic()` with `apiPublicFetch()`
 * - Update error handling to check response.success instead of try/catch
 * 
 * This file is kept for backward compatibility only.
 * It will be removed in a future version.
 */

import { apiFetch, apiPublicFetch } from "./fetch";

/**
 * @deprecated Use apiFetch from lib/api/fetch.ts instead
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  console.warn(
    "[DEPRECATED] apiRequest() is deprecated. Use apiFetch() from lib/api/fetch.ts instead."
  );
  return apiFetch<T>(path, options);
}

/**
 * @deprecated Use apiPublicFetch from lib/api/fetch.ts instead
 */
export async function apiRequestPublic<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  console.warn(
    "[DEPRECATED] apiRequestPublic() is deprecated. Use apiPublicFetch() from lib/api/fetch.ts instead."
  );
  return apiPublicFetch<T>(path, options);
}
