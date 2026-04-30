/**
 * Feature flag utilities for gradual rollout of streaming transcription
 */

export function isStreamingEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return process.env.NEXT_PUBLIC_USE_STREAMING === "true";
}

/**
 * Feature flag for showing debug metrics (latency, tokens, cost)
 * Enabled when:
 * 1. NEXT_PUBLIC_DEBUG_METRICS=true (development/debugging)
 * 2. User has ADMIN role (stored in localStorage after profile fetch)
 */
export function isDebugMetricsEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  
  // Check environment variable
  if (process.env.NEXT_PUBLIC_DEBUG_METRICS === "true") {
    return true;
  }
  
  // Check if user is admin (from localStorage)
  try {
    const userRole = localStorage.getItem("user_role");
    return userRole === "ADMIN";
  } catch {
    return false;
  }
}
