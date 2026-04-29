"use client";

import * as React from "react";

import { useSession } from "@/features/session/hooks/use-session";
import { SessionHeader } from "../shared/session-header";
import { TranscriptPanel } from "./transcript-panel";
import { type Turn } from "@/features/session/types/session.types";
import { MessageInput } from "./message-input";
import { ConversationSidebar } from "./conversation-sidebar";
import { AiAudioPlayer } from "./ai-audio-player";
import type { SessionScoreSummary } from "@/features/session/types/session.types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface ConversationScreenProps {
  sessionId: string;
  idToken: string;
  sessionLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  initialTurns?: Turn[];
  scenarioTitle?: string;
  aiCharacter?: string;
  scenarioGoals?: string[];
  myRole?: string;
  partnerRole?: string;
  initialSummary?: SessionScoreSummary | null;
  isNewSession?: boolean;
}

export function ConversationScreen({
  sessionId,
  idToken,
  sessionLevel,
  initialTurns,
  scenarioTitle = "Phiên luyện nói",
  aiCharacter = "AI Assistant",
  scenarioGoals = [],
  myRole,
  partnerRole,
  initialSummary = null,
  isNewSession,
}: ConversationScreenProps) {
  // Debug logging
  React.useEffect(() => {
    console.log("[ConversationScreen] Mounted with:", {
      sessionId: sessionId?.substring(0, 8) + "..." || "undefined",
      idTokenLength: idToken?.length || 0,
      sessionLevel,
      hasInitialTurns: (initialTurns?.length || 0) > 0,
      isNewSession,
    });
  }, [sessionId, idToken, sessionLevel, initialTurns, isNewSession]);

  const { ui, actions } = useSession({
    sessionId,
    idToken,
    sessionLevel,
    initialTurns,
    isNewSession,
  });
  const [inputValue, setInputValue] = React.useState("");
  const [sessionSummary, setSessionSummary] =
    React.useState<SessionScoreSummary | null>(initialSummary);
  const [isSessionCompleted, setIsSessionCompleted] = React.useState(
    Boolean(initialSummary),
  );
  const [hintLanguage, setHintLanguage] = React.useState<"vi" | "en">("vi");
  const [playingAudioUrl, setPlayingAudioUrl] = React.useState<string | null>(null);
  const hasStartedRef = React.useRef(false);
  const {
    startSession,
    toggleMic,
    cancelRecording,
    requestHint,
    analyzeTurn,
    translateTurn,
    translateWord,
    saveTurnToFlashcard,
    sendMessage,
    setCurrentAudioUrl,
    endSession: endConversationSession,
  } = actions;

  React.useEffect(() => {
    if (isSessionCompleted) {
      return;
    }

    if (ui.wsState === "connected" && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startSession();
    }
  }, [ui.wsState, startSession, isSessionCompleted]);

  const handleSessionEnded = React.useCallback(
    (summary: SessionScoreSummary | null) => {
      endConversationSession();
      setSessionSummary(summary);
      setIsSessionCompleted(true);
    },
    [endConversationSession],
  );

  const handlePlayAudio = React.useCallback((url: string) => {
    setCurrentAudioUrl(url);
    setPlayingAudioUrl(url);
  }, [setCurrentAudioUrl]);

  const handleAudioEnded = React.useCallback(() => {
    setCurrentAudioUrl(null);
    setPlayingAudioUrl(null);
  }, [setCurrentAudioUrl]);

  return (
    <div className="flex w-full flex-col h-full bg-background relative overflow-hidden">
      <SessionHeader
        sessionId={sessionId}
        scenarioTitle={scenarioTitle}
        aiCharacter={aiCharacter}
        myRole={myRole}
        partnerRole={partnerRole}
        scenarioGoals={scenarioGoals}
        isCompleted={isSessionCompleted}
        onEnd={handleSessionEnded}
      />

      <div className="lg:hidden absolute top-3 right-4 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 sm:w-80">
            <SheetTitle className="sr-only">Menu hội thoại</SheetTitle>
            <SheetDescription className="sr-only">
              Các công cụ và tùy chọn của phiên hội thoại trên thiết bị di
              động.
            </SheetDescription>
            <ConversationSidebar
              currentHint={ui.currentHint}
              hintHistory={ui.hintHistory}
              tempAnalysis={ui.tempAnalysis}
              analysisHistory={ui.analysisHistory}
              onGetHint={requestHint}
              isAiStreaming={ui.isAiStreaming}
              isRequestingHint={ui.requestHintInProgress}
              isAnalyzing={ui.analyzingTurnIndex !== null}
              disabled={ui.isControlsDisabled || isSessionCompleted || ui.wsState !== "connected"}
              isSessionCompleted={isSessionCompleted}
              sessionSummary={sessionSummary}
              myRole={myRole}
              partnerRole={partnerRole}
              className="border-none w-full h-full"
            />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-3 flex-col overflow-hidden relative border-r">
          <TranscriptPanel
            turns={ui.turns}
            isAiStreaming={ui.isAiStreaming}
            silenceTimeoutMs={ui.silenceTimeoutMs}
            timeSinceLastTranscript={ui.timeSinceLastTranscript}
            className="flex-1"
            aria-live="polite"
            onPlayAudio={handlePlayAudio}
            playingAudioUrl={playingAudioUrl}
            onTranslate={translateTurn}
            onTranslateWord={translateWord}
            onSaveFlashcard={saveTurnToFlashcard}
            savingFlashcardTurnIndexes={ui.savingFlashcardTurnIndexes}
            analyzingTurnIndex={ui.analyzingTurnIndex}
            onAnalyze={analyzeTurn}
          />

          <div className="p-4 bg-background/95 backdrop-blur border-t shrink-0 lg:px-8 lg:pb-6" suppressHydrationWarning>
            <MessageInput
              value={inputValue}
              onValueChange={setInputValue}
              onSendMessage={sendMessage}
              onToggleMic={toggleMic}
              onCancelRecording={cancelRecording}
              recorderState={ui.recorderState}
              disabled={ui.isControlsDisabled || isSessionCompleted}
            />
          </div>
        </main>

        <ConversationSidebar
          currentHint={ui.currentHint}
          hintHistory={ui.hintHistory}
          tempAnalysis={ui.tempAnalysis}
          analysisHistory={ui.analysisHistory}
          onGetHint={requestHint}
          onLanguageChange={setHintLanguage}
          isAiStreaming={ui.isAiStreaming}
          isRequestingHint={ui.requestHintInProgress}
          isAnalyzing={ui.analyzingTurnIndex !== null}
          disabled={ui.isControlsDisabled || isSessionCompleted || ui.wsState !== "connected"}
          isSessionCompleted={isSessionCompleted}
          sessionSummary={sessionSummary}
          language={hintLanguage}
          myRole={myRole}
          partnerRole={partnerRole}
          className="hidden lg:flex flex-2"
        />
      </div>

      <AiAudioPlayer
        url={ui.currentAudioUrl}
        onEnded={handleAudioEnded}
      />
    </div>
  );
}
