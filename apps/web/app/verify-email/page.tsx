"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/api";
import { Logo } from "@/ui/logo";

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token)
        .then(() => setVerificationStatus("success"))
        .catch(() => setVerificationStatus("error"));
    } else {
      setVerificationStatus("error");
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo className="mx-auto h-12 w-auto" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {verificationStatus === "loading" && (
            <p className="text-center">Verifying your email...</p>
          )}
          {verificationStatus === "success" && (
            <div>
              <p className="text-center text-green-600">
                Your email has been successfully verified!
              </p>
              <p className="mt-2 text-center">
                You can now{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  log in
                </a>{" "}
                to your account.
              </p>
            </div>
          )}
          {verificationStatus === "error" && (
            <p className="text-center text-red-600">
              There was an error verifying your email. Please try again or
              contact support.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
