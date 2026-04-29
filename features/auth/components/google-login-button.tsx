"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { signInWithRedirect } from "aws-amplify/auth";
import { toast } from "sonner";
import { Icons } from "@/components/icons";

interface GoogleLoginButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
}

export function GoogleLoginButton({
  isLoading = false,
  disabled = false,
}: GoogleLoginButtonProps) {
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      console.log("[Google Login] Starting OAuth flow...");
      
      await signInWithRedirect({
        provider: "Google",
      });
      
      // Note: This code won't execute because signInWithRedirect redirects the page
      console.log("[Google Login] Redirect initiated");
      
    } catch (error) {
      console.error("[Google Login] Error:", error);
      console.error("[Google Login] Error details:", JSON.stringify(error, null, 2));
      
      // More specific error messages
      let errorMessage = "Không thể đăng nhập bằng Google. Vui lòng thử lại.";
      
      if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("Network")) {
          errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.";
        } else if (error.message.includes("configuration") || error.message.includes("Configuration")) {
          errorMessage = "Lỗi cấu hình OAuth. Vui lòng liên hệ hỗ trợ.";
        }
      }
      
      toast.error(errorMessage);
      setIsSigningIn(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="xl"
      className="w-full text-base"
      onClick={handleGoogleSignIn}
      disabled={isLoading || isSigningIn || disabled}
    >
      {isSigningIn ? (
        <>
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          Đang kết nối...
        </>
      ) : (
        <>
          <Icons.google className="mr-2 h-4 w-4" />
          Đăng nhập bằng Google
        </>
      )}
    </Button>
  );
}
