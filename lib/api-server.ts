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
    operation: async (contextSpec: any) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        const token = session.tokens?.idToken?.toString();

        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        };

        const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
          ...options,
          headers,
        });

        if (!response.ok) {
           const errorData = await response.json().catch(() => ({}));
           throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Server API Fetch Error:", error);
        throw error;
      }
    },
  });
}
