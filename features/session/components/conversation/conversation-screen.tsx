"use client";

import * as React from "react";

import { useSession } from "@/features/session/hooks/use-session";
import { SessionHeader } from "../shared/session-header";
import { TranscriptPanel } from "./transcript-panel";
import { type Turn } from "@/features/session/types/session.types";
import { MessageInput } from "./message-input";
import { ConversationSidebar } from "./conversation-sidebar";
import { AiAudioPlayer } from "./ai-audio-player";
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
}: ConversationScreenProps) {
  const { ui, uploadProgress, actions } = useSession({
    sessionId,
    idToken,
    initialTurns,
  });
  const [inputValue, setInputValue] = React.useState("");
  const hasStartedRef = React.useRef(false);
  const {
    startSession,
    toggleMic,
    requestHint,
    translateTurn,
    sendMessage,
    setCurrentAudioUrl,
  } = actions;

  React.useEffect(() => {
    if (ui.wsState === "connected" && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startSession();
    }
  }, [ui.wsState, startSession]);

  return (
    <div className="flex w-full flex-col h-full bg-background relative overflow-hidden">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur lg:px-6">
        <SessionHeader
          sessionId={sessionId}
          scenarioTitle={scenarioTitle}
          aiCharacter={aiCharacter}
          className="flex-1 border-none bg-transparent h-auto p-0"
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
                scenarioGoals={scenarioGoals}
                myRole={myRole}
                partnerRole={partnerRole}
                onGetHint={requestHint}
                isAiStreaming={ui.isAiStreaming}
                disabled={ui.isControlsDisabled}
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
          />

          <div className="p-4 bg-background/95 backdrop-blur border-t shrink-0 pb-safe lg:px-8 lg:pb-6">
            <MessageInput
              value={inputValue}
              onValueChange={setInputValue}
              onSendMessage={sendMessage}
              onToggleMic={toggleMic}
              recorderState={ui.recorderState}
              disabled={ui.isControlsDisabled}
            />

            {(ui.wsState !== "connected" ||
              ui.recorderState === "uploading") && (
              <div className="mt-2 flex items-center justify-center animate-in fade-in slide-in-from-bottom-1">
                {ui.wsState !== "connected" && (
                  <span className="text-[10px] text-muted-foreground font-medium animate-pulse">
                    {ui.wsState === "connecting"
                      ? "Đang kết nối..."
                      : "Mất kết nối máy chủ"}
                  </span>
                )}
                {ui.recorderState === "uploading" && (
                  <div className="w-full max-w-12.5 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <ConversationSidebar
          currentHint={ui.currentHint}
          scenarioGoals={scenarioGoals}
          myRole={myRole}
          partnerRole={partnerRole}
          onGetHint={requestHint}
          isAiStreaming={ui.isAiStreaming}
          disabled={ui.isControlsDisabled}
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
