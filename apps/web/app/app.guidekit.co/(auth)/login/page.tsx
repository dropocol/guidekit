// "use client";
import { Button, Logo } from "@/ui";
import { HOME_DOMAIN, constructMetadata } from "@/lib/utils";
import { Suspense } from "react";
import LoginForm from "./form";

export const metadata = constructMetadata({
  title: `Sign in to ${process.env.NEXT_PUBLIC_APP_NAME}`,
});

export default function LoginPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  return (
    <div className="relative z-10 mt-[calc(10%)] h-fit w-full max-w-md overflow-hidden border-y border-gray-200 sm:rounded-2xl sm:border sm:shadow-xl">
      <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
        <a href={HOME_DOMAIN}>
          <Logo className="h-10 w-10" />
        </a>
        <h3 className="text-xl font-semibold">
          Sign in to {process.env.NEXT_PUBLIC_APP_NAME}
        </h3>
        <p className="text-sm text-gray-500">
          Start creating knowledge bases with superpowers
        </p>
      </div>
      <div className="flex flex-col space-y-3 bg-gray-50 px-4 py-8 sm:px-16">
        <Suspense
          fallback={
            <>
              <Button disabled={true} variant="secondary" />
              <Button disabled={true} variant="secondary" />
              <Button disabled={true} variant="secondary" />
              <div className="mx-auto h-5 w-3/4 rounded-lg bg-gray-100" />
            </>
          }
        >
          <LoginForm />
          {isDemoMode === true && (
            <div className="mb-4 flex flex-col gap-2 rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-600">
              <span className="flex justify-between">
                <span className="font-semibold">Email:</span>{" "}
                <span>demo@guidekit.cc</span>
              </span>
              <span className="flex justify-between">
                <span className="font-semibold">Password:</span>{" "}
                <span>demo12345</span>
              </span>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
