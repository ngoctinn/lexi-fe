"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { toast } from "sonner";

/**
 * OAuth Callback Handler
 * 
 * This page handles the OAuth callback from Cognito after Google login.
 * It exchanges the authorization code for tokens and stores them in cookies.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log URL parameters
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");
        const errorDesc = searchParams.get("error_description");
        
        console.log("[OAuth Callback] URL params:", { code: !!code, state: !!state, error: errorParam, errorDesc });
        setDebugInfo(prev => [...prev, `URL params: code=${!!code}, state=${!!state}`]);
        
        // Check for OAuth error in URL
        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam} - ${errorDesc}`);
        }
        
        // Check if we have the authorization code
        if (!code) {
          throw new Error("No authorization code in URL");
        }
        
        setDebugInfo(prev => [...prev, "Fetching auth session..."]);
        console.log("[OAuth Callback] Fetching auth session...");
        
        // Amplify automatically handles the authorization code exchange
        const session = await fetchAuthSession();
        
        console.log("[OAuth Callback] Session:", {
          hasTokens: !!session?.tokens,
          hasIdToken: !!session?.tokens?.idToken,
          hasAccessToken: !!session?.tokens?.accessToken,
        });
        setDebugInfo(prev => [...prev, `Session fetched: hasTokens=${!!session?.tokens}`]);
        
        if (!session?.tokens) {
          throw new Error("No tokens received from Cognito");
        }

        setDebugInfo(prev => [...prev, "Getting current user..."]);
        console.log("[OAuth Callback] Getting current user...");
        
        // Verify user is authenticated
        const user = await getCurrentUser();
        
        console.log("[OAuth Callback] User:", user);
        setDebugInfo(prev => [...prev, `User: ${user?.username || 'null'}`]);
        
        if (!user) {
          throw new Error("Failed to get user information");
        }

        console.log("[OAuth Callback] Authentication successful!");
        setDebugInfo(prev => [...prev, "Success! Redirecting..."]);

        // Success - redirect to dashboard
        toast.success("Đăng nhập thành công!");
        
        // Use window.location for immediate redirect
        window.location.href = "/dashboard";
        
      } catch (err) {
        console.error("[OAuth Callback] Error:", err);
        console.error("[OAuth Callback] Error stack:", err instanceof Error ? err.stack : 'No stack');
        
        const errorMessage = err instanceof Error ? err.message : "Authentication failed";
        setError(errorMessage);
        setDebugInfo(prev => [...prev, `Error: ${errorMessage}`]);
        
        // Redirect to login after 5 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 5000);
      }
    };

    handleCallback();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold">Authentication Failed</h1>
          <p className="text-muted-foreground">{error}</p>
          
          {/* Debug info */}
          <div className="mt-4 p-4 bg-muted rounded text-left text-xs font-mono">
            {debugInfo.map((info, i) => (
              <div key={i}>{info}</div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h1 className="text-xl font-semibold">Authenticating...</h1>
        <p className="text-muted-foreground">Please wait while we complete your login</p>
        
        {/* Debug info */}
        <div className="mt-4 p-4 bg-muted rounded text-left text-xs font-mono max-w-md">
          {debugInfo.map((info, i) => (
            <div key={i}>{info}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
