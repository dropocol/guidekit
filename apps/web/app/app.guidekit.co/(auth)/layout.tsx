import { Metadata } from "next";
import { ReactNode } from "react";

// TODO: Add proper details like image, url etc.
export const metadata: Metadata = {
  title: "Login | GuideKit",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
