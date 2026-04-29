/**
 * OAuth Debug Utilities
 * Helper functions to debug OAuth configuration and flow
 */

export interface OAuthDebugInfo {
  currentUrl: string;
  hasCode: boolean;
  hasState: boolean;
  hasError: boolean;
  errorDetails?: string;
  amplifyConfig: {
    domain: string;
    redirectSignIn: string[];
    redirectSignOut: string[];
    scopes: string[];
  };
  expectedRedirectUrl: string;
}

export function getOAuthDebugInfo(): OAuthDebugInfo {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  
  return {
    currentUrl: window.location.href,
    hasCode: !!code,
    hasState: !!state,
    hasError: !!error,
    errorDetails: error ? `${error}: ${errorDescription}` : undefined,
    amplifyConfig: {
      domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "",
      redirectSignIn: [
        "http://localhost:3000/oauth-callback",
        "https://ngoctin.me/oauth-callback",
      ],
      redirectSignOut: [
        "http://localhost:3000/login",
        "https://ngoctin.me/login",
      ],
      scopes: ["email", "openid", "profile"],
    },
    expectedRedirectUrl: window.location.origin + "/oauth-callback",
  };
}

export function validateOAuthConfig(): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_COGNITO_DOMAIN) {
    issues.push("Missing NEXT_PUBLIC_COGNITO_DOMAIN");
  }
  
  if (!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID) {
    issues.push("Missing NEXT_PUBLIC_COGNITO_USER_POOL_ID");
  }
  
  if (!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID) {
    issues.push("Missing NEXT_PUBLIC_COGNITO_CLIENT_ID");
  }
  
  // Check redirect URL configuration
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const expectedRedirectUrl = currentOrigin + "/oauth-callback";
  
  const configuredUrls = [
    "http://localhost:3000/oauth-callback",
    "https://ngoctin.me/oauth-callback",
  ];
  
  if (currentOrigin && !configuredUrls.some(url => url.startsWith(currentOrigin))) {
    issues.push(`Current origin ${currentOrigin} not in configured redirect URLs: ${configuredUrls.join(", ")}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

export function logOAuthDebugInfo() {
  const debugInfo = getOAuthDebugInfo();
  const configValidation = validateOAuthConfig();
  
  console.group("[OAuth Debug]");
  console.log("Debug Info:", debugInfo);
  console.log("Config Validation:", configValidation);
  console.groupEnd();
  
  return { debugInfo, configValidation };
}