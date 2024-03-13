import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function allowCors(response: NextResponse): Promise<NextResponse> {
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Fredirect"
  );
  response.headers.set("Access-Control-Allow-Methods", "OPTIONS,GET");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  const response = NextResponse.next();
  // Cache response for 24 hours
  response.headers.set("Cache-Control", "max-age=86400");
  return allowCors(response);
}

export const config = {
  matcher: "/api/:path*"
};
