import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(
  (auth, req) => {
    // Basic subdomain handling only
    const host = req.headers.get("host") || "";
    const subdomain = host.split(".")[0];

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-subdomain", subdomain || "default");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  // { authorizedParties: ["www.convo.cafe"] }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
