"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { Logo, Button } from "@/ui";
import { HOME_DOMAIN } from "@/lib/utils";
import { useSession } from "next-auth/react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const { data: session, update, status } = useSession();
  const [hasVerified, setHasVerified] = useState(false); // Track if verification has been attempted

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
          console.log("SESSION: ", session);
          if (session) {
            await update({
              ...session,
              user: {
                ...session?.user,
                isEmailVerified: true,
              },
            });
          }
        } else {
          setVerificationStatus("error");
          setErrorMessage(data.error || "Failed to verify email");
        }
      } catch (error) {
        setVerificationStatus("error");
        setErrorMessage("An unexpected error occurred");
      }
    };

    if (status !== "loading" && !hasVerified) {
      // Check if verification has already been attempted
      verifyEmail();
      setHasVerified(true); // Mark verification as attempted
    }
  }, [status, session, token, update, hasVerified]); // Add hasVerified to dependencies

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <div className="relative z-10 mt-[calc(10%)] h-fit w-full max-w-md overflow-hidden border-y border-gray-200 sm:rounded-2xl sm:border sm:shadow-xl">
      <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
        <a href={HOME_DOMAIN}>
          <Logo className="h-10 w-10" />
        </a>
        <h3 className="text-xl font-semibold">Verify Your Email</h3>
      </div>
      <div className="flex flex-col space-y-3 bg-gray-50 px-4 py-8 sm:px-16">
        {verificationStatus === "loading" && (
          <div className="text-center">
            <p className="text-lg font-semibold">Verifying your email...</p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-2xl font-bold text-green-600">
              Email Verified
            </h1>
            <p className="mb-8 mt-2 text-sm text-gray-500">
              Your email has been verified successfully.
            </p>
            <Button
              text="Go to Login"
              variant="primary"
              type="button"
              onClick={handleLoginClick}
              className="mt-4"
            />
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-red-600">
              Verification Failed
            </h1>
            <p className="mb-8 mt-2 text-sm text-gray-500">{errorMessage}</p>
            <Button
              text="Go to Login"
              variant="primary"
              type="button"
              onClick={handleLoginClick}
              className="mt-4"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
