import { create } from "zustand";
import type {
  SessionUiState,
  Turn,
  WsConnectionState,
  RecorderState,
} from "../types/session.types";
import { TurnSpeaker } from "../types/session.types";

interface SessionStoreState extends SessionUiState {
  transcribeUrl: string | null;
  setTurns: (turns: Turn[] | ((prev: Turn[]) => Turn[])) => void;
  updatePartialTurn: (content: string) => void; // Update partial transcript
  removePartialTurn: () => void; // Remove partial turn when finalizing
  setAiStreaming: (isStreaming: boolean, text?: string) => void;
  setWsState: (state: WsConnectionState) => void;
  setRecorderState: (state: RecorderState) => void;
  setHint: (hint: SessionUiState["currentHint"]) => void;
  addHintToHistory: (markdown: { vi: string; en: string }) => void;
  removeHintFromHistory: (timestamp: number) => void;
  setHintTimeoutId: (timeoutId: NodeJS.Timeout | null) => void;
  clearCurrentHint: () => void;
  setAnalysis: (analysis: SessionUiState["currentAnalysis"]) => void;
  setTempAnalysis: (analysis: SessionUiState["tempAnalysis"]) => void;
  addAnalysisToHistory: (turnIndex: number, markdown: { vi: string; en: string }) => void;
  removeAnalysisFromHistory: (timestamp: number) => void;
  clearTempAnalysis: () => void;
  setHintPanelOpen: (open: boolean) => void;
  setAnalysisPanelOpen: (open: boolean) => void;
  setCurrentAudioUrl: (currentAudioUrl: string | null) => void;
  setRequestHintInProgress: (inProgress: boolean) => void;
  setIsStartingSession: (isStarting: boolean) => void;
  setAnalyzingTurnIndex: (turnIndex: number | null) => void;
  setTranscribeUrl: (url: string | null) => void;
  reset: () => void;
}

const initialState: SessionUiState = {
  turns: [],
  isAiStreaming: false,
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
  requestHintInProgress: false,
  isStartingSession: false,
};

export const useSessionStore = create<SessionStoreState>((set) => ({
  ...initialState,
  transcribeUrl: null,

  setTurns: (turns) =>
    set((state) => ({
      turns: typeof turns === "function" ? turns(state.turns) : turns,
    })),

  updatePartialTurn: (content) =>
    set((state) => {
      const turns = [...state.turns];
      const partialIndex = turns.findIndex((t) => t.is_partial);
      
      if (partialIndex >= 0) {
        // Update existing partial turn
        turns[partialIndex] = { ...turns[partialIndex], content };
      } else {
        // Create new partial turn
        turns.push({
          turn_index: -1, // Temporary index
          speaker: TurnSpeaker.USER,
          content,
          is_hint_used: false,
          is_pending: true,
          is_partial: true,
        });
      }
      
      return { turns };
    }),

  removePartialTurn: () =>
    set((state) => ({
      turns: state.turns.filter((t) => !t.is_partial),
    })),

  setAiStreaming: (isStreaming) =>
    set({
      isAiStreaming: isStreaming,
    }),

  setWsState: (wsState) => set({ wsState }),

  setRecorderState: (recorderState) => set({ recorderState }),

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

  clearCurrentHint: () => set({ currentHint: null }),

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

  clearTempAnalysis: () => set({ tempAnalysis: null }),

  setHintPanelOpen: (hintPanelOpen) => set({ hintPanelOpen }),

  setAnalysisPanelOpen: (analysisPanelOpen) => set({ analysisPanelOpen }),

  setCurrentAudioUrl: (currentAudioUrl) => set({ currentAudioUrl }),

  setRequestHintInProgress: (requestHintInProgress) => set({ requestHintInProgress }),

  setIsStartingSession: (isStartingSession) => set({ isStartingSession }),

  setAnalyzingTurnIndex: (analyzingTurnIndex) => set({ analyzingTurnIndex }),

  setTranscribeUrl: (transcribeUrl) => set({ transcribeUrl }),

  reset: () => set({ ...initialState, transcribeUrl: null }),
}));
