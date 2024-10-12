import React from "react";
import Link from "next/link";

interface UnverifiedEmailBannerProps {
  userEmail?: string;
}

const UnverifiedEmailBanner: React.FC<UnverifiedEmailBannerProps> = ({
  userEmail,
}) => {
  return (
    <div
      className="border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700"
      role="alert"
    >
      <p className="font-bold">Email Verification Required</p>
      <p>
        Please verify your email address {userEmail && `(${userEmail})`} to
        access all features.{" "}
        <Link
          href="/verify-email"
          className="font-semibold underline hover:text-yellow-800"
        >
          Resend verification email
        </Link>
      </p>
    </div>
  );
};

export default UnverifiedEmailBanner;
