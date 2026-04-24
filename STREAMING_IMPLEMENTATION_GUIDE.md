# Streaming Transcription Implementation Guide

## Overview

This guide explains how to complete the implementation of client-side streaming transcription using Amazon Transcribe.

## Architecture

**Client-Side Streaming**: Frontend connects directly to Amazon Transcribe Streaming API using AWS SDK for JavaScript v3 with Cognito temporary credentials.

```
Frontend → Transcribe API (direct HTTP/2 connection)
Frontend → WebSocket → Lambda (only for final transcript)
```

## Implementation Status

### ✅ Completed

1. **Infrastructure**
   - Added Cognito Identity Pool to `lexi-be/config/auth.yaml`
   - Added IAM Role for authenticated users with `transcribe:StartStreamTranscription` permission
   - Updated `lexi-be/template.yaml` to output Identity Pool ID

2. **Backend**
   - Added `submit_transcript()` handler in `websocket_handler.py`
   - Added route mapping for `SUBMIT_TRANSCRIPT` action
   - Added CloudWatch metrics logging

3. **Frontend Dependencies**
   - Added AWS SDK packages to `package.json`:
     - `@aws-sdk/client-transcribe-streaming`
     - `@aws-sdk/client-cognito-identity`
     - `@aws-sdk/credential-providers`

4. **Frontend Hooks**
   - Created `use-transcribe-streaming.ts` - Direct Transcribe API client
   - Created `use-client-streaming-recorder.ts` - Audio recorder with client-side streaming
   - Updated `session.types.ts` with `SUBMIT_TRANSCRIPT` event

5. **Environment Variables**
   - Added `NEXT_PUBLIC_IDENTITY_POOL_ID` placeholder to `.env.local`
   - Added `NEXT_PUBLIC_USER_POOL_ID` to `.env.local`

### 🔄 Next Steps

#### Step 1: Deploy CloudFormation Stack

```bash
cd lexi-be

# Build and package
sam build
sam package --output-template-file packaged.yaml --s3-bucket YOUR_BUCKET

# Deploy
sam deploy --template-file packaged.yaml \
  --stack-name lexi-be \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --region ap-southeast-1
```

After deployment, get the Identity Pool ID:

```bash
aws cloudformation describe-stacks \
  --stack-name lexi-be-AuthModule-XXXXX \
  --query 'Stacks[0].Outputs[?OutputKey==`IdentityPoolId`].OutputValue' \
  --output text
```

Update `lexi-fe/.env.local`:
```env
NEXT_PUBLIC_IDENTITY_POOL_ID=ap-southeast-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

#### Step 2: Install Frontend Dependencies

```bash
cd lexi-fe
npm install
```

This will install:
- `@aws-sdk/client-transcribe-streaming@^3.712.0`
- `@aws-sdk/client-cognito-identity@^3.712.0`
- `@aws-sdk/credential-providers@^3.712.0`

#### Step 3: Integrate Client-Side Streaming

Update your session component to use the new `useClientStreamingRecorder` hook:

```typescript
import { useClientStreamingRecorder } from "@/features/session/hooks/use-client-streaming-recorder";

// In your component:
const [transcriptState, setTranscriptState] = useState({
  finalText: "",
  partialText: "",
  isStreaming: false,
});

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
    // Show error to user
  },
});

// Display transcripts
<div className="transcript">
  <span className="final">{transcriptState.finalText}</span>
  {transcriptState.isStreaming && (
    <span className="partial text-gray-500">{transcriptState.partialText}</span>
  )}
</div>
```

#### Step 4: Feature Flag

The feature is controlled by `NEXT_PUBLIC_USE_STREAMING` environment variable:

```env
# Enable client-side streaming
NEXT_PUBLIC_USE_STREAMING=true

# Disable (use batch transcription)
NEXT_PUBLIC_USE_STREAMING=false
```

Implement conditional logic in your component:

```typescript
const useStreaming = process.env.NEXT_PUBLIC_USE_STREAMING === "true";

const recorder = useStreaming
  ? useClientStreamingRecorder({ ... })
  : useStreamingAudioRecorder({ ... }); // Old implementation
