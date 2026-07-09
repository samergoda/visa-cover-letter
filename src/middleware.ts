import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ["/login", "/api/auth", "/applicants/new", "/api/applicants"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. If it's an API route, static asset, or PWA file, bypass next-intl middleware
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icons")
  ) {
    // Perform standard auth check for protected API routes
    if (pathname.startsWith("/api")) {
      if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
      }
      const auth = request.cookies.get("app_auth");
      if (auth?.value === "1") {
        return NextResponse.next();
      }
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return NextResponse.next();
  }

  // 2. Run i18n middleware for pages
  const response = intlMiddleware(request);

  // If next-intl decided to redirect, return its response
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // 3. For pages, check authentication
  const segments = pathname.split("/");
  const hasLocale = ["en", "ar"].includes(segments[1]);
  const cleanPathname = hasLocale ? "/" + segments.slice(2).join("/") : pathname;

  // Allow public pages through
  if (PUBLIC_PATHS.some((p) => cleanPathname === p || cleanPathname.startsWith(p + "/"))) {
    return response;
  }

  const auth = request.cookies.get("app_auth");
  if (auth?.value === "1") {
    return response;
  }

  // Redirect to login for non-authenticated requests
  const locale = hasLocale ? segments[1] : "en";
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `/${locale}/login`;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/).*)"],
};
