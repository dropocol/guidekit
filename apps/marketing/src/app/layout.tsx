import "./globals.css";
// import "@dub/ui/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const title = "GuideKit – Notion based knowledgebase platform.";
const description =
  "The GuideKit is a knowledgebase platform built with Notion. It allows you to create, manage and share knowledgebases with your customers.";

export const metadata: Metadata = {
  title,
  description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
