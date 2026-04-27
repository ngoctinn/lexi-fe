import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";

/**
 * Hook để xử lý redirect sau khi OAuth sign-in thành công
 * Kiểm tra nếu user đã đăng nhập thì redirect đến dashboard
 */
export function useOAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          // User is already signed in, redirect to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        // User is not signed in, stay on current page
        console.debug("User not authenticated");
      }
    };

    checkAuthStatus();
  }, [router]);
}
