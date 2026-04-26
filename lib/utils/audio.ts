/**
 * Audio utilities for generating pronunciation URLs
 */

/**
 * Generate audio URL for word pronunciation using free TTS services
 * 
 * Services used (in order of preference):
 * 1. Google Translate TTS (free, no API key needed)
 * 2. Fallback to browser Web Speech API
 */
export function generateAudioUrl(word: string): string | undefined {
  if (!word || word.trim().length === 0) {
    return undefined;
  }

  const cleanWord = encodeURIComponent(word.trim());
  
  // Google Translate TTS (free, reliable)
  // Format: https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=word
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${cleanWord}`;
}

/**
 * Play audio from URL or fallback to Web Speech API
 */
export async function playAudio(audioUrl: string | undefined, word: string): Promise<void> {
  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      await audio.play();
      return;
    } catch (error) {
      console.warn('[playAudio] Failed to play from URL, falling back to TTS:', error);
    }
  }

  // Fallback to Web Speech API
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}
