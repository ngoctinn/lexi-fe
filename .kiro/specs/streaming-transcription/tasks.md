# Implementation Plan: Streaming Transcription

## Overview

This implementation migrates from batch Amazon Transcribe (with polling timeouts) to streaming Amazon Transcribe for real-time audio transcription. The approach follows a phased migration strategy: first add streaming support alongside existing batch flow, then gradually roll out, and finally remove deprecated batch code.

## Tasks

- [x] 1. Backend: Add amazon-transcribe-streaming-sdk dependency
  - Add `amazon-transcribe-streaming-sdk==0.6.2` to `lexi-be/requirements.txt`
  - Verify package installation works in Lambda environment
  - _Requirements: 1.1, 1.2_

- [-] 2. Backend: Implement StreamingSTTService
  - [ ] 2.1 Create `lexi-be/src/services/streaming_stt_service.py` with core streaming logic
    - Implement `start_stream()` to initialize Transcribe streaming session
    - Implement `send_audio_chunk()` to forward audio bytes to stream
    - Implement `get_transcripts()` to retrieve partial/final transcripts from buffer
    - Implement `close_stream()` to gracefully close stream and return final transcript
    - Use `amazon-transcribe-streaming-sdk` with async event handler pattern
    - Configure for en-US, 16kHz, opus encoding
    - _Requirements: 1.1, 1.2, 1.4, 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 2.2 Write unit tests for StreamingSTTService
    - Test stream lifecycle (start → send chunks → close)
    - Test transcript buffering and retrieval
    - Test error handling in event handler
    - _Requirements: 1.1, 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Backend: Extend Session entity with transcribe_stream_id
  - Add `transcribe_stream_id: Optional[str]` field to Session dataclass
  - Add `last_audio_timestamp: float` field for timeout tracking
  - Update session repository to persist new fields
  - _Requirements: 3.2, 7.3_

- [ ] 4. Backend: Add WebSocket handlers for streaming actions
  - [ ] 4.1 Implement `start_streaming()` handler in WebSocket controller
    - Initialize StreamingSTTService stream
    - Store stream_id in session
    - Send STREAMING_READY event to frontend
    - _Requirements: 2.5, 3.3, 4.1_
  
  - [ ] 4.2 Implement `audio_chunk()` handler in WebSocket controller
    - Forward audio bytes to StreamingSTTService
    - Retrieve and send partial/final transcripts to frontend
    - Update last_audio_timestamp for timeout tracking
    - Check for 15-second timeout and close stream if exceeded
    - _Requirements: 2.2, 3.1, 4.1, 4.2, 7.3_
  
  - [ ] 4.3 Implement `end_streaming()` handler in WebSocket controller
    - Close Transcribe stream via StreamingSTTService
    - Send FINAL_TRANSCRIPT event to frontend
    - Trigger existing LLM pipeline (SubmitSpeakingTurnUseCase)
    - Send AI response events (TURN_SAVED, AI_TEXT_CHUNK, AI_AUDIO_URL)
    - _Requirements: 1.5, 3.4, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 4.4 Add route mapping for new actions in `websocket_handler.py`
    - Map START_STREAMING → start_streaming()
    - Map AUDIO_CHUNK → audio_chunk()
    - Map END_STREAMING → end_streaming()
    - Keep existing actions (START_SESSION, AUDIO_UPLOADED) for backward compatibility
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 4.5 Write integration tests for WebSocket streaming flow
    - Test complete flow: START_STREAMING → AUDIO_CHUNK (multiple) → END_STREAMING
    - Verify partial transcripts are sent during streaming
    - Verify final transcript triggers LLM pipeline
    - Test error scenarios (connection drop, stream timeout, Transcribe error)
    - _Requirements: 1.1, 2.2, 3.1, 4.1, 4.2, 5.1, 7.1, 7.2, 7.3_

- [ ] 5. Backend: Update IAM permissions in template.yaml
  - Add `transcribe:StartStreamTranscription` permission to Lambda role
  - Keep existing batch permissions during migration (StartTranscriptionJob, GetTranscriptionJob, DeleteTranscriptionJob)
  - Document that batch permissions will be removed in Phase 3
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.2_

- [ ] 6. Checkpoint - Backend streaming infrastructure complete
  - Ensure all backend tests pass
  - Verify StreamingSTTService can initialize and close streams
  - Verify WebSocket handlers route correctly
  - Ask user if questions arise

