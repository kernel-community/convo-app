import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Capture the hostname and extract subdomain
  const host = request.headers.get("host") || "";
  const subdomain = host.split(".")[0];

  // Add the subdomain to request headers
  const requestHeaders = new Headers(request.headers);
  // Always set a valid string value for the subdomain header
  requestHeaders.set("x-subdomain", subdomain || "default");

  // We'll skip the database lookup in middleware to avoid issues with edge functions
  // The actual community resolution will happen in the API layer using this subdomain

  // Clone the request with new headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  // Apply this middleware to API routes and the main app
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
