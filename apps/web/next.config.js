/** @type {import('next').NextConfig} */

module.exports = {
  // output: "export",
  // output: "standalone",
  // distDir: "build",
  experimental: {
    serverComponentsExternalPackages: ["keyv", "cacheable-request", "got"],
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "[::1]:3000",
        "localhost:3000",
        "app.localhost:3000",
        "guidekit.vercel.app",
        "app.guidekit.cc",
        "*.guidekit.cc",
        "guidekit.cc",
      ],
    },
  },
  images: {
    remotePatterns: [
      { hostname: "public.blob.vercel-storage.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "abs.twimg.com" },
      { hostname: "pbs.twimg.com" },
      { hostname: "avatar.vercel.sh" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "www.google.com" },
      { hostname: "flag.vercel.app" },
      { hostname: "illustrations.popsy.co" },
      { hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};
