import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiErrorBody = {
  message?: string;
};

export async function apiRequest<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });

  const token = session.tokens?.idToken?.toString() ?? session.tokens?.accessToken?.toString();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const tokenPreview = token ? `${token.slice(0, 12)}...${token.slice(-8)}` : "<missing>";
  console.info("[apiRequest]", {
    url: `${BASE_URL.replace(/\/$/, "")}${path}`,
    method: options.method ?? "GET",
    hasToken: !!token,
    tokenPreview,
  });

  const response = await fetch(`${BASE_URL.replace(/\/$/, "")}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({} as ApiErrorBody));
    throw new Error(body.message || `API Error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
