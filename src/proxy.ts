import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { authEnabled } from "@/lib/auth";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/claim(.*)",
]);

const clerkProxy = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

/**
 * Next.js 16 request proxy. Clerk protects account and internal surfaces when
 * Marketplace keys are configured; CI and keyless local development retain
 * the existing guest/demo fallback.
 */
export default authEnabled()
  ? clerkProxy
  : function guestProxy(_request: NextRequest) {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
