/**
 * Admin role verification utilities
 * Check if current user has admin role from JWT token
 */

import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

/**
 * Check if current user is admin
 * Reads JWT token and verifies admin role
 * 
 * Returns true if user has admin role, false otherwise
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });

    // Check for admin role in JWT claims
    // Role can be in different places depending on Cognito setup:
    // 1. custom:role attribute
    // 2. cognito:groups
    // 3. role claim
    
    const idToken = session.tokens?.idToken;
    if (!idToken) {
      return false;
    }

    // Decode JWT payload (without verification - already verified by Amplify)
    const payload = idToken.payload as Record<string, unknown>;
    
    // Check custom:role attribute (most common)
    const customRole = payload["custom:role"];
    if (customRole === "admin") {
      return true;
    }

    // Check cognito:groups
    const groups = payload["cognito:groups"] as string[] | undefined;
    if (groups?.includes("admin")) {
      return true;
    }

    // Check role claim
    const role = payload["role"];
    if (role === "admin") {
      return true;
    }

    return false;
  } catch (error) {
    console.error("[auth] Failed to check admin role:", error);
    return false;
  }
}

/**
 * Require admin role - throws error if not admin
 * Use in Server Components that must be admin-only
 */
export async function requireAdminRole(): Promise<void> {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin role required");
  }
}
