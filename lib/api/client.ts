import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function requestJson<T = unknown>(
  path: string,
  options: RequestInit = {},
  includeAuthToken = true,
): Promise<T> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const normalizedBaseUrl = BASE_URL.replace(/\/$/, "");
  const requestUrl = `${normalizedBaseUrl}${path}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (includeAuthToken) {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });

    const token =
      session.tokens?.idToken?.toString() ??
      session.tokens?.accessToken?.toString();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error(
      `[apiRequest] Network error when fetching ${requestUrl}:`,
      err,
    );
    throw err;
  }

  if (!response.ok) {
    // Read response body (try JSON first, fall back to text) to provide
    // actionable error messages during development.
    const raw = await response.text().catch(() => "");
    let parsed: Record<string, unknown> | undefined;
    try {
      parsed = raw ? JSON.parse(raw) : undefined;
    } catch {}

    const message = parsed?.message || parsed?.error || parsed?.detail;

    // Log details to help debug 4xx/5xx from backend (avoid logging tokens)
    console.error(`[apiRequest] ${requestUrl} returned ${response.status}`, {
      status: response.status,
      body: parsed ?? raw,
    });

    if (message) {
      throw new Error(String(message));
    }

    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    throw new Error(raw ? raw : `API Error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return requestJson<T>(path, options, true);
}

export async function apiRequestPublic<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return requestJson<T>(path, options, false);
}
