/** @type {import('next').NextConfig} */

module.exports = {
  // output: "export",
  // output: "standalone",
  // distDir: "build",
  experimental: {
    serverActions: {
      allowedOrigins: [
        "[::1]:3000",
        "app.localhost:3000",
        "guidekit.vercel.app",
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
