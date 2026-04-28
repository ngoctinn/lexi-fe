"use client";

import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";
import { amplifyConfig } from "@/lib/amplify-config";
import * as React from "react";

// Configure cookie storage BEFORE Amplify.configure
// This ensures tokens are stored in cookies for SSR compatibility
if (typeof window !== "undefined") {
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  cognitoUserPoolsTokenProvider.setKeyValueStorage(
    new CookieStorage({
      domain: window.location.hostname,
      path: "/",
      expires: 365,
      secure: !isLocalhost, // Secure only in production (HTTPS)
      sameSite: isLocalhost ? "lax" : "none", // Must be lowercase: "lax", "strict", or "none"
    })
  );
}

// Configure Amplify AFTER setting up cookie storage
Amplify.configure(amplifyConfig, { 
  ssr: true,
});

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
