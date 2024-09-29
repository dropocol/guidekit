"use client";

import { useState } from "react";
import { Button } from "@dub/ui";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        toast.success("Password reset successfully");
        router.push("/login");
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
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          required
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          required
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          text={isLoading ? "Resetting..." : "Reset Password"}
          loading={isLoading}
          type="submit"
          className="w-full"
        />
      </form>
      <div className="flex justify-center text-center text-sm font-medium text-gray-500">
        <Link href="/login" className="transition-colors hover:text-black">
          Already have an account?
        </Link>
      </div>
    </>
  );
}