- [ ] 7. Frontend: Modify Audio Recorder to send chunks in real-time
  - [ ] 7.1 Update `use-audio-recorder.ts` to capture 250ms audio chunks
    - Configure MediaRecorder with `mimeType: "audio/webm;codecs=opus"` and `audioBitsPerSecond: 16000`
    - Set `recorder.start(250)` for 250ms chunk intervals
    - Configure getUserMedia with `sampleRate: 16000`, `channelCount: 1`, `echoCancellation: true`, `noiseSuppression: true`
    - _Requirements: 2.1, 2.2, 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 7.2 Implement real-time chunk sending via WebSocket
    - In `ondataavailable` handler, convert Blob to ArrayBuffer
    - Send AUDIO_CHUNK message immediately (don't wait for recording to complete)
    - Serialize audio bytes as array for JSON transmission
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ] 7.3 Remove S3 upload logic from Audio Recorder
    - Remove presigned URL upload code
    - Remove AUDIO_UPLOADED message sending
    - Keep audio blob for optional post-transcription storage
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8. Frontend: Add WebSocket client handlers for streaming events
  - [ ] 8.1 Add outgoing event types (START_STREAMING, AUDIO_CHUNK, END_STREAMING)
    - Define TypeScript types for new WebSocket messages
    - Implement `sendAudioChunk()` helper to serialize Blob to byte array
    - _Requirements: 2.2, 2.5_
  
  - [ ] 8.2 Add incoming event handlers (STREAMING_READY, PARTIAL_TRANSCRIPT, FINAL_TRANSCRIPT, STT_ERROR)
    - Handle STREAMING_READY to confirm stream initialization
    - Handle PARTIAL_TRANSCRIPT to update UI with gray text
    - Handle FINAL_TRANSCRIPT to update UI with black text
    - Handle STT_ERROR to display error message
    - _Requirements: 4.1, 4.2, 4.3, 7.2, 7.4_

- [ ] 9. Frontend: Update transcript display UI
  - [ ] 9.1 Create TranscriptState interface with finalText, partialText, isStreaming
    - Add state management for partial vs final transcripts
    - _Requirements: 4.3, 4.4_
  
  - [ ] 9.2 Implement UI rendering with gray partial text and black final text
    - Display finalText in black
    - Display partialText in gray when isStreaming is true
    - Ensure smooth updates without flickering
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [ ] 9.3 Add error message display for STT_ERROR events
    - Show user-friendly error messages
    - Provide retry button after errors
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [ ] 10. Frontend: Add feature flag for gradual rollout
  - Add `NEXT_PUBLIC_USE_STREAMING` environment variable
  - Implement conditional logic to use streaming vs batch flow
  - Default to false (batch) for safety during initial deployment
  - _Requirements: 9.1, 9.4_

- [ ] 11. Checkpoint - End-to-end streaming flow working
  - Test complete flow: start recording → speak → see partial transcripts → stop → see final transcript → AI responds
  - Verify partial transcripts appear in gray during recording
  - Verify final transcript appears in black after stopping
  - Verify AI response pipeline triggers correctly
  - Test on desktop and mobile browsers
  - Ask user if questions arise

- [ ] 12. Frontend: Handle network errors gracefully
  - [ ] 12.1 Add WebSocket disconnect detection during streaming
    - Display "Connection lost. Please try again." message
    - Allow user to retry recording
    - _Requirements: 7.1, 7.5_
  
  - [ ] 12.2 Add microphone permission error handling
    - Display "Microphone access required" when permission denied
    - _Requirements: 7.1_
  
  - [ ] 12.3 Add low confidence transcript handling
    - Display "Could not understand. Please try again." for STT_LOW_CONFIDENCE events
    - _Requirements: 7.4_

- [ ] 13. Backend: Add CloudWatch metrics and logging
  - Log streaming session metrics (duration, chunk_count, confidence)
  - Add CloudWatch metrics for StreamingLatency, TranscriptConfidence, StreamErrors
  - Log which transcription mode is used (streaming vs batch) for monitoring
  - _Requirements: 9.5_

- [ ]* 14. Manual testing checklist
  - Test 5-second recording with partial transcripts
  - Test 30-second recording without timeout
  - Test with background noise
  - Test with unclear speech (low confidence)
  - Test WebSocket reconnection
  - Test on iOS Safari and Android Chrome
  - Compare accuracy with batch transcription
  - _Requirements: All_

- [ ] 15. Phase 3: Remove deprecated batch transcription code (after 100% rollout)
  - [ ] 15.1 Remove batch Transcribe code from backend
    - Remove `TranscribeSTTService` class (batch implementation)
    - Remove START_SESSION presigned URL generation for transcription
    - Remove AUDIO_UPLOADED WebSocket action handler
    - _Requirements: 6.2, 6.3, 9.3_
  
  - [ ] 15.2 Remove batch IAM permissions from template.yaml
    - Remove `transcribe:StartTranscriptionJob` permission
    - Remove `transcribe:GetTranscriptionJob` permission
    - Remove `transcribe:DeleteTranscriptionJob` permission
    - Keep only `transcribe:StartStreamTranscription`
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ] 15.3 Remove S3 upload logic from frontend (if not needed for analytics)
    - Remove presigned URL request code
    - Remove S3 upload implementation
    - _Requirements: 6.1, 6.4_

- [ ] 16. Final checkpoint - Migration complete
  - Verify all users on streaming transcription
  - Verify no batch Transcribe API calls in CloudWatch logs
  - Verify reduced Lambda execution time
  - Ensure all tests pass
  - Ask user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Phase 1-2 (tasks 1-14) maintain backward compatibility with batch flow
- Phase 3 (task 15) removes deprecated code after 100% streaming rollout
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Frontend uses TypeScript, backend uses Python (as specified in design)
- Audio format: 16kHz, mono, Opus encoding (Transcribe requirement)
- Streaming eliminates polling timeouts and provides real-time feedback
