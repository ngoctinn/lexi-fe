# Streaming Transcription Deployment Checklist

## Pre-Deployment Checklist

- [x] Infrastructure code updated (Cognito Identity Pool)
- [x] Backend handler added (submit_transcript)
- [x] Frontend dependencies added (AWS SDK packages)
- [x] Frontend hooks created (use-transcribe-streaming, use-client-streaming-recorder)
- [x] Type definitions updated (SUBMIT_TRANSCRIPT event)
- [x] Documentation created (implementation guide, summary)
- [x] Deployment script created (deploy-streaming.sh)

## Deployment Steps

### 1. Deploy Backend Infrastructure

```bash
cd lexi-be
./deploy-streaming.sh
```

**Expected Output:**
- SAM build successful
- SAM package successful
- CloudFormation stack deployed
- Identity Pool ID displayed

**Action Required:**
- Copy the Identity Pool ID from the output

### 2. Update Frontend Environment Variables

Edit `lexi-fe/.env.local`:

```env
NEXT_PUBLIC_IDENTITY_POOL_ID=ap-southeast-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

Replace `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX` with the actual Identity Pool ID from step 1.

### 3. Install Frontend Dependencies

```bash
cd lexi-fe
npm install
```

**Expected Output:**
- `@aws-sdk/client-transcribe-streaming@^3.712.0` installed
- `@aws-sdk/client-cognito-identity@^3.712.0` installed
- `@aws-sdk/credential-providers@^3.712.0` installed

### 4. Verify Environment Variables

```bash
cd lexi-fe
cat .env.local | grep -E "IDENTITY_POOL_ID|USER_POOL_ID|AWS_REGION|USE_STREAMING"
```

**Expected Output:**
```
NEXT_PUBLIC_IDENTITY_POOL_ID=ap-southeast-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
NEXT_PUBLIC_USER_POOL_ID=ap-southeast-1_VhFl3NxNy
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_USE_STREAMING=true
```

## Integration Steps

### 5. Update Session Component

Replace the old audio recorder with the new client-side streaming recorder:

```typescript
// Old (remove or comment out)
// import { useStreamingAudioRecorder } from "@/features/session/hooks/use-streaming-audio-recorder";

// New (add)
import { useClientStreamingRecorder } from "@/features/session/hooks/use-client-streaming-recorder";

// Add transcript state
const [transcriptState, setTranscriptState] = useState({
  finalText: "",
  partialText: "",
  isStreaming: false,
});

// Replace recorder initialization
const recorder = useClientStreamingRecorder({
  ws,
  sessionId: session.session_id,
  onPartialTranscript: (text, confidence) => {
    setTranscriptState(prev => ({
      ...prev,
      partialText: text,
      isStreaming: true,
    }));
  },
  onFinalTranscript: (text, confidence) => {
    setTranscriptState(prev => ({
      ...prev,
      finalText: text,
      partialText: "",
      isStreaming: false,
    }));
  },
  onError: (message) => {
    console.error("Streaming error:", message);
    toast.error(message);
  },
});
```

### 6. Update Transcript Display

Add transcript display to your UI:

```typescript
<div className="transcript-container">
  {transcriptState.finalText && (
    <span className="final-transcript">{transcriptState.finalText}</span>
  )}
  {transcriptState.isStreaming && transcriptState.partialText && (
    <span className="partial-transcript text-gray-500">
      {transcriptState.partialText}
    </span>
  )}
</div>
```

## Testing Checklist

### 7. Local Testing

- [ ] Start development server: `npm run dev`
- [ ] Navigate to session page
- [ ] Click record button
- [ ] Verify microphone permission prompt appears
- [ ] Grant microphone permission
- [ ] Speak into microphone
- [ ] Verify partial transcripts appear in gray text (real-time)
- [ ] Stop recording
- [ ] Verify final transcript appears in black text
- [ ] Verify AI response is generated
- [ ] Verify AI audio plays

### 8. Error Handling Testing

- [ ] Test with microphone permission denied
  - Expected: Error message "Trình duyệt không cho phép truy cập microphone."
- [ ] Test with no internet connection
  - Expected: Error message "Connection failed. Please try again."
- [ ] Test with unclear speech
  - Expected: Low confidence warning or retry prompt

### 9. Browser Compatibility Testing

- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)

### 10. Performance Testing

- [ ] Record 5-second audio
  - Expected: Partial transcripts appear within 1 second
- [ ] Record 30-second audio
  - Expected: No timeout, smooth streaming
- [ ] Record with background noise
  - Expected: Reasonable transcription accuracy

## Monitoring Checklist

### 11. CloudWatch Metrics

Check CloudWatch metrics after deployment:

```bash
aws cloudwatch get-metric-statistics \
  --namespace Lexi/Transcription \
  --metric-name TranscriptConfidence \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --region ap-southeast-1
```

**Expected Metrics:**
- `TranscriptConfidence`: Average > 0.8
- `TranscriptLength`: Varies by recording
- `StreamErrors`: Should be 0 or very low

### 12. Lambda Logs

Check Lambda logs for `submit_transcript` handler:

```bash
aws logs tail /aws/lambda/lexi-be-SpeakingWebSocketFunction-XXXXX \
  --follow \
  --region ap-southeast-1
```

**Expected Log Entries:**
- "Client-side streaming transcription completed"
- "mode": "client-side-streaming"
- No errors or exceptions

## Rollback Plan

If issues are encountered:

### Option 1: Disable Feature Flag

```env
# In lexi-fe/.env.local
NEXT_PUBLIC_USE_STREAMING=false
```

This will revert to batch transcription without code changes.

### Option 2: Rollback CloudFormation Stack

```bash
aws cloudformation rollback-stack \
  --stack-name lexi-be \
  --region ap-southeast-1
```

## Success Criteria

- [x] CloudFormation stack deployed successfully
- [ ] Identity Pool ID retrieved and configured
- [ ] Frontend dependencies installed
- [ ] Partial transcripts appear in real-time
- [ ] Final transcripts trigger AI response
- [ ] No errors in CloudWatch logs
- [ ] Transcription accuracy > 80%
- [ ] User feedback positive

## Post-Deployment

### Monitor for 24 Hours

- Check CloudWatch metrics every 4 hours
- Review Lambda logs for errors
- Monitor user feedback
- Compare accuracy with batch transcription

### Gradual Rollout (Optional)

If testing is successful, consider gradual rollout:

1. **10% of users** (Day 1-3)
   - Monitor metrics closely
   - Collect user feedback
   
2. **50% of users** (Day 4-7)
   - Continue monitoring
   - Compare with batch transcription
   
3. **100% of users** (Day 8+)
   - Full rollout
   - Plan to remove batch code (Phase 3)

## Support

For issues or questions:
- See `STREAMING_IMPLEMENTATION_GUIDE.md` for troubleshooting
- See `IMPLEMENTATION_SUMMARY.md` for architecture details
- Check CloudWatch logs for errors
- Review AWS Transcribe documentation

## Next Phase

After successful deployment and testing:
- Plan Phase 3: Remove batch transcription code
- Update documentation
- Train team on new architecture
- Celebrate! 🎉
