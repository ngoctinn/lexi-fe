/**
 * Utility functions for handling delivery cues in AI responses
 * Delivery cues are markers like [warmly], [encouragingly] that indicate tone/delivery
 */

export interface DeliveryCueInfo {
  cue: string | null;
  cleanText: string;
}

/**
 * Extract delivery cue from text and return cleaned text
 * Delivery cues are in format: [cue_name] at the start of text
 * Examples: [warmly], [encouragingly], [gently], [enthusiastically]
 */
export function extractDeliveryCue(text: string): DeliveryCueInfo {
  if (!text) {
    return { cue: null, cleanText: "" };
  }

  // Match [word] at the start of text
  const cueMatch = text.match(/^\s*\[([^\]]+)\]\s*/);

  if (cueMatch) {
    const cue = cueMatch[1];
    const cleanText = text.slice(cueMatch[0].length);
    return { cue, cleanText };
  }

  return { cue: null, cleanText: text };
}

/**
 * Get emoji representation for delivery cue
 */
export function getCueEmoji(cue: string | null): string {
  if (!cue) return "";

  const cueMap: Record<string, string> = {
    warmly: "🤗",
    encouragingly: "💪",
    gently: "🌸",
    enthusiastically: "🎉",
    thoughtfully: "🤔",
    playfully: "😄",
    seriously: "😐",
    excitedly: "✨",
    calmly: "😌",
    supportively: "👍",
  };

  return cueMap[cue.toLowerCase()] || "💬";
}

/**
 * Get readable label for delivery cue
 */
export function getCueLabel(cue: string | null): string {
  if (!cue) return "";
  return cue.charAt(0).toUpperCase() + cue.slice(1);
}
