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
 * Only enable in development or for debugging
 */
export function isDebugMetricsEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return process.env.NEXT_PUBLIC_DEBUG_METRICS === "true";
}
