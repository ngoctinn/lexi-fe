"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { AuthActionState } from "../api/auth.actions";

export function useAuthForm<T extends (...args: any[]) => Promise<AuthActionState>>(
  actionFn: T,
  initialState: AuthActionState = { success: false, message: "" }
) {
  const [state, action, isPending] = useActionState(actionFn, initialState);

  React.useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state.message, state.success, state.errors]);

  return {
    state,
    action,
    isPending,
  };
}
