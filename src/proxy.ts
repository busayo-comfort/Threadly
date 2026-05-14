import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/chat"];
const authRoutes = ["/login", "/register"];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // access token from cookies
  const accessToken = req.cookies.get("accessToken")?.value;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // not logged in
  if (isProtected && !accessToken) {
    const loginUrl = new URL("/login", req.url);

    loginUrl.searchParams.set("from", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // already logged in
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(
      new URL("/chat", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/login", "/register"],
};