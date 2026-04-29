"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAuthSession, getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import { toast } from "sonner";

/**
 * OAuth Callback Handler
 * 
 * Amplify v6 automatically handles OAuth callback when signInWithRedirect is used.
 * This page waits for Amplify to complete the flow and redirects.
 * 
 * Flow:
 * 1. Cognito redirects here with ?code=xxx
 * 2. Amplify auto-exchanges code for tokens (stores in cookies)
 * 3. We fetch session to verify authentication
 * 4. Redirect to dashboard
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log URL params for debugging
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        console.log("[OAuth Callback] URL params:", { code: !!code, state: !!state, error, errorDescription });
        setDebugInfo(prev => [...prev, `URL params: code=${!!code}, state=${!!state}, error=${error || 'none'}`]);

        // Check for OAuth errors
        if (error) {
          throw new Error(errorDescription || error);
        }

        // Must have authorization code
        if (!code) {
          throw new Error("No authorization code in callback URL");
        }

        setDebugInfo(prev => [...prev, "Waiting for Amplify to exchange code..."]);
        console.log("[OAuth Callback] Waiting for Amplify to exchange code...");
        
        // Amplify v6 should auto-exchange the code, but we need to give it time
        // The exchange happens when we first call fetchAuthSession
        // Wait a moment for the page to fully load and Amplify to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDebugInfo(prev => [...prev, "Fetching auth session..."]);
        console.log("[OAuth Callback] Fetching auth session...");
        
        // This will trigger code exchange if not already done
        const session = await fetchAuthSession({ forceRefresh: true });
        
        console.log("[OAuth Callback] Session:", {
          hasTokens: !!session?.tokens,
          hasIdToken: !!session?.tokens?.idToken,
          hasAccessToken: !!session?.tokens?.accessToken,
        });
        
        setDebugInfo(prev => [...prev, `Session: hasTokens=${!!session?.tokens}`]);
        
        if (!session?.tokens) {
          throw new Error("No tokens in session after OAuth callback");
        }

        setDebugInfo(prev => [...prev, "Getting current user..."]);
        console.log("[OAuth Callback] Getting current user...");
        
        const user = await getCurrentUser();
        
        console.log("[OAuth Callback] User:", user);
        setDebugInfo(prev => [...prev, `User: ${user?.username || 'null'}`]);
        
        if (!user) {
          throw new Error("Failed to get user information");
        }

        console.log("[OAuth Callback] ✅ Authentication successful!");
        setDebugInfo(prev => [...prev, "✅ Authentication successful!"]);

        toast.success("Đăng nhập thành công!");
        
        // Small delay for toast to show
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect to dashboard or callback URL
        const callbackUrl = searchParams.get("callbackUrl");
        router.push(callbackUrl || "/dashboard");
        
      } catch (err) {
        console.error("[OAuth Callback] Error:", err);
        console.error("[OAuth Callback] Error details:", JSON.stringify(err, null, 2));
        
        const errorMessage = err instanceof Error ? err.message : "Authentication failed";
        setDebugInfo(prev => [...prev, `❌ Error: ${errorMessage}`]);
        
        toast.error(`Đăng nhập thất bại: ${errorMessage}`);
        
        // Redirect to login after delay
        setTimeout(() => {
          router.push("/login?error=oauth_failed");
        }, 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h1 className="text-xl font-semibold">Authenticating...</h1>
        <p className="text-muted-foreground">Please wait while we complete your login</p>
        
        <div className="mt-4 p-4 bg-muted rounded text-left text-xs font-mono max-w-md">
          {debugInfo.map((info, i) => (
            <div key={i}>{info}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
