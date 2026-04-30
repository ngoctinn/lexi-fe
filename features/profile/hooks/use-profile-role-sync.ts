"use client";

import { useEffect } from "react";

/**
 * Sync user role to localStorage for client-side feature flags
 * This enables admin users to see debug metrics in conversation UI
 */
export function useProfileRoleSync(role?: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (role) {
      localStorage.setItem("user_role", role);
    } else {
      localStorage.removeItem("user_role");
    }
  }, [role]);
}
