import { NextResponse } from "next/server";

async function allowCors(request, response) {
  try {
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Fredirect"
    );
    response.headers.set("Access-Control-Allow-Methods", "OPTIONS,GET");
    response.headers.set("Access-Control-Allow-Credentials", true);

    return response;
  } catch (error) {
    console.error("Middleware error:", { error });
  }
}

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  const response = NextResponse.next();
  // Cache for 1 minute
  response.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate");
  return allowCors(request, response);
}

export const config = {
  matcher: "/api/:path*"
};
