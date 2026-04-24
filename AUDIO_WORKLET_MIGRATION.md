# Audio Worklet Migration - Fix for "Unable to decode audio data" Error

## Problem Summary

**Error**: `Unable to decode audio data: Unable to decode audio data`

**Root Cause**: WebM chunks from MediaRecorder are **NOT independently decodable**. 

### Why MediaRecorder Doesn't Work for Streaming

From [StackOverflow research](https://stackoverflow.com/questions/79240257):

> "The first chunk (root chunk) is independently processable because it contains the necessary EBML headers and metadata. However, **subsequent chunks are not independently processable**, as they lack the required metadata, which prevents me from extracting audio independently from them."

And from [another source](https://stackoverflow.com/questions/53229528):

> "Individual blobs are **not individually decodable** in general; they must be concatenated to produce a usable resource."

**What this means**:
1. MediaRecorder produces WebM/Ogg container format
2. First chunk = EBML header/metadata (NOT audio)
3. Subsequent chunks = audio data WITHOUT headers
4. Web Audio API's `decodeAudioData()` requires complete files with headers
5. **Cannot decode individual chunks** → Error on every chunk

### Previous Failed Approach

```typescript
// ❌ WRONG: Try to decode each MediaRecorder chunk
recorder.ondataavailable = async (ev) => {
  const pcmData = await convertToPCM(ev.data, SAMPLE_RATE); // FAILS
  // Error: Unable to decode audio data
};
```

**Why it failed**: Each WebM chunk lacks the container headers needed for decoding.

## Solution: AudioWorklet

**Use Web Audio API's AudioWorklet to capture raw PCM samples directly from the microphone.**

### Why AudioWorklet Works

1. **Raw PCM samples**: No container format, no headers, just Float32 audio data
2. **Real-time processing**: Runs on dedicated audio thread (not main thread)
3. **Low latency**: ~40-50ms buffer (2048 samples at 48kHz)
4. **No decoding needed**: Already in PCM format, just resample and convert to Int16

### Architecture Comparison

**Before (MediaRecorder - BROKEN)**:
```
Microphone → MediaRecorder → WebM chunks → decodeAudioData() → ❌ ERROR
```

**After (AudioWorklet - WORKING)**:
```
Microphone → AudioContext → AudioWorklet → Float32 PCM → Resample → Int16 PCM → Transcribe ✅
```

## Implementation

### 1. AudioWorklet Processor (`public/audio-worklet-processor.js`)

```javascript
const BUFFER_SIZE = 2048; // ~40-50ms at 48kHz

class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(BUFFER_SIZE);
    this.bufferIndex = 0;
  }

  process(inputs) {
    const inputChannel = inputs[0]?.[0];

    if (inputChannel) {
      // Accumulate samples
      for (const sample of inputChannel) {
        this.buffer[this.bufferIndex++] = sample;

        // Send full buffer to main thread
        if (this.bufferIndex >= BUFFER_SIZE) {
          this.port.postMessage(new Float32Array(this.buffer));
          this.bufferIndex = 0;
        }
      }
    }

    return true; // Keep processor alive
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
```

**Key points**:
- Runs on audio rendering thread (separate from main thread)
- Accumulates 2048 samples before sending (reduces overhead)
- Sends Float32 PCM directly (no container format)

### 2. Audio Converter (`utils/audio-converter.ts`)

```typescript
/**
 * Resample audio from browser sample rate (48kHz) to Transcribe sample rate (16kHz)
 */
function resampleAudio(
  samples: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number
): Float32Array {
  const ratio = sourceSampleRate / targetSampleRate;
  const newLength = Math.round(samples.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const sourceIndex = i * ratio;
    const index = Math.floor(sourceIndex);
    const fraction = sourceIndex - index;

    if (index + 1 < samples.length) {
      // Linear interpolation
      result[i] = samples[index] * (1 - fraction) + samples[index + 1] * fraction;
    } else {
      result[i] = samples[index];
    }
  }

  return result;
}

/**
 * Convert Float32 to Int16 (required by Transcribe)
 */
function float32ToInt16(samples: Float32Array): Int16Array {
  const result = new Int16Array(samples.length);
  
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  return result;
}

/**
 * Process raw PCM from AudioWorklet for Transcribe
 */
export function processAudioForTranscribe(
  samples: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number = 16000
): Uint8Array {
  // Resample: 48kHz → 16kHz
  const resampled = resampleAudio(samples, sourceSampleRate, targetSampleRate);
  
  // Convert: Float32 → Int16
  const int16Data = float32ToInt16(resampled);
  
  // Return as bytes (little-endian)
  return new Uint8Array(int16Data.buffer);
}
```

**Key points**:
- Simple linear interpolation for resampling (fast, low latency)
- Float32 → Int16 conversion (Transcribe requirement)
- No decoding needed (already raw PCM)

### 3. Recorder Hook (`hooks/use-client-streaming-recorder.ts`)

```typescript
const startRecording = async () => {
  // 1. Get microphone access
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true }
  });

  // 2. Create AudioContext
  const audioContext = new AudioContext();
  const sourceSampleRate = audioContext.sampleRate; // Usually 48kHz

  // 3. Load AudioWorklet module
  await audioContext.audioWorklet.addModule('/audio-worklet-processor.js');

  // 4. Create AudioWorklet node
  const workletNode = new AudioWorkletNode(audioContext, 'audio-capture-processor');

  // 5. Handle audio data from worklet
  workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
    // Process: Float32 → Resample → Int16 → Transcribe
    const pcmData = processAudioForTranscribe(event.data, sourceSampleRate, 16000);
    const pcmBlob = new Blob([pcmData], { type: 'audio/pcm' });
    transcribe.sendAudioChunk(pcmBlob);
  };

  // 6. Connect: Microphone → Worklet
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(workletNode);

  // 7. Start Transcribe
  await transcribe.startStream("en-US");
};
```

**Key points**:
- No MediaRecorder
- AudioWorklet runs on separate thread (no UI jank)
- Direct PCM capture (no container format)
- Real-time processing

## Performance Comparison

| Metric | MediaRecorder (Old) | AudioWorklet (New) |
|--------|---------------------|-------------------|
| **Latency** | 250ms (chunk interval) | 40-50ms (buffer size) |
| **Errors** | ❌ "Unable to decode audio data" | ✅ No errors |
| **CPU Usage** | High (decoding) | Low (no decoding) |
| **Thread** | Main thread | Audio thread |
| **Format** | WebM (container) | Raw PCM |

## Testing Checklist

- [x] Click mic → No "Unable to decode audio data" errors
- [x] Speak → Partial transcripts appear within 1-2 seconds
- [x] Stop → Final transcript submitted to backend
- [x] Multiple start/stop cycles work correctly
- [x] No console errors during recording
- [x] Audio quality is good (no distortion)

## References

### Research Sources

1. **WebM Chunks Not Independently Decodable**
   - https://stackoverflow.com/questions/79240257
   - https://stackoverflow.com/questions/53229528
   - https://stackoverflow.com/questions/62236838

2. **AudioWorklet Best Practices**
   - https://www.doist.dev/building-ramble-2-capturing-audio-in-real-time/
   - https://web.dev/patterns/media/microphone-process

3. **AWS Transcribe Streaming**
   - https://docs.aws.amazon.com/transcribe/latest/dg/streaming.html
   - PCM format: 16kHz, mono, signed 16-bit little-endian

### Key Insights

1. **MediaRecorder is NOT suitable for real-time streaming** when you need to process individual chunks
2. **AudioWorklet is the modern standard** for real-time audio processing (ScriptProcessorNode is deprecated)
3. **Raw PCM is simpler** than dealing with container formats
4. **Linear interpolation is sufficient** for resampling (no need for complex algorithms)

## Migration Impact

### Files Changed

1. ✅ `public/audio-worklet-processor.js` - NEW (AudioWorklet processor)
2. ✅ `utils/audio-converter.ts` - REWRITTEN (removed decodeAudioData, added resampling)
3. ✅ `hooks/use-client-streaming-recorder.ts` - REWRITTEN (AudioWorklet instead of MediaRecorder)

### Files Removed

1. ❌ `utils/audio-worklet-processor.ts` - Moved to public/ as .js file

### Breaking Changes

None - This is an internal implementation change. The API remains the same.

## Conclusion

The "Unable to decode audio data" error was caused by attempting to decode individual WebM chunks, which is architecturally impossible. The solution is to use AudioWorklet to capture raw PCM samples directly, eliminating the need for decoding entirely.

This approach is:
- ✅ **Simpler**: No container format, no decoding
- ✅ **Faster**: Lower latency (40-50ms vs 250ms)
- ✅ **More reliable**: No decoding errors
- ✅ **Modern**: AudioWorklet is the current standard (ScriptProcessorNode is deprecated)
- ✅ **Better UX**: Real-time feedback, no delays

The migration is complete and tested.
