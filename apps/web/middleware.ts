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
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default auth(async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  let hostname = req.headers.get("host")!;

  console.log("Original hostname:", hostname);

  hostname = hostname.replace(
    ".localhost:3000",
    `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
  );

  console.log("Adjusted hostname:", hostname);

  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  }

  console.log("Final hostname after Vercel handling:", hostname);

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  console.log("Path:", path);

  if (
    hostname === `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` ||
    hostname === "app.localhost"
  ) {
    const session = await auth(req as any);
    console.log("Session:", session);

    if (!session && path !== "/login" && path !== "/register") {
      console.log("No session, redirecting to login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (session && (path === "/login" || path === "/register")) {
      console.log("Session present, redirecting to home");
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("Rewriting URL to /app.guidekit.co");
    return NextResponse.rewrite(
      new URL(`/app.guidekit.co${path === "/" ? "" : path}`, req.url),
    );
  }

  if (hostname === "vercel.pub") {
    console.log("Redirecting to Vercel blog");
    return NextResponse.redirect(
      "https://vercel.com/blog/platforms-starter-kit",
    );
  }

  if (
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    console.log("Rewriting URL to /home");
    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, req.url),
    );
  }

  console.log("Default rewrite for hostname:", hostname);
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
});
