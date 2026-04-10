import { fetchAuthSession } from "aws-amplify/auth";

/**
 * Utility to make authorized API calls to the backend.
 * This can be used in Client Components.
 * For Server Actions, use the server-side version.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  try {
    const session = await fetchAuthSession();
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
    console.error("API Fetch Error:", error);
    throw error;
  }
}
