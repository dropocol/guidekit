import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

interface CustomNextRequest extends NextRequest {
  auth?: {
    user: string;
  };
}

export const config = {
  // matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};
async function interceptGetSessionRequest(request: NextRequest) {
  const session = await auth();
  return NextResponse.json(session);
}

export default async function middleware(req: NextRequest) {
  console.log(
    `Request received: ${req.nextUrl.pathname}, Method: ${req.method}`,
  );
  const url = req.nextUrl;
  let hostname = req.headers.get("host")!;

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

  // console.log("Path:", path);

  if (
    hostname === `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` ||
    hostname === "app.localhost"
  ) {
    const session = await auth(req as any);

    if (!session && path !== "/login" && path !== "/register") {
      // console.log("No session, redirecting to login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (session && (path === "/login" || path === "/register")) {
      // console.log("Session present, redirecting to home");
      // return NextResponse.redirect(new URL("/", req.url));
      const newPath = `/app.guidekit.co${path}`;
      // console.log("Rewriting URL to serve from app.guidekit.co:", newPath);
      return NextResponse.rewrite(new URL(newPath, req.url));
    }

    // Rewrite the URL to serve from app.guidekit.co while keeping the URL structure
    const newPath = `/app.guidekit.co${path}`;
    // console.log("Rewriting URL to serve from app.guidekit.co:", newPath);
    return NextResponse.rewrite(new URL(newPath, req.url));
  }

  if (hostname === "vercel.pub") {
    // console.log("Redirecting to Vercel blog");
    return NextResponse.redirect(
      "https://vercel.com/blog/platforms-starter-kit",
    );
  }

  if (
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    // console.log("Rewriting URL to /home");
    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, req.url),
    );
  }

  // if (req.nextUrl.pathname === "/api/auth/session" && req.method === "GET") {
  //   // #This fixes the cookie race condition and prevents GET requests from overwriting the cookies with potentially outdated values
  //   return await interceptGetSessionRequest(req);
  // }
  // return NextResponse.next();

  // console.log("Default rewrite for hostname:", hostname);
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
