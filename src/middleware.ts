import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware(
  (auth, request: NextRequest) => {
    try {
      // Basic subdomain handling only
      const host = request.headers.get("host") || "";
      const subdomain = host.split(".")[0];

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-subdomain", subdomain || "default");

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("Simple middleware error:", error);
      return NextResponse.next();
    }
  },
  { debug: true }
);

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
