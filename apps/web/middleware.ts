import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { auth } from "@/auth";
import { authConfig } from "@/lib/auth.config";
export const { auth } = NextAuth(authConfig);

export const config = {
  // matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  var hostname = req.headers.get("host")!;

  // // Handle IPv6 localhost
  if (hostname.includes("[::1]")) {
    let forwardedHost = req.headers.get("x-forwarded-host") || "";
    hostname = forwardedHost;
  }

  hostname = hostname.replace(
    ".localhost:3000",
    `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
  );

  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  }

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  if (
    hostname === `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` ||
    hostname === "app.localhost"
  ) {
    const session = await auth(req as any);

    if (!session && path !== "/login" && path !== "/register") {
      console.log("No session, redirecting to login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (session && (path === "/login" || path === "/register")) {
      const newPath = `/app.guidekit.co${path}`;
      // console.log("Rewriting URL to serve from app.guidekit.co:", newPath);
      return NextResponse.rewrite(new URL(newPath, req.url));
    }

    // Rewrite the URL to serve from app.guidekit.co while keeping the URL structure
    const newPath = `/app.guidekit.co${path}`;
    // console.log("Rewriting URL to serve from app.guidekit.co:", newPath);
    return NextResponse.rewrite(new URL(newPath, req.url));
  }

  if (
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, req.url),
    );
  }

  // console.log("Default rewrite for hostname:", hostname);
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
