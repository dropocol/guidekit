"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error");
        setErrorMessage("Missing verification token");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();

        if (response.ok) {
          setVerificationStatus("success");
        } else {
          setVerificationStatus("error");
          setErrorMessage(data.error || "Failed to verify email");
        }
      } catch (error) {
        setVerificationStatus("error");
        setErrorMessage("An unexpected error occurred");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {verificationStatus === "loading" && (
          <div className="text-center">
            <p className="text-lg font-semibold">Verifying your email...</p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-2xl font-bold text-green-600">
              Email Verified Successfully
            </h1>
            <p className="mt-2 text-gray-600">
              Your email has been verified. You can now use all features of your
              account.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
            >
              Go to Login
            </Link>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-red-600">
              Verification Failed
            </h1>
            <p className="mt-2 text-gray-600">{errorMessage}</p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
