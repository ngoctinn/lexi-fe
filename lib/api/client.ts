import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiRequest<T = any>(path: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  const headers = new Headers(options?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");
  
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
  
  if (!res.ok) {
    let errorMessage = "API Error";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If response is not JSON
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  return res.json() as Promise<T>;
}
