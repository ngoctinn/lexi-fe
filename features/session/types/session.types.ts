export enum TurnSpeaker {
  USER = "USER",
  AI = "AI",
}

export type AICharacter = "Sarah" | "Marco" | "Emma" | "James";
export type SessionLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

// Character metadata for UI
export const AI_CHARACTERS = [
  { name: "Sarah" as const, gender: "female", accent: "US", voice: "Joanna", description: "Friendly American" },
  { name: "Marco" as const, gender: "male", accent: "US", voice: "Matthew", description: "Professional American" },
  { name: "Emma" as const, gender: "female", accent: "British", voice: "Amy", description: "Elegant British" },
  { name: "James" as const, gender: "male", accent: "British", voice: "Brian", description: "Distinguished British" },
] as const;

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
  // Legacy streaming events (removed in STT migration)
  // START_STREAMING = "START_STREAMING",
  // AUDIO_CHUNK = "AUDIO_CHUNK",
  // END_STREAMING = "END_STREAMING",
  GET_TRANSCRIBE_URL = "GET_TRANSCRIBE_URL",
  SUBMIT_TRANSCRIPT = "SUBMIT_TRANSCRIPT",
  ANALYZE_TURN = "ANALYZE_TURN",
}

export enum WsServerEvent {
  SESSION_READY = "SESSION_READY",
  AI_TEXT_CHUNK = "AI_TEXT_CHUNK",
  AI_RESPONSE = "AI_RESPONSE",
  AI_AUDIO_URL = "AI_AUDIO_URL",
  TURN_SAVED = "TURN_SAVED",
  HINT_TEXT = "HINT_TEXT",
  TURN_ANALYSIS = "TURN_ANALYSIS",
  SCORING_COMPLETE = "SCORING_COMPLETE",
  ERROR = "ERROR",
  TRANSCRIBE_URL = "TRANSCRIBE_URL",
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
  audio_url?: string | null;
  is_hint_used: boolean;
  is_saved_to_flashcard?: boolean;
  is_pending?: boolean;
  is_partial?: boolean; // For real-time partial transcripts
  // Phase 5: Performance & Quality Metrics
  ttft_ms?: number | null;
  latency_ms?: number | null;
  input_tokens?: number;
  output_tokens?: number;
  cost_usd?: number;
  delivery_cue?: string;
  quality_score?: number;
}

export interface Scoring {
  fluency_score: number;
  pronunciation_score: number;
  grammar_score: number;
  vocabulary_score: number;
  overall_score: number;
  feedback?: string;
  // Legacy field names for backward compatibility
  [ScoringSkill.FLUENCY]?: number;
  [ScoringSkill.PRONUNCIATION]?: number;
  [ScoringSkill.GRAMMAR]?: number;
  [ScoringSkill.VOCABULARY]?: number;
  overall?: number;
}

