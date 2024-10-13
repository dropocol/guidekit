"use client";

import React, { useState } from "react";
import { toast } from "sonner";

interface UnverifiedEmailBannerProps {
  userEmail?: string;
}

const UnverifiedEmailBanner: React.FC<UnverifiedEmailBannerProps> = ({
  userEmail,
}) => {
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Verification email resent successfully!");
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast.error(
        (error as Error)?.message ||
          "Failed to resend verification email. Please try again later.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      className="border-l-4 border-red-500 bg-red-100 p-4 text-red-700"
      role="alert"
    >
      <p className="font-bold">Email Verification Required</p>
      <p>
        Please verify your email address {userEmail && `(${userEmail})`} to
        access all features.{" "}
        <button
          onClick={handleResendVerification}
          disabled={isResending}
          className="font-semibold underline hover:text-red-800 focus:outline-none"
        >
          {isResending ? "Resending..." : "Resend verification email"}
        </button>
      </p>
    </div>
  );
};

export default UnverifiedEmailBanner;
