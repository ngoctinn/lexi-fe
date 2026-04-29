"use client";

import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";
import { amplifyConfig } from "@/lib/amplify-config";
import * as React from "react";

// Configure Amplify on client-side only
if (typeof window !== "undefined") {
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  // For localhost, don't set domain (browser will use current domain)
  // For production, set domain to allow subdomain access
  const cookieDomain = isLocalhost ? undefined : ".ngoctin.me";
  
  // Configure cookie storage BEFORE Amplify.configure
  // This ensures tokens are stored in cookies for SSR compatibility
  cognitoUserPoolsTokenProvider.setKeyValueStorage(
    new CookieStorage({
      domain: cookieDomain,
      path: "/",
      expires: 365,
      secure: !isLocalhost, // Secure only in production (HTTPS)
      sameSite: isLocalhost ? "lax" : "none", // Must be lowercase: "lax", "strict", or "none"
    })
  );
  
  console.log("[Amplify] Cookie storage configured:", {
    domain: cookieDomain || "current domain",
    isLocalhost,
    hostname: window.location.hostname,
    secure: !isLocalhost,
    sameSite: isLocalhost ? "lax" : "none",
  });
  
  // Configure Amplify AFTER setting up cookie storage
  Amplify.configure(amplifyConfig, { 
    ssr: true,
  });
  
  console.log("[Amplify] Configured with:", {
    userPoolId: amplifyConfig.Auth?.Cognito?.userPoolId,
    clientId: amplifyConfig.Auth?.Cognito?.userPoolClientId,
    domain: amplifyConfig.Auth?.Cognito?.loginWith?.oauth?.domain,
  });
}

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
