/**
 * Audio format conversion utilities for Transcribe streaming
 * 
 * AWS Transcribe Streaming requires:
 * - PCM (signed 16-bit little-endian) ✅
 * - Sample rate: 16kHz
 * - Channels: Mono
 * 
 * Browser microphones typically produce:
 * - Float32 PCM at 48kHz (or 44.1kHz)
 * - We need to resample to 16kHz and convert to Int16
 * 
 * IMPORTANT: We use AudioWorklet to capture raw PCM, NOT MediaRecorder.
 * MediaRecorder produces WebM/Ogg containers where individual chunks are
 * NOT independently decodable - they must be concatenated first.
 * 
 * References:
 * - https://stackoverflow.com/questions/79240257 (WebM chunks not independently processable)
 * - https://www.doist.dev/building-ramble-2-capturing-audio-in-real-time/
 */

/**
 * Resample audio from source sample rate to target sample rate
 * Uses linear interpolation for simplicity and low latency
 */
function resampleAudio(
  samples: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (sourceSampleRate === targetSampleRate) {
    return samples;
  }

  const ratio = sourceSampleRate / targetSampleRate;
  const newLength = Math.round(samples.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const sourceIndex = i * ratio;
    const index = Math.floor(sourceIndex);
    const fraction = sourceIndex - index;

    if (index + 1 < samples.length) {
      // Linear interpolation between two samples
      result[i] = samples[index] * (1 - fraction) + samples[index + 1] * fraction;
    } else {
      result[i] = samples[index];
    }
  }

  return result;
}

/**
 * Convert Float32 PCM to Int16 PCM (required by Transcribe)
 */
function float32ToInt16(samples: Float32Array): Int16Array {
  const result = new Int16Array(samples.length);
  
  for (let i = 0; i < samples.length; i++) {
    // Clamp to [-1, 1] and convert to 16-bit integer
    const s = Math.max(-1, Math.min(1, samples[i]));
    result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  return result;
}

/**
 * Process raw PCM audio from AudioWorklet for Transcribe
 * 
 * @param samples - Float32 PCM samples from AudioWorklet
 * @param sourceSampleRate - Browser's sample rate (typically 48kHz)
 * @param targetSampleRate - Transcribe's required sample rate (16kHz)
 * @returns Uint8Array of Int16 PCM data (little-endian)
 */
export function processAudioForTranscribe(
  samples: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number = 16000
): Uint8Array {
  // Step 1: Resample to target sample rate (48kHz → 16kHz)
  const resampled = resampleAudio(samples, sourceSampleRate, targetSampleRate);
  
  // Step 2: Convert Float32 to Int16
  const int16Data = float32ToInt16(resampled);
  
  // Step 3: Return as Uint8Array (little-endian byte representation)
  // Create new ArrayBuffer to ensure it's not SharedArrayBuffer
  const buffer = new ArrayBuffer(int16Data.byteLength);
  new Uint8Array(buffer).set(new Uint8Array(int16Data.buffer));
  return new Uint8Array(buffer);
}

/**
 * Check if browser supports AudioWorklet (modern audio processing)
 */
export function supportsAudioWorklet(): boolean {
  return typeof AudioWorklet !== 'undefined' && typeof AudioContext !== 'undefined';
}
