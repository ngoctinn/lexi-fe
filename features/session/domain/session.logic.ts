export const SessionDomain = {
  isControlsDisabled: (
    wsState:
      | "disconnected"
      | "connecting"
      | "connected"
      | "reconnecting"
      | "error",
    recorderState:
      | "idle"
      | "permission-denied"
      | "recording"
      | "uploading"
      | "processing"
      | "error",
    isAiStreaming: boolean,
  ): boolean => {
    const disabled =
      wsState !== "connected" ||
      recorderState === "uploading" ||
      recorderState === "processing" ||
      isAiStreaming;
    
    if (disabled) {
      console.log("[SessionDomain] Controls disabled:", {
        wsState,
        recorderState,
        isAiStreaming,
        reason: wsState !== "connected" ? "ws-not-connected" : 
                recorderState === "uploading" ? "uploading" :
                recorderState === "processing" ? "processing" :
                isAiStreaming ? "ai-streaming" : "unknown"
      });
    }
    
    return disabled;
  },
};
