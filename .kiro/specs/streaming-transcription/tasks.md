# Implementation Plan: Streaming Transcription (Client-Side)

## Overview

This implementation migrates from batch Amazon Transcribe to **client-side streaming** for real-time audio transcription. After thorough AWS documentation research, we discovered that Lambda WebSocket handlers **cannot** maintain persistent Transcribe streams because each WebSocket message triggers a separate Lambda invocation (stateless).

**Solution**: Frontend connects **directly** to Amazon Transcribe Streaming API using AWS SDK for JavaScript v3 with Cognito temporary credentials.

## Tasks

- [ ] 1. Infrastructure: Create Cognito Identity Pool
  - [ ] 1.1 Add Cognito Identity Pool to CloudFormation template
    - Create Identity Pool with `AllowUnauthenticatedIdentities: false`
    - Link to existing Cognito User Pool
    - _Requirements: 8.1, 8.2_
  
  - [ ] 1.2 Create IAM Role for authenticated Cognito users
    - Create role with `AssumeRoleWithWebIdentity` trust policy
    - Add policy with `transcribe:StartStreamTranscription` permission
    - Attach role to Identity Pool
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 1.3 Deploy CloudFormation stack
    - Deploy updated template
    - Verify Identity Pool created
    - Verify IAM role attached
    - _Requirements: 8.1, 8.2_
  
  - [ ] 1.4 Update frontend environment variables
    - Add `NEXT_PUBLIC_IDENTITY_POOL_ID`
    - Add `NEXT_PUBLIC_AWS_REGION`
    - _Requirements: 8.1_

- [ ] 2. Frontend: Install AWS SDK dependencies
  - Add `@aws-sdk/client-transcribe-streaming` to package.json
  - Add `@aws-sdk/client-cognito-identity` to package.json
  - Add `@aws-sdk/credential-providers` to package.json
  - Verify packages install correctly
  - _Requirements: 1.1, 1.2_

- [ ] 3. Frontend: Implement Transcribe Streaming Client
  - [ ] 3.1 Create `use-transcribe-streaming.ts` hook
    - Initialize TranscribeStreamingClient with Cognito credentials
    - Implement `startStream()` to begin streaming session
    - Implement `sendAudioChunk()` to forward audio bytes
    - Implement `closeStream()` to end session
    - Handle transcript events (partial and final)
    - _Requirements: 1.1, 1.2, 1.4, 2.2, 4.1, 4.2_
  
  - [ ] 3.2 Implement credential management
    - Get Cognito ID token from auth context
    - Create credentials using `fromCognitoIdentityPool`
    - Handle credential refresh automatically
    - _Requirements: 8.1, 8.2_
  
  - [ ] 3.3 Implement error handling
    - Handle ThrottlingException (rate limit)
    - Handle BadRequestException (invalid audio)
    - Handle UnrecognizedClientException (expired credentials)
    - Emit error events to UI
    - _Requirements: 7.1, 7.2, 7.5_

- [ ] 4. Frontend: Update Audio Recorder
  - [ ] 4.1 Modify `use-audio-recorder.ts` to stream chunks
    - Configure MediaRecorder with `mimeType: "audio/webm;codecs=opus"`
    - Set `audioBitsPerSecond: 16000`
    - Set `recorder.start(250)` for 250ms chunks
    - Configure getUserMedia with `sampleRate: 16000`, `channelCount: 1`
    - _Requirements: 2.1, 2.2, 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 4.2 Send chunks to Transcribe client (not WebSocket)
    - In `ondataavailable`, call `transcribeClient.sendAudioChunk(blob)`
    - Remove S3 upload logic
    - Remove WebSocket AUDIO_CHUNK sending
    - _Requirements: 2.2, 2.3, 6.1, 6.2_
  
  - [ ] 4.3 Handle recording lifecycle
    - On start: call `transcribeClient.startStream()`
    - On stop: call `transcribeClient.closeStream()`
    - Get final transcript from close event
    - _Requirements: 1.5, 2.5, 3.4_

- [ ] 5. Frontend: Update Transcript Display
  - [ ] 5.1 Handle partial transcripts
    - Listen to partial transcript events from Transcribe client
    - Display partial text in gray
    - Update UI smoothly without flickering
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 5.2 Handle final transcripts
    - Listen to final transcript events
    - Display final text in black
    - Replace partial text with final text
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 5.3 Handle errors
    - Display error messages from Transcribe client
    - Show "Connection failed" for network errors
    - Show "Could not understand" for low confidence
    - Provide retry button
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [ ] 6. Frontend: Submit Final Transcript to Backend
  - [ ] 6.1 Add SUBMIT_TRANSCRIPT WebSocket action
    - Send final transcript text and confidence to backend
    - Include session_id in message
    - _Requirements: 5.1, 5.2_
  
  - [ ] 6.2 Handle backend response
    - Listen for TURN_SAVED event
    - Listen for AI_TEXT_CHUNK event
    - Listen for AI_AUDIO_URL event
    - Listen for STT_LOW_CONFIDENCE event
    - _Requirements: 5.3, 5.4, 5.5, 7.4_

