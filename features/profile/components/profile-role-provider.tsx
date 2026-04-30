"use client";

import { useProfileRoleSync } from "../hooks/use-profile-role-sync";

interface ProfileRoleProviderProps {
  role?: string;
  children: React.ReactNode;
}

/**
 * Client component that syncs user role to localStorage
 * This enables admin users to see debug metrics in conversation UI
 */
export function ProfileRoleProvider({ role, children }: ProfileRoleProviderProps) {
  useProfileRoleSync(role);
  return <>{children}</>;
}
