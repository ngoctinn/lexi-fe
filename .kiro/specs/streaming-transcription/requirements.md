# Requirements Document

## Introduction

This feature migrates the speaking practice pipeline from batch Amazon Transcribe (with polling timeout issues) to streaming Amazon Transcribe for real-time audio transcription. The current implementation uploads complete audio files to S3, then polls batch Transcribe jobs which timeout at 30 seconds while Lambda has a 29-second limit. The new implementation will stream audio chunks in real-time via WebSocket, eliminating polling and providing immediate partial transcripts as the user speaks.

## Glossary

- **Frontend**: The Next.js web application (lexi-fe) that captures user audio and displays transcripts
- **Backend**: The AWS Lambda WebSocket handler (lexi-be) that processes audio and manages conversations
- **Transcribe_Service**: The AWS service that converts speech to text (batch or streaming)
- **Audio_Recorder**: Frontend component that captures microphone input
- **WebSocket_Handler**: Backend Lambda function that manages WebSocket connections
- **Partial_Transcript**: Intermediate transcription result that updates as user speaks (displayed in gray)
- **Final_Transcript**: Completed transcription result for a speech segment (displayed in black)
- **Audio_Chunk**: A small segment of audio data (typically 250ms) sent in real-time
- **LLM_Pipeline**: The conversation generation pipeline (Bedrock + Polly) that runs after transcription completes

## Requirements

### Requirement 1: Replace Batch Transcribe with Streaming API

**User Story:** As a backend developer, I want to use Amazon Transcribe Streaming API instead of batch jobs, so that transcription happens in real-time without polling timeouts.

#### Acceptance Criteria

1. THE Backend SHALL use Amazon Transcribe StartStreamTranscription API instead of StartTranscriptionJob
2. WHEN audio chunks are received via WebSocket, THE Backend SHALL stream them to Transcribe in real-time
3. THE Backend SHALL NOT poll GetTranscriptionJob or use S3 for transcription input
4. THE Backend SHALL maintain a persistent streaming connection to Transcribe during recording
5. WHEN the audio stream ends, THE Backend SHALL close the Transcribe stream gracefully

### Requirement 2: Frontend Sends Audio Chunks in Real-Time

**User Story:** As a user, I want my speech to be transcribed as I speak, so that I see immediate feedback like in Google Meet captions.

#### Acceptance Criteria

1. WHEN recording starts, THE Audio_Recorder SHALL capture audio in chunks of 250ms or less
2. WHEN an audio chunk is captured, THE Frontend SHALL send it immediately via WebSocket
3. THE Frontend SHALL NOT wait for recording to complete before sending audio data
4. THE Frontend SHALL send audio chunks in a format compatible with Transcribe Streaming (PCM or Opus)
5. WHEN recording stops, THE Frontend SHALL send a final message indicating stream end

### Requirement 3: Backend Streams Audio to Transcribe

**User Story:** As a backend developer, I want to forward audio chunks to Transcribe Streaming API, so that transcription happens continuously.

#### Acceptance Criteria

1. WHEN the Frontend sends an audio chunk via WebSocket, THE WebSocket_Handler SHALL forward it to the active Transcribe stream
2. THE WebSocket_Handler SHALL maintain one Transcribe stream per recording session
3. WHEN a new recording starts, THE WebSocket_Handler SHALL create a new Transcribe stream with language code "en-US"
4. WHEN the recording ends, THE WebSocket_Handler SHALL close the Transcribe stream
5. IF the Transcribe stream fails, THEN THE WebSocket_Handler SHALL send an error event to the Frontend

### Requirement 4: Display Partial and Final Transcripts

**User Story:** As a user, I want to see my words appear in real-time as I speak, so that I know the system is listening and understanding me.

#### Acceptance Criteria

1. WHEN Transcribe returns a partial transcript, THE Backend SHALL send it to the Frontend with event type "PARTIAL_TRANSCRIPT"
2. WHEN Transcribe returns a final transcript, THE Backend SHALL send it to the Frontend with event type "FINAL_TRANSCRIPT"
3. WHEN the Frontend receives a partial transcript, THE Frontend SHALL display it in gray text
4. WHEN the Frontend receives a final transcript, THE Frontend SHALL replace the partial text with black text
5. THE Frontend SHALL append new partial transcripts to existing final transcripts without flickering

