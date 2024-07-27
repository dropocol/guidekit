// import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
// import { auth } from "@/auth";
// export { auth as middleware } from "@/auth";
import { NextResponse } from "next/server";
// import { auth } from "@/auth"; // Ensure this is the correct path to your auth function

interface CustomNextRequest extends NextRequest {
  auth?: {
    user: string;
  };
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default auth(async function middleware(req: NextRequest) {
  // export default auth(async (req) => {
  const url = req.nextUrl;
  console.log("REQ AUTH : ", req);

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  let hostname = req.headers.get("host")!;
  console.log("Original Hostname:", hostname);

  hostname = hostname.replace(
    ".localhost:3000",
    `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
  );
  console.log("Modified Hostname:", hostname);

  // Special case for Vercel preview deployment URLs
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
    console.log("Vercel Preview Hostname:", hostname);
  }

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${searchParams ? `?${searchParams}` : ""}`;
  console.log("Path:", path);

  // Your existing logic for session handling and redirection
  const session = await auth();
  console.log("Session:", session);

  if (hostname === `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    if (!session && path !== "/login" && path !== "/register") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (session && (path === "/login" || path === "/register")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.rewrite(
      new URL(`/app.guidekit.co${path === "/" ? "" : path}`, req.url),
    );
  }

  return NextResponse.next();
});
