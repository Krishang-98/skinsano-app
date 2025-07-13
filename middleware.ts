import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()

    // Add security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

    // CORS headers for API routes
    if (request.nextUrl.pathname.startsWith("/api/")) {
      response.headers.set(
        "Access-Control-Allow-Origin",
        process.env.NODE_ENV === "production" ? "https://yourdomain.com" : "*",
      )
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

      // Handle preflight requests
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 200, headers: response.headers })
      }
    }

    // Rate limiting for API routes (basic implementation)
    if (request.nextUrl.pathname.startsWith("/api/")) {
      const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
      console.log(`API request from IP: ${ip} to ${request.nextUrl.pathname}`)
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
