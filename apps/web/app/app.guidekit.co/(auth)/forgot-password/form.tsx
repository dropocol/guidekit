"use client";

import { useState } from "react";
import { Button } from "@dub/ui";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Password reset email sent. Please check your inbox.");
      } else {
        const data = await response.json();
        toast.error(data.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <div>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>
        <Button
          text={isLoading ? "Sending..." : "Reset Password"}
          variant="primary"
          loading={isLoading}
          type="submit"
        />
      </form>
      <div className="flex justify-center text-center text-sm font-medium text-gray-500">
        <Link href="/login" className="transition-colors hover:text-black">
          Remember your password?
        </Link>
      </div>
    </>
  );
}
