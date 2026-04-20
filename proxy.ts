import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import {
  MOCK_AUTH_COOKIE_NAME,
  MOCK_AUTH_COOKIE_VALUE,
} from "@/features/auth/mock-auth";

/**
 * Middleware xử lý Authentication và Route Guard
 * Ưu tiên sự tinh gọn, không gọi API heavy ở đây để tránh bottleneck
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Kiểm tra trạng thái Authenticated qua Amplify Server Context
  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return session.tokens !== undefined;
      } catch {
        return false;
      }
    },
  });

  const { pathname } = request.nextUrl;
  const isMockAuthenticated =
    request.cookies.get(MOCK_AUTH_COOKIE_NAME)?.value ===
    MOCK_AUTH_COOKIE_VALUE;

  // 2. Nhóm Route cần được bảo vệ (Yêu cầu đăng nhập)
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/flashcards") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/onboarding") || // Cần login mới được onboarding
    pathname.startsWith("/learn") ||
    pathname.startsWith("/practice");

  if (isProtectedRoute && !authenticated && !isMockAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Lưu lại URL đang định truy cập để redirect sau khi login thành công
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Nhóm Auth Route (Redirect về dashboard nếu đã đăng nhập)
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  if (isAuthRoute && (authenticated || isMockAuthenticated)) {
    // Nếu đã login mà cố vào trang login/signup => về dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
