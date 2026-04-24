import * as React from "react";
import { useCallback, useRef, useState } from "react";
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { fetchAuthSession } from "aws-amplify/auth";

export interface TranscriptResult {
  text: string;
  confidence: number;
  isPartial: boolean;
}

interface UseTranscribeStreamingProps {
  onTranscript: (result: TranscriptResult) => void;
  onError: (error: string) => void;
  onReady?: () => void;
}

// Singleton credential provider cache
// This prevents recreating credential provider on every initialization
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedCredentialProvider: any | null = null;
let cachedIdToken: string | null = null;

export function useTranscribeStreaming({
  onTranscript,
  onError,
  onReady,
}: UseTranscribeStreamingProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  const clientRef = useRef<TranscribeStreamingClient | null>(null);
  const audioStreamRef = useRef<AsyncGenerator<{ AudioEvent: { AudioChunk: Uint8Array } }> | null>(null);
  const audioChunksRef = useRef<Uint8Array[]>([]);
  const isStreamActiveRef = useRef(false);
  const initializingRef = useRef(false);

  const initializeClient = useCallback(async () => {
    if (initializingRef.current || clientRef.current) {
      return;
    }
    
    initializingRef.current = true;
    const startTime = performance.now();
    console.log("[Transcribe] Initializing client...");
    
    try {
      // Fetch auth session
      const sessionStart = performance.now();
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      console.log(`[Transcribe] fetchAuthSession took ${(performance.now() - sessionStart).toFixed(0)}ms`);

      if (!idToken) {
        throw new Error("No ID token available");
      }

      const region = process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1";
      const identityPoolId = process.env.NEXT_PUBLIC_IDENTITY_POOL_ID;
      const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;

      if (!identityPoolId || !userPoolId) {
        throw new Error("Missing AWS configuration");
      }

      // Reuse credential provider if token hasn't changed
      // This prevents recreating the provider and re-fetching credentials
      if (!cachedCredentialProvider || cachedIdToken !== idToken) {
        console.log("[Transcribe] Creating new credential provider...");
        const credStart = performance.now();
        
        cachedCredentialProvider = fromCognitoIdentityPool({
          clientConfig: { region },
          identityPoolId,
          logins: {
            [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken,
          },
        });
        cachedIdToken = idToken;
        
        console.log(`[Transcribe] Credential provider created in ${(performance.now() - credStart).toFixed(0)}ms`);
      } else {
        console.log("[Transcribe] Reusing cached credential provider");
      }

      // Create client with cached credential provider
      const clientStart = performance.now();
      clientRef.current = new TranscribeStreamingClient({
        region,
        credentials: cachedCredentialProvider,
      });
      console.log(`[Transcribe] Client created in ${(performance.now() - clientStart).toFixed(0)}ms`);
      
      setIsClientReady(true);
      console.log(`[Transcribe] Total initialization took ${(performance.now() - startTime).toFixed(0)}ms`);
    } catch (error) {
      console.error("[Transcribe] Failed to initialize client:", error);
      throw error;
    } finally {
      initializingRef.current = false;
    }
  }, []);

  // Pre-initialize client on mount
  React.useEffect(() => {
    initializeClient().catch((err) => {
      console.error("[Transcribe] Pre-initialization failed:", err);
    });
  }, [initializeClient]);

  const createAudioStream = useCallback(async function* () {
    audioChunksRef.current = [];
    isStreamActiveRef.current = true;
    
    console.log("[Transcribe] Audio stream generator started");
    
    while (isStreamActiveRef.current) {
      // Wait for chunks to be available
      while (audioChunksRef.current.length === 0 && isStreamActiveRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      
      // Check again after waiting (stream might have been closed)
      if (!isStreamActiveRef.current) {
        console.log("[Transcribe] Audio stream generator stopped");
        break;
      }
      
      // Get chunk and yield only if valid
      const chunk = audioChunksRef.current.shift();
      if (chunk && chunk.length > 0) {
        yield { AudioEvent: { AudioChunk: chunk } };
      }
    }
    
    console.log("[Transcribe] Audio stream generator ended");
  }, []);

  const startStream = useCallback(
    async (languageCode: string = "en-US") => {
      const streamStartTime = performance.now();
      try {
        console.log("[Transcribe] Starting stream, client ready:", isClientReady);
        
        // Wait for client to be ready if still initializing
        if (!clientRef.current) {
          console.log("[Transcribe] Client not ready, initializing...");
          const initStart = performance.now();
          await initializeClient();
          console.log(`[Transcribe] Client initialization took ${(performance.now() - initStart).toFixed(0)}ms`);
        }

        if (!clientRef.current) {
          throw new Error("Failed to initialize client");
        }

        console.log("[Transcribe] Client ready, creating audio stream...");
        setIsStreaming(true);
        audioStreamRef.current = createAudioStream();

        const command = new StartStreamTranscriptionCommand({
          LanguageCode: languageCode as "en-US",
          MediaSampleRateHertz: 16000,
          MediaEncoding: "pcm", // Use PCM for better compatibility
          AudioStream: audioStreamRef.current,
        });

        console.log("[Transcribe] Sending StartStreamTranscription command...");
        const commandStart = performance.now();
        const response = await clientRef.current.send(command);
        console.log(`[Transcribe] Command sent in ${(performance.now() - commandStart).toFixed(0)}ms`);
        console.log(`[Transcribe] Total stream start took ${(performance.now() - streamStartTime).toFixed(0)}ms`);

        // Notify that stream is ready
        onReady?.();

        // Process transcript events
        if (response.TranscriptResultStream) {
          for await (const event of response.TranscriptResultStream) {
            if (event.TranscriptEvent?.Transcript?.Results) {
              for (const result of event.TranscriptEvent.Transcript.Results) {
                if (result.Alternatives && result.Alternatives.length > 0) {
                  const alternative = result.Alternatives[0];
                  const transcript = alternative.Transcript || "";
                  const isPartial = result.IsPartial || false;

                  // Calculate average confidence
                  const items = alternative.Items || [];
                  const confidences = items
                    .map((item) => item.Confidence)
                    .filter((c): c is number => c !== undefined);
                  const avgConfidence =
                    confidences.length > 0
                      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
                      : 1.0;

                  onTranscript({
                    text: transcript,
                    confidence: avgConfidence,
                    isPartial,
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Transcribe streaming error:", error);
        
        // Log full error details for debugging
        if (error && typeof error === 'object') {
          const errorObj = error as Record<string, unknown>;
          console.error("Error details:", {
            name: errorObj.name,
            message: errorObj.message,
            $metadata: errorObj.$metadata,
            $response: errorObj.$response,
          });
        }
        
        const errorName = error instanceof Error ? error.name : "Unknown";
        
        if (errorName === "ThrottlingException") {
          onError("Rate limit exceeded. Please wait and try again.");
        } else if (errorName === "BadRequestException") {
          onError("Invalid audio format. Please check your microphone settings.");
        } else if (errorName === "UnrecognizedClientException" || errorName === "AccessDeniedException") {
          // Clear cache and retry on next attempt
          clientRef.current = null;
          cachedCredentialProvider = null;
          cachedIdToken = null;
          onError("Session expired. Please refresh and try again.");
        } else {
          onError("Transcription failed. Please try again.");
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [initializeClient, createAudioStream, onTranscript, onError, onReady, isClientReady]
  );

  const sendAudioChunk = useCallback(async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      audioChunksRef.current.push(uint8Array);
    } catch (error) {
      console.error("Failed to send audio chunk:", error);
    }
  }, []);

  const closeStream = useCallback(() => {
    isStreamActiveRef.current = false;
    setIsStreaming(false);
    audioStreamRef.current = null;
    audioChunksRef.current = [];
  }, []);

  return {
    isStreaming,
    isClientReady,
    startStream,
    sendAudioChunk,
    closeStream,
  };
}
