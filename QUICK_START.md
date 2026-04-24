# Quick Start: Client-Side Streaming Transcription

## TL;DR

Client-side streaming transcription is now implemented. Frontend connects directly to Amazon Transcribe API for real-time speech-to-text.

## 3-Step Setup

### 1. Deploy Backend (5 minutes)

```bash
cd lexi-be
./deploy-streaming.sh
# Enter your S3 bucket name when prompted
# Copy the Identity Pool ID from the output
```

### 2. Configure Frontend (1 minute)

Edit `lexi-fe/.env.local`:
```env
NEXT_PUBLIC_IDENTITY_POOL_ID=<paste-identity-pool-id-here>
```

### 3. Install & Test (2 minutes)

```bash
cd lexi-fe
npm install
npm run dev
```

Navigate to a session, click record, and speak. You should see:
- Gray text appearing as you speak (partial transcripts)
- Black text when you stop (final transcript)
- AI response generated

## Architecture in 30 Seconds

**Old Way (Batch):**
```
Frontend → S3 → Lambda → Transcribe (batch job with polling)
Problem: Timeouts, no real-time feedback
```

**New Way (Streaming):**
```
Frontend → Transcribe API (direct HTTP/2 connection)
Result: Real-time transcripts, no timeouts
```

## Key Files

**Backend:**
- `lexi-be/config/auth.yaml` - Cognito Identity Pool
- `lexi-be/src/infrastructure/handlers/websocket_handler.py` - submit_transcript handler

**Frontend:**
- `lexi-fe/features/session/hooks/use-transcribe-streaming.ts` - Transcribe client
- `lexi-fe/features/session/hooks/use-client-streaming-recorder.ts` - Audio recorder

## Usage Example

```typescript
import { useClientStreamingRecorder } from "@/features/session/hooks/use-client-streaming-recorder";

const [transcript, setTranscript] = useState({ final: "", partial: "" });

const recorder = useClientStreamingRecorder({
  ws,
  sessionId,
  onPartialTranscript: (text) => setTranscript(prev => ({ ...prev, partial: text })),
  onFinalTranscript: (text) => setTranscript(prev => ({ final: text, partial: "" })),
  onError: (msg) => console.error(msg),
});

// Display
<div>
  <span>{transcript.final}</span>
  <span className="text-gray-500">{transcript.partial}</span>
</div>
```

## Troubleshooting

**"No ID token available"**
→ User not logged in. Ensure authentication before recording.

**"Missing AWS configuration"**
→ Check `.env.local` has `NEXT_PUBLIC_IDENTITY_POOL_ID`

**No partial transcripts**
→ Check browser console for errors. Verify audio format is `audio/webm;codecs=opus`

## Feature Flag

Control streaming with environment variable:

```env
# Enable streaming (default)
NEXT_PUBLIC_USE_STREAMING=true

# Disable (use batch)
NEXT_PUBLIC_USE_STREAMING=false
```

## What's Different?

| Aspect | Batch (Old) | Streaming (New) |
|--------|-------------|-----------------|
| Feedback | After recording | Real-time |
| Latency | 5-10 seconds | 500ms-1s |
| Timeout Risk | High (29s limit) | None |
| Backend Complexity | High (polling) | Low (just final transcript) |
| User Experience | Wait and see | Live captions |

## Security

- Temporary AWS credentials from Cognito (1-hour expiry)
- Only `transcribe:StartStreamTranscription` permission
- No AWS keys in frontend code
- Automatic credential refresh

## Next Steps

1. ✅ Deploy and test locally
2. 📊 Monitor CloudWatch metrics
3. 👥 Gradual rollout (10% → 50% → 100%)
4. 🧹 Remove batch code (Phase 3)

## Documentation

- **Full Guide**: `STREAMING_IMPLEMENTATION_GUIDE.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Spec**: `.kiro/specs/streaming-transcription/design.md`

## Support

Questions? Check:
1. Implementation guide (troubleshooting section)
2. CloudWatch logs
3. Browser console
4. AWS Transcribe documentation

---

**Ready to deploy?** Run `./deploy-streaming.sh` in `lexi-be` directory.
