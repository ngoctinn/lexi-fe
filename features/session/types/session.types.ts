export enum TurnSpeaker {
  USER = "USER",
  AI = "AI",
}

export type AIGender = "male" | "female";
export type SessionLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

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
  START_STREAMING = "START_STREAMING",
  AUDIO_CHUNK = "AUDIO_CHUNK",
  END_STREAMING = "END_STREAMING",
  SUBMIT_TRANSCRIPT = "SUBMIT_TRANSCRIPT",
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
  STREAMING_READY = "STREAMING_READY",
  PARTIAL_TRANSCRIPT = "PARTIAL_TRANSCRIPT",
  FINAL_TRANSCRIPT = "FINAL_TRANSCRIPT",
  STT_ERROR = "STT_ERROR",
}

export interface Scenario {
  scenario_id: string;
  scenario_title: string;
  context: string;
  roles: string[];
  goals: string[];
  is_active: boolean;
  usage_count: number;
  difficulty_level?: SessionLevel;
  order?: number;
}

export interface Turn {
  turn_index: number;
  speaker: TurnSpeaker;
  content: string;
  translated_content?: string | null;
  analysis_items?: AnalyzedSentenceItem[];
  audio_url?: string | null;
  is_hint_used: boolean;
  is_saved_to_flashcard?: boolean;
  is_pending?: boolean;
}

export interface AnalyzedSentenceItem {
  text: string;
  type: "word" | "phrase";
  base?: string | null;
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
  learner_role_id?: string;
  ai_role_id?: string;
  ai_gender: AIGender;
  level: SessionLevel;
  prompt_snapshot: string;
  selected_goals?: string[];
  total_turns: number;
  user_turns: number;
  hint_used_count: number;
  turns?: Turn[];
  scoring?: Scoring | null;
  connection_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SessionScoreSummary {
  scoring: NonNullable<Session["scoring"]>;
  totalTurns: number;
  hintUsedCount: number;
}

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

export interface WsStartStreamingPayload {
  action: WsClientEvent.START_STREAMING;
  session_id: string;
}

export interface WsAudioChunkPayload {
  action: WsClientEvent.AUDIO_CHUNK;
  session_id: string;
  data: number[];
}

export interface WsEndStreamingPayload {
  action: WsClientEvent.END_STREAMING;
  session_id: string;
}

export interface WsSubmitTranscriptPayload {
  action: WsClientEvent.SUBMIT_TRANSCRIPT;
  session_id: string;
  text: string;
  confidence: number;
}

export type WsClientPayload =
  | WsStartSessionPayload
  | WsAudioUploadedPayload
  | WsUseHintPayload
  | WsEndSessionPayload
  | WsSendMessagePayload
  | WsStartStreamingPayload
  | WsAudioChunkPayload
  | WsEndStreamingPayload
  | WsSubmitTranscriptPayload;

export interface WsSessionReadyEvent {
  event: WsServerEvent.SESSION_READY;
  upload_url: string;
  s3_key: string;
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

export interface WsStreamingReadyEvent {
  event: WsServerEvent.STREAMING_READY;
  session_id: string;
}

export interface WsPartialTranscriptEvent {
  event: WsServerEvent.PARTIAL_TRANSCRIPT;
  text: string;
  confidence: number;
}

export interface WsFinalTranscriptEvent {
  event: WsServerEvent.FINAL_TRANSCRIPT;
  text: string;
  confidence: number;
}

export interface WsSttErrorEvent {
  event: WsServerEvent.STT_ERROR;
  message: string;
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
  | WsErrorEvent
  | WsStreamingReadyEvent
  | WsPartialTranscriptEvent
  | WsFinalTranscriptEvent
  | WsSttErrorEvent;

export type RecorderState =
  | "idle"
  | "permission-denied"
  | "recording"
  | "uploading"
  | "processing"
  | "error";

export type WsConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

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
  s3Key: string | null;
  isControlsDisabled?: boolean;
  streamingTranscript?: {
    finalText: string;
    partialText: string;
    isStreaming: boolean;
  };
  streamingError?: string | null;
}

export interface CreateSessionDto {
  scenario_id: string;
  learner_role_id?: string;
  ai_role_id?: string;
  ai_gender: AIGender;
  level: SessionLevel;
  selected_goals?: string[];
  prompt_snapshot: string;
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
