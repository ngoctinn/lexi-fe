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
  ): boolean =>
    wsState !== "connected" ||
    recorderState === "uploading" ||
    recorderState === "processing" ||
    isAiStreaming,
};
