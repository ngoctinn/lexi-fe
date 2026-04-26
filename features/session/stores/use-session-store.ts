import { create } from "zustand";
import type {
  SessionUiState,
  Turn,
  WsConnectionState,
  RecorderState,
} from "../types/session.types";

interface SessionStoreState extends SessionUiState {
  setTurns: (turns: Turn[] | ((prev: Turn[]) => Turn[])) => void;
  setAiStreaming: (isStreaming: boolean, text?: string) => void;
  setWsState: (state: WsConnectionState) => void;
  setRecorderState: (state: RecorderState) => void;
  setLastSttResult: (
    result: { text: string; confidence: number } | null,
  ) => void;
  setHint: (hint: SessionUiState["currentHint"]) => void;
  addHintToHistory: (markdown: { vi: string; en: string }) => void;
  removeHintFromHistory: (timestamp: number) => void;
  setHintTimeoutId: (timeoutId: NodeJS.Timeout | null) => void;
  setAnalysis: (analysis: SessionUiState["currentAnalysis"]) => void;
  setTempAnalysis: (analysis: SessionUiState["tempAnalysis"]) => void;
  addAnalysisToHistory: (turnIndex: number, markdown: { vi: string; en: string }) => void;
  removeAnalysisFromHistory: (timestamp: number) => void;
  setHintPanelOpen: (open: boolean) => void;
  setAnalysisPanelOpen: (open: boolean) => void;
  setCurrentAudioUrl: (currentAudioUrl: string | null) => void;
  setStreamingTranscript: (finalText: string, partialText: string, isStreaming: boolean) => void;
  setStreamingError: (error: string | null) => void;
  setRequestHintInProgress: (inProgress: boolean) => void;
  setIsStartingSession: (isStarting: boolean) => void;
  setAnalyzingTurnIndex: (turnIndex: number | null) => void;
  reset: () => void;
}

const initialState: SessionUiState = {
  turns: [],
  isAiStreaming: false,
  lastSttResult: null,
  currentHint: null,
  hintTimeoutId: null,
  hintHistory: [],
  currentAnalysis: null,
  tempAnalysis: null,
  analysisHistory: [],
  analyzedTurns: new Set(),
  analyzingTurnIndex: null,
  hintPanelOpen: false,
  analysisPanelOpen: false,
  recorderState: "idle",
  wsState: "disconnected",
  currentAudioUrl: null,
  streamingTranscript: {
    finalText: "",
    partialText: "",
    isStreaming: false,
  },
  streamingError: null,
  requestHintInProgress: false,
  isStartingSession: false,
};

export const useSessionStore = create<SessionStoreState>((set) => ({
  ...initialState,

  setTurns: (turns) =>
    set((state) => ({
      turns: typeof turns === "function" ? turns(state.turns) : turns,
    })),

  setAiStreaming: (isStreaming) =>
    set({
      isAiStreaming: isStreaming,
    }),

  setWsState: (wsState) => set({ wsState }),

  setRecorderState: (recorderState) => set({ recorderState }),

  setLastSttResult: (lastSttResult) => set({ lastSttResult }),

  setHint: (currentHint) => set({ currentHint }),

  addHintToHistory: (markdown) =>
    set((state) => {
      return {
        hintHistory: [
          { timestamp: Date.now(), markdown },
          ...state.hintHistory,
        ],
      };
    }),

  removeHintFromHistory: (timestamp) =>
    set((state) => ({
      hintHistory: state.hintHistory.filter((h) => h.timestamp !== timestamp),
    })),

  setHintTimeoutId: (hintTimeoutId) => set({ hintTimeoutId }),

  setAnalysis: (currentAnalysis) => set({ currentAnalysis }),

  setTempAnalysis: (tempAnalysis) => set({ tempAnalysis }),

  addAnalysisToHistory: (turnIndex, markdown) =>
    set((state) => ({
      analysisHistory: [
        { turnIndex, timestamp: Date.now(), markdown },
        ...state.analysisHistory,
      ],
      analyzedTurns: new Set([...state.analyzedTurns, turnIndex]),
    })),

  removeAnalysisFromHistory: (timestamp) =>
    set((state) => ({
      analysisHistory: state.analysisHistory.filter((a) => a.timestamp !== timestamp),
    })),

  setHintPanelOpen: (hintPanelOpen) => set({ hintPanelOpen }),

  setAnalysisPanelOpen: (analysisPanelOpen) => set({ analysisPanelOpen }),

  setCurrentAudioUrl: (currentAudioUrl) => set({ currentAudioUrl }),

  setStreamingTranscript: (finalText, partialText, isStreaming) =>
    set({
      streamingTranscript: { finalText, partialText, isStreaming },
    }),

  setStreamingError: (streamingError) => set({ streamingError }),

  setRequestHintInProgress: (requestHintInProgress) => set({ requestHintInProgress }),

  setIsStartingSession: (isStartingSession) => set({ isStartingSession }),

  setAnalyzingTurnIndex: (analyzingTurnIndex) => set({ analyzingTurnIndex }),

  reset: () => set(initialState),
}));