export interface Session {
  session_id: string;
  user_id?: string;
  scenario_id: string;
  user_role?: string;
  ai_role?: string;
  ai_character: AICharacter;
  level: SessionLevel;
  prompt_snapshot?: string;
  selected_goal?: string;
  selected_goals?: string[];
  status?: string;
  total_turns?: number;
  turn_count?: number;
  user_turns?: number;
  hint_used_count?: number;
  turns?: Turn[];
  scoring?: Scoring | null;
  connection_id?: string | null;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  // Session-level metrics
  assigned_model?: string;
  avg_ttft_ms?: number;
  avg_latency_ms?: number;
  avg_output_tokens?: number;
  total_cost_usd?: number;
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

export interface WsGetTranscribeUrlPayload {
  action: WsClientEvent.GET_TRANSCRIBE_URL;
  session_id: string;
}

export interface WsSubmitTranscriptPayload {
  action: WsClientEvent.SUBMIT_TRANSCRIPT;
  session_id: string;
  text: string;
  confidence: number;
}

export interface WsAnalyzeTurnPayload {
  action: WsClientEvent.ANALYZE_TURN;
  session_id: string;
  turn_index: number;
}

export type WsClientPayload =
  | WsStartSessionPayload
  | WsAudioUploadedPayload
  | WsUseHintPayload
  | WsEndSessionPayload
  | WsSendMessagePayload
  | WsGetTranscribeUrlPayload
  | WsSubmitTranscriptPayload
  | WsAnalyzeTurnPayload;

export interface WsSessionReadyEvent {
  event: WsServerEvent.SESSION_READY;
  upload_url: string;
  s3_key: string;
}

export interface WsAiTextChunkEvent {
  event: WsServerEvent.AI_TEXT_CHUNK;
  chunk: string;
  done: boolean;
}

export interface WsAiResponseEvent {
  event: WsServerEvent.AI_RESPONSE;
  text: string;
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
  hint: {
    level?: string;
    type?: "vocabulary_suggestion" | "strategic_guidance" | "metacognitive_prompt";
    markdown: {
      vi: string;
      en: string;
    };
  };
  isStreaming?: boolean;
  isDone?: boolean;
}

export interface WsTurnAnalysisEvent {
  event: WsServerEvent.TURN_ANALYSIS;
  analysis: {
    markdown: {
      vi: string;
      en: string;
    };
  };
  turn_index?: number;
  isStreaming?: boolean;
  isDone?: boolean;
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

export interface WsTranscribeUrlEvent {
  event: WsServerEvent.TRANSCRIBE_URL;
  url: string;
  expires_in: number;
  language_code: string;
  media_encoding: string;
  sample_rate: number;
}

export type WsServerPayload =
  | WsSessionReadyEvent
  | WsAiTextChunkEvent
  | WsAiResponseEvent
  | WsAiAudioUrlEvent
  | WsTurnSavedEvent
  | WsHintTextEvent
  | WsTurnAnalysisEvent
  | WsScoringCompleteEvent
  | WsErrorEvent
  | WsTranscribeUrlEvent;

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
  isAiStreaming: boolean;
  currentHint: {
    level: string;
    type: string;
    markdown: {
      vi: string;
      en: string;
    };
  } | null;
  hintTimeoutId?: NodeJS.Timeout | null;
  hintHistory: Array<{
    timestamp: number;
    markdown: {
      vi: string;
      en: string;
    };
  }>;
  currentAnalysis: {
    turnIndex: number;
    markdown: {
      vi: string;
      en: string;
    };
  } | null;
  tempAnalysis: {
    turnIndex: number;
    markdown: {
      vi: string;
      en: string;
    };
  } | null;
  analysisHistory: Array<{
    turnIndex: number;
    timestamp: number;
    markdown: {
      vi: string;
      en: string;
    };
  }>;
  analyzedTurns: Set<number>;
  hintPanelOpen: boolean;
  analysisPanelOpen: boolean;
  recorderState: RecorderState;
  wsState: WsConnectionState;
  currentAudioUrl: string | null;
  isControlsDisabled?: boolean;
  requestHintInProgress?: boolean;
  isStartingSession?: boolean;
  analyzingTurnIndex?: number | null;
}

export interface CreateSessionDto {
  scenario_id: string;
  user_role: string;           // ✅ Khớp với API spec
  ai_role: string;             // ✅ Khớp với API spec
  difficulty_level?: string;   // ✅ Khớp với API spec
  ai_character?: AICharacter;  // Optional - có thể không cần gửi lên API
  level?: SessionLevel;        // Optional - có thể map từ difficulty_level
  selected_goal?: string;      // Optional - additional field
  prompt_snapshot?: string;    // Optional - additional field
}

export interface CreateSessionResult {
  success: boolean;
  session_id?: string;
  user_id?: string;
  error?: string;
}

export interface GetSessionResult {
  success: boolean;
  session?: Session;
  error?: string;
}
