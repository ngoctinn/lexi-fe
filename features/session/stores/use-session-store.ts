import { create } from "zustand";
import type { SessionUiState, Turn, WsConnectionState, RecorderState } from "../types/session.types";

interface SessionStoreState extends SessionUiState {
  // Actions
  setTurns: (turns: Turn[] | ((prev: Turn[]) => Turn[])) => void;
  setAiStreaming: (isStreaming: boolean, text?: string) => void;
  setWsState: (state: WsConnectionState) => void;
  setRecorderState: (state: RecorderState) => void;
  setLastSttResult: (result: { text: string; confidence: number } | null) => void;
  setHint: (hint: string | null) => void;
  setHintPanelOpen: (open: boolean) => void;
  setUploadUrls: (uploadUrl: string | null) => void;
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
  uploadUrl: null,
};

export const useSessionStore = create<SessionStoreState>((set) => ({
  ...initialState,

  setTurns: (turns) => 
    set((state) => ({ 
      turns: typeof turns === "function" ? turns(state.turns) : turns 
    })),

  setAiStreaming: (isStreaming, text) => 
    set((state) => ({ 
      isAiStreaming: isStreaming, 
      aiStreamingText: text !== undefined ? text : state.aiStreamingText 
    })),

  setWsState: (wsState) => set({ wsState }),
  
  setRecorderState: (recorderState) => set({ recorderState }),

  setLastSttResult: (lastSttResult) => set({ lastSttResult }),

  setHint: (currentHint) => set({ currentHint }),

  setHintPanelOpen: (hintPanelOpen) => set({ hintPanelOpen }),

  setUploadUrls: (uploadUrl) => set({ uploadUrl }),

  reset: () => set(initialState),
}));
