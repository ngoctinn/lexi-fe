export const SessionDomain = {
  isControlsDisabled: (
    wsState: string,
    recorderState: string,
    isAiStreaming: boolean,
  ): boolean => {
    return (
      wsState !== "connected" ||
      recorderState === "uploading" ||
      recorderState === "processing" ||
      isAiStreaming
    );
  },
};
