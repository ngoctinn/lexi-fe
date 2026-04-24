# Fix: Missing Transcript After Stop Recording

## Problem 1: Transcript Lost After Stop

User reported: "bị mất chunk rồi không thấy text và cũng không gửi được text sau khi nói xong"

**Root Cause**: Race condition between stopping recording and receiving final transcript from AWS Transcribe.

### Flow Analysis

1. User clicks stop → `stopRecording()` called
2. Transcribe stream closed **immediately**
3. Final transcript might still be in transit from AWS
4. `finalTranscriptRef.current` is empty → **NO Turn created, NO WebSocket message sent**
5. User sees nothing and nothing is sent to backend

### Why It Happened

- Only `finalTranscriptRef` was used (set by `onFinalTranscript` callback)
- Partial transcripts were NOT accumulated as backup
- No delay to wait for final transcript before closing stream
- If AWS doesn't send final transcript before close, all text is lost

## Solution 1: Prevent Transcript Loss

### 1. Added Accumulated Transcript Backup

```typescript
const accumulatedTranscriptRef = React.useRef<string>("");
```

- Stores the latest transcript (partial or final) as backup
- Updated on every transcript event (both partial and final)

### 2. Modified `handleTranscript` to Accumulate

```typescript
if (result.isPartial) {
  // Accumulate partial transcripts as backup
  if (result.text.trim()) {
    accumulatedTranscriptRef.current = result.text;
  }
  onPartialTranscript(result.text, result.confidence);
} else {
  // Store final transcript
  finalTranscriptRef.current = result.text;
  finalConfidenceRef.current = result.confidence;
  // Also update accumulated transcript with final version
  if (result.text.trim()) {
    accumulatedTranscriptRef.current = result.text;
  }
  onFinalTranscript(result.text, result.confidence);
}
```

### 3. Added 500ms Delay in `stopRecording`

```typescript
// Wait 500ms for final transcript to arrive from AWS before closing stream
console.log("[Recorder] Waiting 500ms for final transcript...");
await new Promise(resolve => setTimeout(resolve, 500));
console.log("[Recorder] After wait - Final:", finalTranscriptRef.current, "Accumulated:", accumulatedTranscriptRef.current);
```

### 4. Fallback Logic

```typescript
// Determine which transcript to use (prefer final, fallback to accumulated)
const transcriptToSend = finalTranscriptRef.current.trim() || accumulatedTranscriptRef.current.trim();
const confidenceToSend = finalTranscriptRef.current.trim() ? finalConfidenceRef.current : 0.8;

if (transcriptToSend) {
  // Create Turn and send WebSocket message
} else {
  console.warn("[Recorder] No transcript available after stop");
  onError("Không nhận được văn bản. Vui lòng thử lại.");
}
```

### 5. Enhanced Logging

Added detailed logs to track:
- Transcript state before and after delay
- Which transcript source is used (final vs accumulated)
- Warning if no transcript is available

---

## Problem 2: Real-time Transcript Not Showing While Recording

User reported: "tôi vẫn chưa thấy text hiện thị dưới input ????? khi đang nói"

**Root Cause**: `TranscriptDisplay` component was created but NOT rendered in the UI.

### Why It Happened

- `TranscriptDisplay` component exists in `lexi-fe/features/session/components/transcript-display.tsx`
- Component was NOT imported or rendered in `MessageInput` or `ConversationScreen`
- User couldn't see real-time transcript while speaking

## Solution 2: Integrate Transcript Inside Input

User requested: "tại sao không nằm ở dưới input luôn, bỏ cái wave đi là được"

### 1. Removed Waveform Animation

- Replaced Waveform with simple text layout
- Cleaner, more focused UI

### 2. Integrated Transcript Display Inside Input

Instead of creating a separate component below input, transcript is now displayed **INSIDE** the input field when recording:

```typescript
{isRecording ? (
  <div className="flex-1 flex flex-col gap-2 px-4 py-3 h-full justify-center">
    {/* Transcript display inside input */}
    {hasAnyTranscript ? (
      <div className="flex-1 flex flex-col gap-1 min-h-0">
        {/* Final text - black */}
        {hasFinalText && (
          <p className="text-sm text-foreground font-medium">
            {streamingTranscript.finalText}
          </p>
        )}
        {/* Partial text - gray */}
        {hasPartialText && (
          <p className="text-sm text-muted-foreground">
            {streamingTranscript.partialText}
          </p>
        )}
      </div>
    ) : (
      <span className="text-sm text-muted-foreground italic">Đang lắng nghe...</span>
    )}
    
    {/* Timer at bottom right */}
    <div className="flex items-center justify-end">
      <div className="px-3 py-1 bg-primary-100 rounded-full">
        <span className="text-xs text-primary font-bold">{formatTime(timer)}</span>
      </div>
    </div>
  </div>
) : (
  <InputGroupInput ... />
)}

---

## Benefits

1. **Prevents transcript loss**: Accumulated transcript acts as backup
2. **Gives AWS time to respond**: 500ms delay allows final transcript to arrive
3. **Better UX**: User sees error message if transcript is truly empty
4. **Real-time feedback**: User sees transcript while speaking
5. **Debugging**: Detailed logs help identify timing issues
6. **Graceful degradation**: Falls back to partial transcript if final is missing

## Testing Checklist

- [ ] Record short phrase (< 2 seconds) and stop immediately
- [ ] Record long phrase (> 5 seconds) and stop immediately
- [ ] Record and stop multiple times rapidly
- [ ] **Verify real-time transcript shows while recording**
- [ ] Check console logs for transcript state
- [ ] Verify Turn is created with correct text after stop
- [ ] Verify WebSocket message is sent
- [ ] Test with poor network conditions

## Files Modified

- `lexi-fe/features/session/hooks/use-client-streaming-recorder.ts`
  - Added `accumulatedTranscriptRef`
  - Modified `handleTranscript` to accumulate all transcripts
  - Added 500ms delay in `stopRecording`
  - Added fallback logic with error handling
  - Enhanced logging

- `lexi-fe/features/session/components/conversation/message-input.tsx`
  - Removed Waveform animation
  - Integrated transcript display INSIDE input field when recording
  - Added `useSessionStore` to read `streamingTranscript`
  - Layout: Final text (black) + Partial text (gray) + Timer (bottom right)

- `lexi-fe/features/session/components/conversation/transcript-panel.tsx`
  - Improved typing indicator logic
  - Shows 3 dots when AI is preparing response (no text yet)
  - Shows text + 3 dots when AI is streaming

- `lexi-fe/features/session/hooks/use-session.ts`
  - Added logging for partial/final transcript callbacks

- `lexi-fe/features/session/components/transcript-display.tsx`
  - **DELETED** - No longer needed as transcript is integrated into input
