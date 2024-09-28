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

  // Handle ngrok URLs
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost && forwardedHost.includes("loca.lt")) {
    console.log("Ngrok detected, using forwarded host:", forwardedHost);
    hostname = forwardedHost;
  }

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

  // // Handle root domain
  // if (hostname === "contentbay.co") {
  //   return NextResponse.rewrite(new URL(`/home${url.pathname}`, req.url));
  // }

  // // Handle app subdomain
  // if (hostname === "app.contentbay.co") {
  //   const session = await auth(req as any);
  //   if (
  //     !session &&
  //     !url.pathname.startsWith("/login") &&
  //     !url.pathname.startsWith("/register")
  //   ) {
  //     return NextResponse.redirect(new URL("/login", req.url));
  //   }
  //   return NextResponse.rewrite(new URL(`/app${url.pathname}`, req.url));
  // }

  // // Handle wildcard subdomains for knowledgebases
  // if (hostname.endsWith(".contentbay.co") && hostname !== "app.contentbay.co") {
  //   const subdomain = hostname.replace(
  //     `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
  //     "",
  //   );
  //   return NextResponse.rewrite(
  //     new URL(`/${subdomain}${url.pathname}`, req.url),
  //   );
  // }

  // // Handle Vercel deployment URLs
  // if (
  //   hostname.includes("---") &&
  //   hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  // ) {
  //   const subdomain = hostname.split("---")[0];
  //   return NextResponse.rewrite(
  //     new URL(`/${subdomain}${url.pathname}`, req.url),
  //   );
  // }

  if (
    hostname === `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` ||
    hostname === "app.localhost" ||
    hostname.includes("ngrok-free.app") // Add this condition for ngrok
  ) {
    const session = await auth(req as any);

    console.log("Processed hostname:", hostname);

    if (!session && path !== "/login" && path !== "/register") {
      console.log("No session, redirecting to login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (session && (path === "/login" || path === "/register")) {
      const newPath = `/app.guidekit.co${path}`;
      console.log("Rewriting URL to serve from app.guidekit.co:", newPath);
      return NextResponse.rewrite(new URL(newPath, req.url));
    }

    // Rewrite the URL to serve from app.guidekit.co while keeping the URL structure
    const newPath = `/app.guidekit.co${path}`;
    console.log("Rewriting URL to serve from app.guidekit.co:", newPath);
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
    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, req.url),
    );
  }

  // if (req.nextUrl.pathname === "/api/auth/session" && req.method === "GET") {
  //   // #This fixes the cookie race condition and prevents GET requests from overwriting the cookies with potentially outdated values
  //   return await interceptGetSessionRequest(req);
  // }
  // return NextResponse.next();

  console.log("Default rewrite for hostname:", hostname);
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
// export default async function middleware(req: NextRequest) {
//   const url = req.nextUrl;
//   let hostname = req.headers.get("host")!;

//   // Handle IPv6 localhost
//   if (hostname === "[::1]:3000") {
//     hostname = "localhost:3000";
//   }

//   // Rest of your existing code...
//   hostname = hostname.replace(
//     ".localhost:3000",
//     `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
//   );

//   if (
//     hostname.includes("---") &&
//     hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
//   ) {
//     hostname = `${hostname.split("---")[0]}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
//   }

//   const searchParams = req.nextUrl.searchParams.toString();
//   const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

//   // Your existing conditions...
//   if (hostname === "vercel.pub") {
//     return NextResponse.redirect(
//       "https://vercel.com/blog/platforms-starter-kit",
//     );
//   }

//   if (
//     hostname === "localhost:3000" ||
//     hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
//     hostname === "[::1]:3000"
//   ) {
//     return NextResponse.rewrite(
//       new URL(`/home${path === "/" ? "" : path}`, req.url),
//     );
//   }

//   console.log("Default rewrite for hostname:", hostname);
//   return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
// }
