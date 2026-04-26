/**
 * Pure Next.js Pattern - Thin fetch wrapper with auth
 * 
 * This is a minimal helper that adds authentication to fetch requests.
 * Following Next.js best practices:
 * - Fetch directly in Server Components/Actions
 * - Return errors, don't throw (for expected errors)
 * - Use native fetch caching options
 */

import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

/**
 * Get auth token from Amplify session
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });

    // Use ID Token for API Gateway Cognito authorizer
    return session.tokens?.idToken?.toString() ?? null;
  } catch (error) {
    console.error("[getAuthToken] Error:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Authenticated fetch - for protected endpoints
 * 
 * Usage in Server Actions:
 * ```ts
 * const response = await apiFetch<ApiResponse<Profile>>("/profile");
 * if (!response.success) {
 *   return { success: false, error: response.message };
 * }
 * return { success: true, data: response.data };
 * ```
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const url = `${BASE_URL}${path}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  
  if (token) {
    headers.set("Authorization", token);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
    
    return {
      success: false,
      message: errorMessage,
      error: errorMessage,
    } as T;
  }

  return response.json();
}

/**
 * Public fetch - for public endpoints (no auth required)
 * 
 * Usage:
 * ```ts
 * const response = await apiPublicFetch<ApiResponse<Scenario[]>>("/scenarios");
 * ```
 */
export async function apiPublicFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
    
    return {
      success: false,
      message: errorMessage,
      error: errorMessage,
    } as T;
  }

  return response.json();
}
