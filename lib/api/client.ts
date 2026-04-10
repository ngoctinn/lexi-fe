import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiRequest<T = any>(path: string, options?: RequestInit): Promise<T> {
  // Lấy token từ Amplify Server Context
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });
  
  // Thử lấy ID Token vì Cognito Authorizer thường yêu cầu ID Token để xác thực claims
  const idToken = session.tokens?.idToken?.toString();
  const accessToken = session.tokens?.accessToken?.toString();
  const token = idToken || accessToken;
  
  if (!token) {
    console.warn(`[API] No token found for request: ${path}. Session tokens:`, {
      hasIdToken: !!idToken,
      hasAccessToken: !!accessToken
    });
  } else {
    const tokenType = idToken ? "ID Token" : "Access Token";
    console.log(`[API] Using ${tokenType} for ${path}: ${token.substring(0, 10)}...`);
  }

  const headers = new Headers(options?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");
  
  // Tránh dấu // nếu BASE_URL kết thúc bằng / và path bắt đầu bằng /
  const url = `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  
  const res = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!res.ok) {
    let errorMessage = "API Error";
    let rawError = "";
    try {
      rawError = await res.text();
      const errorData = JSON.parse(rawError);
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = rawError || res.statusText || errorMessage;
    }
    
    console.error(`[API Error] ${options?.method || "GET"} ${path} (${res.status}):`, {
      message: errorMessage,
      url
    });
    
    throw new Error(errorMessage);
  }
  
  return res.json() as Promise<T>;
}
