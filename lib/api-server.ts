import { fetchAuthSession } from "aws-amplify/auth/server";
import { cookies } from "next/headers";
import { runWithAmplifyServerContext } from "./amplify-server";

/**
 * Utility to make authorized API calls from Server Actions or React Server Components.
 */
export async function apiFetchServer(path: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  return await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      const session = await fetchAuthSession(contextSpec);
      const token = session.tokens?.idToken?.toString() ?? session.tokens?.accessToken?.toString();

      const headers = new Headers(options.headers);
      headers.set("Content-Type", "application/json");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const tokenPreview = token ? `${token.slice(0, 12)}...${token.slice(-8)}` : "<missing>";
      console.info("[apiFetchServer]", {
        url: `${baseUrl.replace(/\/$/, "")}${path}`,
        method: options.method ?? "GET",
        hasToken: !!token,
        tokenPreview,
      });

      const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as { message?: string }));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return response.json();
    },
  });
}