- [ ] 7. Backend: Add SUBMIT_TRANSCRIPT Handler
  - [ ] 7.1 Implement `submit_transcript()` in WebSocket controller
    - Accept transcript text and confidence from frontend
    - Validate confidence >= 0.5
    - Call existing SubmitSpeakingTurnUseCase
    - Send TURN_SAVED, AI_TEXT_CHUNK, AI_AUDIO_URL events
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 7.2 Add route mapping for SUBMIT_TRANSCRIPT
    - Map SUBMIT_TRANSCRIPT action to submit_transcript()
    - Keep existing actions for backward compatibility
    - _Requirements: 9.1, 9.2_
  
  - [ ] 7.3 Remove streaming-related code (not needed)
    - Do NOT add StreamingSTTService (client handles streaming)
    - Do NOT add START_STREAMING handler
    - Do NOT add AUDIO_CHUNK handler
    - Do NOT add END_STREAMING handler
    - _Requirements: 6.2, 6.3_

- [ ] 8. Frontend: Add Feature Flag
  - Add `NEXT_PUBLIC_USE_STREAMING` environment variable
  - Implement conditional logic: streaming vs batch
  - Default to false (batch) for safety
  - _Requirements: 9.1, 9.4_

- [ ] 9. Checkpoint - End-to-end streaming flow working
  - Test complete flow: start recording → speak → see partial transcripts → stop → see final transcript → AI responds
  - Verify partial transcripts appear in gray during recording
  - Verify final transcript appears in black after stopping
  - Verify AI response pipeline triggers correctly
  - Test on desktop and mobile browsers
  - Ask user if questions arise

- [ ] 10. Frontend: Handle Network Errors
  - [ ] 10.1 Add Transcribe connection error handling
    - Display "Connection failed. Please try again."
    - Allow user to retry recording
    - _Requirements: 7.1, 7.5_
  
  - [ ] 10.2 Add microphone permission error handling
    - Display "Microphone access required" when permission denied
    - _Requirements: 7.1_
  
  - [ ] 10.3 Add low confidence handling
    - Display "Could not understand. Please try again." for confidence < 0.5
    - _Requirements: 7.4_
  
  - [ ] 10.4 Add credential refresh handling
    - Monitor for UnrecognizedClientException
    - Refresh credentials automatically
    - Retry streaming after refresh
    - _Requirements: 7.1, 7.2_

- [ ] 11. Backend: Add CloudWatch Metrics
  - Log streaming session metrics (duration, confidence)
  - Add CloudWatch metrics for TranscriptConfidence, TranscriptLength
  - Log which transcription mode is used (streaming vs batch)
  - _Requirements: 9.5_

- [ ] 12. Manual Testing Checklist
  - Test 5-second recording with partial transcripts
  - Test 30-second recording
  - Test with background noise
  - Test with unclear speech (low confidence)
  - Test credential refresh (wait > 1 hour)
  - Test on iOS Safari and Android Chrome
  - Compare accuracy with batch transcription
  - _Requirements: All_

- [ ] 13. Phase 3: Remove Deprecated Batch Code (after 100% rollout)
  - [ ] 13.1 Remove batch Transcribe code from backend
    - Remove `TranscribeSTTService` class (batch implementation)
    - Remove START_SESSION presigned URL generation for transcription
    - Remove AUDIO_UPLOADED WebSocket action handler
    - _Requirements: 6.2, 6.3, 9.3_
  
  - [ ] 13.2 Remove batch IAM permissions from Lambda
    - Remove `transcribe:StartTranscriptionJob` permission
    - Remove `transcribe:GetTranscriptionJob` permission
    - Remove `transcribe:DeleteTranscriptionJob` permission
    - Keep Cognito role with `transcribe:StartStreamTranscription`
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ] 13.3 Remove S3 upload logic from frontend (if not needed)
    - Remove presigned URL request code
    - Remove S3 upload implementation
    - _Requirements: 6.1, 6.4_

- [ ] 14. Final Checkpoint - Migration Complete
  - Verify all users on streaming transcription
  - Verify no batch Transcribe API calls in CloudWatch logs
  - Verify reduced Lambda execution time
  - Ensure all tests pass
  - Ask user if questions arise

## Notes

- **CRITICAL**: Lambda WebSocket handlers are stateless - each message is a separate invocation. They CANNOT maintain persistent Transcribe streams.
- **Solution**: Client-side streaming with direct Transcribe API connection using AWS SDK for JavaScript v3
- **AWS Documentation Sources**:
  - [Lambda execution environment](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)
  - [API Gateway WebSocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-overview.html)
  - [Transcribe Streaming](https://docs.aws.amazon.com/transcribe/latest/dg/streaming.html)
- Phase 1-2 maintain backward compatibility with batch flow
- Phase 3 removes deprecated code after 100% streaming rollout
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Frontend uses TypeScript with AWS SDK v3, backend uses Python
- Audio format: 16kHz, mono, Opus encoding (Transcribe requirement)
- Streaming eliminates polling timeouts and provides real-time feedback
- No backend streaming code needed - all streaming logic in frontend
