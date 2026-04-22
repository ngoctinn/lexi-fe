import { fetchAuthSession } from "aws-amplify/auth/server";
import { cookies } from "next/headers";
import { runWithAmplifyServerContext } from "./amplify-server";

/**
 * Helper gọi API có xác thực từ Server Action hoặc Server Component.
 */
export async function apiFetchServer(path: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const requestUrl = `${normalizedBaseUrl}${path}`;

  return await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      const session = await fetchAuthSession(contextSpec);
      const token =
        session.tokens?.idToken?.toString() ??
        session.tokens?.accessToken?.toString();

      const headers = new Headers(options.headers);
      headers.set("Content-Type", "application/json");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      let response: Response;
      try {
        response = await fetch(requestUrl, {
          ...options,
          headers,
        });
      } catch (err) {
        console.error(`[api-server] Network error (${requestUrl}):`, err);
        throw err;
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}) as { message?: string });
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return response.json();
    },
  });
}
