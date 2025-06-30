import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Handle CORS preflight request
  if (request.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    preflight.headers.set("Access-Control-Allow-Origin", "*");
    preflight.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    preflight.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    preflight.headers.set("Access-Control-Max-Age", "86400");
    return preflight;
  }

  // For all other requests, continue and attach CORS headers
  // const response = await updateSession(request);
  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