### Requirement 5: Trigger LLM Pipeline After Final Transcript

**User Story:** As a user, I want the AI to respond after I finish speaking, so that the conversation flows naturally.

#### Acceptance Criteria

1. WHEN a final transcript is received, THE Backend SHALL pass it to the existing LLM_Pipeline
2. THE Backend SHALL call SubmitSpeakingTurnUseCase with the final transcript text
3. THE Backend SHALL generate AI response using BedrockConversationGenerationService
4. THE Backend SHALL synthesize speech using PollySpeechSynthesisService
5. THE Backend SHALL send AI response events (TURN_SAVED, AI_TEXT_CHUNK, AI_AUDIO_URL) as currently implemented

### Requirement 6: Remove S3 Upload Dependency for Transcription

**User Story:** As a developer, I want to eliminate S3 upload for transcription, so that the pipeline is faster and simpler.

#### Acceptance Criteria

1. THE Frontend SHALL NOT upload audio to S3 before transcription
2. THE Backend SHALL NOT generate presigned S3 URLs for transcription input
3. THE Backend SHALL NOT call the AUDIO_UPLOADED WebSocket action for transcription
4. WHERE audio storage is needed for analytics, THE Backend SHALL save audio to S3 after transcription completes
5. THE Backend SHALL remove the START_SESSION presigned URL generation for transcription purposes

### Requirement 7: Handle Network Errors Gracefully

**User Story:** As a user, I want clear error messages when transcription fails, so that I know what went wrong and can retry.

#### Acceptance Criteria

1. IF the WebSocket connection drops during streaming, THEN THE Frontend SHALL display "Connection lost. Please try again."
2. IF Transcribe Streaming returns an error, THEN THE Backend SHALL send event "STT_ERROR" with error message
3. IF no audio is detected for 15 seconds during streaming, THEN THE Backend SHALL close the stream and notify the Frontend
4. WHEN an STT_ERROR event is received, THE Frontend SHALL display the error message to the user
5. THE Frontend SHALL allow the user to retry recording after an error

### Requirement 8: Update IAM Permissions

**User Story:** As a DevOps engineer, I want Lambda to have correct permissions for Transcribe Streaming, so that the service works in production.

#### Acceptance Criteria

1. THE Backend Lambda function SHALL have IAM permission "transcribe:StartStreamTranscription"
2. THE Backend Lambda function SHALL NOT require "transcribe:StartTranscriptionJob" permission
3. THE Backend Lambda function SHALL NOT require "transcribe:GetTranscriptionJob" permission
4. THE Backend Lambda function SHALL NOT require "transcribe:DeleteTranscriptionJob" permission
5. THE template.yaml CloudFormation file SHALL reflect the updated IAM permissions

### Requirement 9: Maintain Backward Compatibility During Migration

**User Story:** As a developer, I want to deploy changes incrementally, so that I can test streaming without breaking existing functionality.

#### Acceptance Criteria

1. WHERE the old AUDIO_UPLOADED action is still used, THE Backend SHALL continue to support it during migration
2. THE Backend SHALL support both streaming and batch transcription modes during transition
3. WHEN streaming is fully tested, THE Backend SHALL remove batch transcription code
4. THE Frontend SHALL feature-flag streaming transcription for gradual rollout
5. THE Backend SHALL log which transcription mode is used for monitoring

### Requirement 10: Optimize Audio Format for Streaming

**User Story:** As a developer, I want to use the optimal audio format for Transcribe Streaming, so that transcription quality is high and bandwidth is low.

#### Acceptance Criteria

1. THE Audio_Recorder SHALL capture audio at 16kHz sample rate (Transcribe requirement)
2. THE Audio_Recorder SHALL use mono channel (single channel) audio
3. THE Audio_Recorder SHALL encode audio as Opus in WebM container or PCM
4. THE Frontend SHALL send audio chunks with correct MIME type header
5. THE Backend SHALL configure Transcribe stream with matching audio format parameters

