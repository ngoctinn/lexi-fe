"use client";

import { Amplify } from "aws-amplify";
import { amplifyConfig } from "@/lib/amplify-config";
import React, { useEffect } from "react";

// Configure Amplify once on the client side
Amplify.configure(amplifyConfig, { ssr: true });

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  // useEffect ensures any client-side specific logic can be added here
  return <>{children}</>;
}
