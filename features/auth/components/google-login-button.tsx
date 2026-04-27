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
      await signInWithRedirect({
        provider: "Google",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Không thể đăng nhập bằng Google. Vui lòng thử lại.");
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
