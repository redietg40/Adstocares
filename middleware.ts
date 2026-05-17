export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/admin/:path*",
    "/company/dashboard/:path*",
    "/company/products/:path*",
    "/company/add-product/:path*",
    "/company/payments/:path*",
  ],
};