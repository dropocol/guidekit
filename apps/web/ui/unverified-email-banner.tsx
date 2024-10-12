"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function UnverifiedEmailBanner() {
  const [isResending, setIsResending] = useState(false);

  const resendVerificationEmail = async () => {
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      if (response.ok) {
        toast.success("Verification email resent. Please check your inbox.");
      } else {
        toast.error(
          "Failed to resend verification email. Please try again later.",
        );
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
    setIsResending(false);
  };

  return (
    <div className="border-b border-yellow-200 bg-yellow-100 px-4 py-3">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between">
        <p className="text-yellow-700">
          Please verify your email address to access all features.
        </p>
        <button
          onClick={resendVerificationEmail}
          disabled={isResending}
          className="rounded bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-600"
        >
          {isResending ? "Resending..." : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
}
