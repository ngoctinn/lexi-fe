/**
 * Admin role verification utilities
 * Check if current user has admin role from database profile
 */

import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { getProfile } from "@/features/profile/api/profile.actions";

/**
 * Check if current user is admin
 * Reads user profile from database and verifies admin role
 * 
 * Returns true if user has admin role, false otherwise
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    // First check if user is authenticated
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });

    if (!session.tokens?.idToken) {
      return false;
    }

    // Get profile from database and check role
    const profile = await getProfile();
    return profile?.role === "ADMIN";
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
