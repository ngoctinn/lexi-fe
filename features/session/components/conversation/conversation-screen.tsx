"use client";

import * as React from "react";

import { useSession } from "@/features/session/hooks/use-session";
import { useSessionStore } from "@/features/session/stores/use-session-store";
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
      hasInitialTurns: (initialTurns?.length || 0) > 0,
      isNewSession,
    });
  }, [sessionId, idToken, initialTurns, isNewSession]);

  const { ui, actions } = useSession({
    sessionId,
    idToken,
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
  const [analysisLanguage, setAnalysisLanguage] = React.useState<"vi" | "en">("vi");
  const hasStartedRef = React.useRef(false);
  const {
    startSession,
    toggleMic,
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

  return (
    <div className="flex w-full flex-col h-full bg-background relative overflow-hidden">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur lg:px-6">
        <SessionHeader
          sessionId={sessionId}
          scenarioTitle={scenarioTitle}
          aiCharacter={aiCharacter}
          myRole={myRole}
          partnerRole={partnerRole}
          scenarioGoals={scenarioGoals}
          className="flex-1 border-none bg-transparent h-auto p-0"
          isCompleted={isSessionCompleted}
          onEnd={handleSessionEnded}
        />

        <div className="lg:hidden">
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
                onAnalysisClose={() => {
                  const state = useSessionStore.getState();
                  state.setTempAnalysis(null);
                }}
                isAiStreaming={ui.isAiStreaming}
                disabled={ui.isControlsDisabled || isSessionCompleted}
                isSessionCompleted={isSessionCompleted}
                sessionSummary={sessionSummary}
                className="border-none w-full h-full"
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-3 flex-col overflow-hidden relative border-r">
          <TranscriptPanel
            turns={ui.turns}
            isAiStreaming={ui.isAiStreaming}
            aiStreamingText={ui.aiStreamingText}
            aiName={aiCharacter}
            className="flex-1"
            aria-live="polite"
            onTranslate={translateTurn}
            onTranslateWord={translateWord}
            onAnalyze={analyzeTurn}
            savingTurnIndexes={ui.savingFlashcardTurnIndexes}
          />

          <div className="p-4 bg-background/95 backdrop-blur border-t shrink-0 pb-safe lg:px-8 lg:pb-6">
            <MessageInput
              value={inputValue}
              onValueChange={setInputValue}
              onSendMessage={sendMessage}
              onToggleMic={toggleMic}
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
          onAnalysisClose={() => {
            const state = useSessionStore.getState();
            state.setTempAnalysis(null);
          }}
          isAiStreaming={ui.isAiStreaming}
          disabled={ui.isControlsDisabled || isSessionCompleted}
          isSessionCompleted={isSessionCompleted}
          sessionSummary={sessionSummary}
          language={hintLanguage}
          className="hidden lg:flex flex-2"
        />
      </div>

      <AiAudioPlayer
        url={ui.currentAudioUrl}
        onEnded={() => setCurrentAudioUrl(null)}
      />
    </div>
  );
}
