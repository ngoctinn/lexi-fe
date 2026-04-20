import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import {
  MOCK_AUTH_COOKIE_NAME,
  MOCK_AUTH_COOKIE_VALUE,
} from "@/features/auth/mock-auth";

/**
 * Proxy xử lý Authentication và Route Guard
 * Chỉ gọi API heavy khi cần thiết để tránh bottleneck trên public route
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/flashcards") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/onboarding") || // Cần login mới được onboarding
    pathname.startsWith("/learn") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/session") ||
    pathname.startsWith("/sessions") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/shop");

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  // Nếu không phải auth route và không phải protected route thì bỏ qua nhanh
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const isMockAuthenticated =
    request.cookies.get(MOCK_AUTH_COOKIE_NAME)?.value ===
    MOCK_AUTH_COOKIE_VALUE;

  let authenticated = false;
  if (isMockAuthenticated) {
    authenticated = true;
  } else {
    authenticated = await runWithAmplifyServerContext({
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
  }

  if (isProtectedRoute && !authenticated) {
    const loginUrl = new URL("/login", request.url);
    // Lưu lại URL đang định truy cập để redirect sau khi login thành công
    const callbackUrl = `${pathname}${search}`;
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && authenticated) {
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
