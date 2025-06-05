import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/signin(.*)", // Catch-all for signin routes
  "/signup(.*)", // Catch-all for signup routes
  "/",
  "/api/beta-access/check",
  "/sso-callback", // For SSO authentication
  // Allow public access to event pages and other core routes
  "/((?!profile|nook|edit).*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    try {
      // For protected routes, require authentication
      if (!isPublicRoute(req)) {
        const authResult = await auth();
        if (!authResult.userId) {
          // Redirect to signin if not authenticated
          const signInUrl = new URL("/signin", req.url);
          return NextResponse.redirect(signInUrl);
        }
      }

      // Preserve existing subdomain logic for community features
      const host = req.headers.get("host") || "";
      const subdomain = host.split(".")[0];

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-subdomain", subdomain || "default");

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("Middleware error:", error);
      // Return a basic response instead of failing completely
      return NextResponse.next();
    }
  },
  {
    debug: true,
    authorizedParties: ["www.convo.cafe"],
  }
);

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
