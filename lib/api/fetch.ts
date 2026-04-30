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

  if (!token) {
    console.error(`[apiFetch] No auth token available for ${path} - user may not be authenticated`);
    return {
      success: false,
      message: "Not authenticated",
      error: "Not authenticated",
    } as T;
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: Record<string, unknown> = {};
      let responseText = "";
      
      try {
        responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText) as Record<string, unknown>;
        }
      } catch {
        // Response is not JSON, use raw text
        errorData = { rawResponse: responseText };
      }
      
      const errorMessage = 
        errorData.message || 
        errorData.error || 
        errorData.rawResponse ||
        `HTTP ${response.status}`;
      
      console.error(`[apiFetch] ${options.method || 'GET'} ${path} failed:`, {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        details: errorData,
        headers: {
          contentType: response.headers.get('content-type'),
        },
      });
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      } as T;
    }

    const responseText = await response.text();
    if (!responseText) {
      console.warn(`[apiFetch] Empty response from ${path}`);
      return {
        success: false,
        message: "Empty response from server",
        error: "Empty response from server",
      } as T;
    }

    try {
      const parsed = JSON.parse(responseText);
      // Ensure response has success field
      if (typeof parsed.success === 'undefined') {
        console.warn(`[apiFetch] Response missing 'success' field from ${path}:`, parsed);
        return {
          success: false,
          message: "Invalid response format from server",
          error: "Invalid response format from server",
        } as T;
      }
      return parsed;
    } catch {
      console.error(`[apiFetch] Failed to parse response from ${path}:`, responseText);
      return {
        success: false,
        message: "Invalid JSON response from server",
        error: "Invalid JSON response from server",
      } as T;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network error";
    console.error(`[apiFetch] Network error for ${path}:`, errorMessage);
    
    return {
      success: false,
      message: errorMessage,
      error: errorMessage,
    } as T;
  }
}

/**
 * Authenticated fetch for direct body responses (no wrapper)
 * Used for admin endpoints that return direct body without {success: true, data: ...} wrapper
 * 
 * Usage:
 * ```ts
 * const response = await apiFetchDirect<{users: User[]}>("/admin/users");
 * return response.users ?? [];
 * ```
 */
export async function apiFetchDirect<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const token = await getAuthToken();
  const url = `${BASE_URL}${path}`;

  if (!token) {
    console.error(`[apiFetchDirect] No auth token available for ${path}`);
    throw new Error("Not authenticated");
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: Record<string, unknown> = {};
      
      try {
        const responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText) as Record<string, unknown>;
        }
      } catch {
        // Ignore parse errors
      }
      
      const errorMessage = String(
        errorData.message || 
        errorData.error || 
        `HTTP ${response.status}`
      );
      
      console.error(`[apiFetchDirect] ${options.method || 'GET'} ${path} failed:`, {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    if (!responseText) {
      console.warn(`[apiFetchDirect] Empty response from ${path}`);
      return null;
    }

    return JSON.parse(responseText) as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network error";
    console.error(`[apiFetchDirect] Error for ${path}:`, errorMessage);
    throw error;
  }
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
