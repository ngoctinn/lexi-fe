import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return session.tokens !== undefined;
      } catch (error) {
        return false;
      }
    },
  });

  // Protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") || 
                          request.nextUrl.pathname.startsWith("/vocabulary") ||
                          request.nextUrl.pathname.startsWith("/profile");

  if (isProtectedRoute && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Auth routes (redirect to dashboard if already logged in)
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || 
                      request.nextUrl.pathname.startsWith("/signup");

  if (isAuthRoute && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vocabulary/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
  ],
};
