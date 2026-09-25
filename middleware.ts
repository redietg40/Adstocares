import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    if (req.nextUrl.pathname.startsWith("/company")) {
      return NextResponse.redirect(new URL("/company/login", req.url));
    }
    if (req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If the user tries to access /admin, verify they have the admin role
  if (
    req.nextUrl.pathname.startsWith("/admin") &&
    token.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // If the user tries to access /company, verify they have the company role
  if (
    req.nextUrl.pathname.startsWith("/company") &&
    token.role !== "company"
  ) {
    return NextResponse.redirect(new URL("/company/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/company/dashboard/:path*",
    "/company/products/:path*",
    "/company/add-product/:path*",
    "/company/payments/:path*",
  ],
};