/**
 * AudioWorklet Processor for Real-Time PCM Audio Capture
 * 
 * This runs on the audio rendering thread (separate from main thread)
 * to capture raw PCM audio samples from the microphone.
 * 
 * Why AudioWorklet instead of MediaRecorder?
 * - MediaRecorder produces WebM/Ogg containers with headers
 * - Individual WebM chunks are NOT independently decodable
 * - AudioWorklet gives us raw Float32 PCM samples directly
 * - No conversion needed, just resample and send to Transcribe
 * 
 * References:
 * - https://www.doist.dev/building-ramble-2-capturing-audio-in-real-time/
 * - https://web.dev/patterns/media/microphone-process
 */

// Buffer size: 2048 samples ≈ 40-50ms at 48kHz (typical browser sample rate)
// This balances latency vs overhead
const BUFFER_SIZE = 2048;

class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(BUFFER_SIZE);
    this.bufferIndex = 0;
  }

  /**
   * Called automatically by Web Audio API with audio samples
   * @param inputs - Array of input channels (we use first channel - mono)
   * @returns true to keep processor alive
   */
  process(inputs) {
    const inputChannel = inputs[0]?.[0];

    if (inputChannel) {
      // Accumulate samples into buffer
      for (const sample of inputChannel) {
        this.buffer[this.bufferIndex++] = sample;

        // When buffer is full, send to main thread
        if (this.bufferIndex >= BUFFER_SIZE) {
          // Copy buffer to avoid mutation issues
          this.port.postMessage(new Float32Array(this.buffer));
          this.bufferIndex = 0;
        }
      }
    }

    // Return true to keep processor alive
    return true;
  }
}

// Register the processor
registerProcessor('audio-capture-processor', AudioCaptureProcessor);
