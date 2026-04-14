// =============================================================================
// ENUMS
// =============================================================================

export enum SessionStatus {
  SETUP = "SETUP",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  PROCESSING_SCORING = "PROCESSING_SCORING",
  COMPLETED = "COMPLETED",
}

export enum TurnSpeaker {
  USER = "USER",
  AI = "AI",
}

export enum ScoringSkill {
  FLUENCY = "fluency",
  PRONUNCIATION = "pronunciation",
  GRAMMAR = "grammar",
  VOCABULARY = "vocabulary",
}

export enum WsClientEvent {
  START_SESSION = "START_SESSION",
  AUDIO_UPLOADED = "AUDIO_UPLOADED",
  USE_HINT = "USE_HINT",
  SKIP_TURN = "SKIP_TURN",
  END_SESSION = "END_SESSION",
  SEND_MESSAGE = "SEND_MESSAGE",
}

export enum WsServerEvent {
  SESSION_READY = "SESSION_READY",
  STT_RESULT = "STT_RESULT",
  STT_LOW_CONFIDENCE = "STT_LOW_CONFIDENCE",
  AI_TEXT_CHUNK = "AI_TEXT_CHUNK",
  AI_AUDIO_URL = "AI_AUDIO_URL",
  TURN_SAVED = "TURN_SAVED",
  HINT_TEXT = "HINT_TEXT",
  SCORING_COMPLETE = "SCORING_COMPLETE",
  ERROR = "ERROR",
}

// =============================================================================
// DOMAIN ENTITIES
// =============================================================================

export interface Scenario {
  scenario_id: string;
  name: string;
  description: string;
  is_active: boolean;
  usage_count: number;
  /** Optional icon name from lucide-react */
  icon?: string;
}

export interface Turn {
  turn_index: number;
  speaker: TurnSpeaker;
  content: string;
  translated_content?: string | null;
  audio_url?: string | null;
  is_hint_used: boolean;
}

export interface Scoring {
  [ScoringSkill.FLUENCY]: number;
  [ScoringSkill.PRONUNCIATION]: number;
  [ScoringSkill.GRAMMAR]: number;
  [ScoringSkill.VOCABULARY]: number;
  overall: number;
  feedback?: string;
}

export interface Session {
  session_id: string;
  user_id: string;
  scenario_id: string;
  ai_gender: "male" | "female";
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  total_turns: number;
  user_turns: number;
  hint_used_count: number;
  turns?: Turn[];
  scoring?: Scoring | null;
  connection_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// WEBSOCKET EVENT PAYLOADS — Client → Server
// =============================================================================

export interface WsStartSessionPayload {
  action: WsClientEvent.START_SESSION;
  session_id: string;
}

export interface WsAudioUploadedPayload {
  action: WsClientEvent.AUDIO_UPLOADED;
  session_id: string;
  s3_key: string;
}

export interface WsUseHintPayload {
  action: WsClientEvent.USE_HINT;
  session_id: string;
}


export interface WsEndSessionPayload {
  action: WsClientEvent.END_SESSION;
  session_id: string;
}

export interface WsSendMessagePayload {
  action: WsClientEvent.SEND_MESSAGE;
  session_id: string;
  text: string;
}

export type WsClientPayload =
  | WsStartSessionPayload
  | WsAudioUploadedPayload
  | WsUseHintPayload
  | WsEndSessionPayload
  | WsSendMessagePayload;

// =============================================================================
// WEBSOCKET EVENT PAYLOADS — Server → Client
// =============================================================================

export interface WsSessionReadyEvent {
  event: WsServerEvent.SESSION_READY;
  upload_url: string;
}

export interface WsSttResultEvent {
  event: WsServerEvent.STT_RESULT;
  text: string;
  confidence: number;
}

export interface WsSttLowConfidenceEvent {
  event: WsServerEvent.STT_LOW_CONFIDENCE;
  confidence: number;
}

export interface WsAiTextChunkEvent {
  event: WsServerEvent.AI_TEXT_CHUNK;
  chunk: string;
  done: boolean;
}

export interface WsAiAudioUrlEvent {
  event: WsServerEvent.AI_AUDIO_URL;
  url: string;
  text: string;
}

export interface WsTurnSavedEvent {
  event: WsServerEvent.TURN_SAVED;
  turn_index: number;
}

export interface WsHintTextEvent {
  event: WsServerEvent.HINT_TEXT;
  hint: string;
}

export interface WsScoringCompleteEvent {
  event: WsServerEvent.SCORING_COMPLETE;
  session_id: string;
}

export interface WsErrorEvent {
  event: WsServerEvent.ERROR;
  message: string;
  code?: string;
}

export type WsServerPayload =
  | WsSessionReadyEvent
  | WsSttResultEvent
  | WsSttLowConfidenceEvent
  | WsAiTextChunkEvent
  | WsAiAudioUrlEvent
  | WsTurnSavedEvent
  | WsHintTextEvent
  | WsScoringCompleteEvent
  | WsErrorEvent;

// =============================================================================
// UI STATE TYPES
// =============================================================================

export type RecorderState = "idle" | "permission-denied" | "recording" | "uploading" | "processing" | "error";

export type WsConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting" | "error";

export interface SessionUiState {
  turns: Turn[];
  aiStreamingText: string;
  isAiStreaming: boolean;
  lastSttResult: { text: string; confidence: number } | null;
  currentHint: string | null;
  hintPanelOpen: boolean;
  recorderState: RecorderState;
  wsState: WsConnectionState;
  currentAudioUrl: string | null;
  uploadUrl: string | null;
  isControlsDisabled?: boolean;
}

// =============================================================================
// SERVER ACTION DTOs
// =============================================================================

export interface CreateSessionDto {
  scenario_id: string;
  ai_gender: "male" | "female";
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
}

export interface CreateSessionResult {
  success: boolean;
  session_id?: string;
  error?: string;
}

export interface GetSessionResult {
  success: boolean;
  session?: Session;
  error?: string;
}