```

#### Step 5: Testing

1. **Test Microphone Permission**
   - Browser should request microphone access
   - Verify error message if permission denied

2. **Test Partial Transcripts**
   - Start recording and speak
   - Verify partial transcripts appear in gray text in real-time
   - Verify text updates as you speak

3. **Test Final Transcript**
   - Stop recording
   - Verify final transcript appears in black text
   - Verify AI response is generated

4. **Test Error Handling**
   - Test with no internet connection
   - Test with invalid credentials
   - Verify error messages are user-friendly

5. **Test on Mobile**
   - iOS Safari
   - Android Chrome
   - Verify audio quality and transcription accuracy

#### Step 6: Monitor CloudWatch Metrics

After deployment, monitor these metrics in CloudWatch:

- `Lexi/Transcription/TranscriptConfidence` - Average confidence scores
- `Lexi/Transcription/TranscriptLength` - Transcript lengths
- Lambda execution logs for `submit_transcript` handler

## Troubleshooting

### Issue: "No ID token available"

**Cause**: User not authenticated or session expired

**Solution**: Ensure user is logged in via Cognito before starting recording

### Issue: "Missing AWS configuration"

**Cause**: Environment variables not set

**Solution**: Verify `.env.local` has:
- `NEXT_PUBLIC_IDENTITY_POOL_ID`
- `NEXT_PUBLIC_USER_POOL_ID`
- `NEXT_PUBLIC_AWS_REGION`

### Issue: "UnrecognizedClientException"

**Cause**: Invalid or expired Cognito credentials

**Solution**: 
1. Check Identity Pool is correctly configured
2. Verify IAM role has `transcribe:StartStreamTranscription` permission
3. Check Cognito User Pool is linked to Identity Pool

### Issue: "ThrottlingException"

**Cause**: Too many concurrent Transcribe streams

**Solution**: 
1. Implement exponential backoff retry
2. Check AWS service quotas for Transcribe Streaming
3. Request quota increase if needed

### Issue: No partial transcripts appearing

**Cause**: Audio format or streaming issue

**Solution**:
1. Verify MediaRecorder is using `audio/webm;codecs=opus`
2. Check browser console for errors
3. Verify audio chunks are being sent (check network tab)
4. Test with different browsers

## Architecture Benefits

1. **No Lambda Timeout**: Browser maintains persistent connection, not Lambda
2. **Lower Latency**: Direct connection to Transcribe (no Lambda hop)
3. **Simpler Backend**: No streaming logic in Lambda
4. **Scalable**: Transcribe handles connection management
5. **Real-time Feedback**: Users see transcription as they speak

## Security Considerations

1. **Temporary Credentials**: Cognito provides temporary AWS credentials (expire after 1 hour)
2. **Least Privilege**: IAM role only has `transcribe:StartStreamTranscription` permission
3. **No Long-term Credentials**: No AWS access keys in frontend code
4. **Automatic Refresh**: AWS SDK handles credential refresh automatically

## Migration Path

### Phase 1: Parallel Mode (Current)
- Both streaming and batch transcription available
- Feature flag controls which mode is used
- Allows gradual rollout and testing

### Phase 2: Gradual Rollout
- Enable streaming for 10% of users
- Monitor metrics (latency, accuracy, errors)
- Increase to 50%, then 100%

### Phase 3: Remove Batch Code
- Remove `TranscribeSTTService` (batch implementation)
- Remove `START_SESSION` presigned URL generation
- Remove `AUDIO_UPLOADED` handler
- Remove batch IAM permissions from Lambda

## References

- [AWS Transcribe Streaming Documentation](https://docs.aws.amazon.com/transcribe/latest/dg/streaming.html)
- [AWS SDK for JavaScript v3 - Transcribe Streaming](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/transcribe-streaming/)
- [Cognito Identity Pools Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html)
- [Design Document](./lexi-fe/.kiro/specs/streaming-transcription/design.md)
- [Tasks Document](./lexi-fe/.kiro/specs/streaming-transcription/tasks.md)
