import { type NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE, verifyToken } from "@/lib/auth";

const authPages = ["/login", "/register", "/reset-password"];

const publicPaths = [
  ...authPages,
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/health",
];

function matchesPath(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isStaticAsset(pathname: string) {
  return pathname.startsWith("/_next") || pathname.startsWith("/favicon");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (matchesPath(pathname, authPages)) {
    if (payload) {
      return NextResponse.redirect(new URL("/today", request.url));
    }
    return NextResponse.next();
  }

  if (matchesPath(pathname, publicPaths) || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (!payload) {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    if (token) {
      response.cookies.delete(TOKEN_COOKIE);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
