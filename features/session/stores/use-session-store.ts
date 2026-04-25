import { create } from "zustand";
import type {
  SessionUiState,
  Turn,
  WsConnectionState,
  RecorderState,
} from "../types/session.types";

interface SessionStoreState extends SessionUiState {
  setTurns: (turns: Turn[] | ((prev: Turn[]) => Turn[])) => void;
  setAiStreamingText: (text: string | ((prev: string) => string)) => void;
  setAiStreaming: (isStreaming: boolean, text?: string) => void;
  setWsState: (state: WsConnectionState) => void;
  setRecorderState: (state: RecorderState) => void;
  setLastSttResult: (
    result: { text: string; confidence: number } | null,
  ) => void;
  setHint: (hint: string | null) => void;
  setHintPanelOpen: (open: boolean) => void;
  setCurrentAudioUrl: (currentAudioUrl: string | null) => void;
  setStreamingTranscript: (finalText: string, partialText: string, isStreaming: boolean) => void;
  setStreamingError: (error: string | null) => void;
  reset: () => void;
}

const initialState: SessionUiState = {
  turns: [],
  aiStreamingText: "",
  isAiStreaming: false,
  lastSttResult: null,
  currentHint: null,
  hintPanelOpen: false,
  recorderState: "idle",
  wsState: "disconnected",
  currentAudioUrl: null,
  streamingTranscript: {
    finalText: "",
    partialText: "",
    isStreaming: false,
  },
  streamingError: null,
};

export const useSessionStore = create<SessionStoreState>((set) => ({
  ...initialState,

  setTurns: (turns) =>
    set((state) => ({
      turns: typeof turns === "function" ? turns(state.turns) : turns,
    })),

  setAiStreamingText: (text) =>
    set((state) => ({
      aiStreamingText:
        typeof text === "function" ? text(state.aiStreamingText) : text,
    })),

  setAiStreaming: (isStreaming, text) =>
    set((state) => ({
      isAiStreaming: isStreaming,
      aiStreamingText: text !== undefined ? text : state.aiStreamingText,
    })),

  setWsState: (wsState) => set({ wsState }),

  setRecorderState: (recorderState) => set({ recorderState }),

  setLastSttResult: (lastSttResult) => set({ lastSttResult }),

  setHint: (currentHint) => set({ currentHint }),

  setHintPanelOpen: (hintPanelOpen) => set({ hintPanelOpen }),

  setCurrentAudioUrl: (currentAudioUrl) => set({ currentAudioUrl }),

  setStreamingTranscript: (finalText, partialText, isStreaming) =>
    set({
      streamingTranscript: { finalText, partialText, isStreaming },
    }),

  setStreamingError: (streamingError) => set({ streamingError }),

  reset: () => set(initialState),
}));
