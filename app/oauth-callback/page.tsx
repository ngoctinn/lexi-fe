"use client";

// CRITICAL: Import OAuth listener for multi-page applications
// This enables Amplify to complete OAuth code exchange in Next.js
import "aws-amplify/auth/enable-oauth-listener";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { toast } from "sonner";

/**
 * OAuth Callback Handler for Multi-Page Applications
 * 
 * AWS Amplify requires explicit OAuth listener import for Next.js apps.
 * 
 * Flow:
 * 1. Cognito redirects here with ?code=xxx
 * 2. OAuth listener (imported above) auto-exchanges code for tokens
 * 3. Hub emits "signInWithRedirect" event when complete
 * 4. We handle the event and redirect to dashboard
 * 
 * Refs:
 * - https://docs.amplify.aws/react/build-a-backend/auth/concepts/external-identity-providers/
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    console.log("[OAuth Callback] Waiting for Amplify to handle OAuth callback...");
    setDebugInfo(prev => [...prev, "Waiting for OAuth listener..."]);

    // Check for OAuth errors in URL
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    if (error) {
      console.error("[OAuth Callback] OAuth error:", error, errorDescription);
      setDebugInfo(prev => [...prev, `❌ OAuth error: ${error}`]);
      toast.error(`Đăng nhập thất bại: ${errorDescription || error}`);
      
      setTimeout(() => {
        router.push("/login?error=oauth_failed");
      }, 2000);
      return;
    }

    // Listen for OAuth completion events from Amplify Hub
    const unsubscribe = Hub.listen("auth", async ({ payload }) => {
      console.log("[OAuth Callback] Hub event:", payload.event);
      setDebugInfo(prev => [...prev, `Hub event: ${payload.event}`]);

      switch (payload.event) {
        case "signInWithRedirect":
          try {
            console.log("[OAuth Callback] ✅ OAuth sign-in successful!");
            setDebugInfo(prev => [...prev, "✅ OAuth successful, getting user..."]);
            
            // Get user info (don't fetch attributes for OAuth - not all scopes available)
            const user = await getCurrentUser();
            
            console.log("[OAuth Callback] User:", user);
            setDebugInfo(prev => [...prev, `User: ${user.username}`]);
            
            toast.success("Đăng nhập thành công!");
            
            // Small delay for toast
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Redirect to dashboard
            const callbackUrl = searchParams.get("callbackUrl");
            router.push(callbackUrl || "/dashboard");
            
          } catch (err) {
            console.error("[OAuth Callback] Error getting user:", err);
            setDebugInfo(prev => [...prev, `❌ Error: ${err instanceof Error ? err.message : 'Unknown'}`]);
            
            toast.error("Không thể lấy thông tin người dùng");
            
            setTimeout(() => {
              router.push("/login?error=user_fetch_failed");
            }, 2000);
          }
          break;

        case "signInWithRedirect_failure":
          console.error("[OAuth Callback] OAuth sign-in failed:", payload.data);
          setDebugInfo(prev => [...prev, `❌ Sign-in failed: ${JSON.stringify(payload.data)}`]);
          
          const errorMsg = payload.data?.message || "Authentication failed";
          toast.error(`Đăng nhập thất bại: ${errorMsg}`);
          
          setTimeout(() => {
            router.push("/login?error=oauth_failed");
          }, 2000);
          break;

        case "customOAuthState":
          // Handle custom state if needed
          const state = payload.data;
          console.log("[OAuth Callback] Custom OAuth state:", state);
          setDebugInfo(prev => [...prev, `Custom state: ${state}`]);
          break;
      }
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h1 className="text-xl font-semibold">Authenticating...</h1>
        <p className="text-muted-foreground">Please wait while we complete your login</p>
        
        {debugInfo.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded text-left text-xs font-mono max-w-md">
            {debugInfo.map((info, i) => (
              <div key={i}>{info}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
