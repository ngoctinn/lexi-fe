/**
 * Feature flag utilities for gradual rollout of streaming transcription
 */

export function isStreamingEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return process.env.NEXT_PUBLIC_USE_STREAMING === "true";
}
