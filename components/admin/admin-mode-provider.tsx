"use client";

import { useEffect, useState } from "react";
import { AdminModeBanner } from "./admin-mode-banner";

interface AdminModeProviderProps {
  isAdmin?: boolean;
}

/**
 * Provider hiển thị admin banner khi user là admin
 * Banner sẽ xuất hiện ở top của toàn bộ layout
 */
export function AdminModeProvider({ isAdmin }: AdminModeProviderProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check from prop or localStorage
    const isAdminUser = isAdmin || (typeof window !== "undefined" && localStorage.getItem("user_role") === "ADMIN");
    setShowBanner(isAdminUser);
  }, [isAdmin]);

  if (!showBanner) return null;

  return <AdminModeBanner />;
}
