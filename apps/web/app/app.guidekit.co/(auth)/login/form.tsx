"use client";

import { Button } from "@/ui";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authenticate } from "@/lib/actionsv2";
import { useSession } from "next-auth/react";

export default function LoginForm() {
  const { update } = useSession();
  const router = useRouter();

  const searchParams = useSearchParams();
  const next = searchParams?.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clickedGoogle, setClickedGoogle] = useState(false);
  const [clickedGithub, setClickedGithub] = useState(false);

  const [clickedEmail, setClickedEmail] = useState(false);

  const handleCredentialsSubmit = async (e: any) => {
    e.preventDefault();
    setClickedEmail(true);
    try {
      const res = await authenticate({
        email: email,
        password: password,
        redirect: false,
        callbackUrl: process.env.VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}/login`
          : "http://app.localhost:3000/login",
      });

      setClickedEmail(false);
      const data = JSON.parse(res as string);
      const { success, message, error } = data;
      console.log("data", data);

      if (success) {
        update();
        toast.success(message);
        // return;
        router.push("/");
      }

      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to login. Please try again.");
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-3">
        <div>
          <div className="" />
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
        <div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>
        <Button
          text={clickedEmail ? "Logging in..." : "Log In"}
          variant="primary"
          type="button"
          onClick={handleCredentialsSubmit}
          loading={clickedEmail}
        />
        {/* <Button
          variant="secondary"
          onClick={() => {
            setClickedGithub(true);
            signIn("github", {
              ...(next && next.length > 0 ? { callbackUrl: next } : {}),
            });
          }}
          loading={clickedGithub}
          icon={<Github className="h-5 w-5 text-black" />}
        /> */}
      </div>
      {/* add forgot password and signup link */}
      <div className="flex justify-between text-center text-sm font-medium text-gray-500">
        <Link
          href="/forgot-password"
          className="transition-colors hover:text-black"
        >
          Forgot password?
        </Link>

        <Link href="/signup" className="transition-colors hover:text-black">
          Signup for an account
        </Link>
      </div>
    </>
    // <>
    //   <form onSubmit={handleCredentialsSubmit} method="post">
    //     <input type="email" id="email" name="email" />
    //     <label htmlFor="email">Email address</label>
    //     <input type="password" id="password" name="password" />
    //     <label className="form-label" htmlFor="password">
    //       Password
    //     </label>
    //     {error && <p className="text-bg-danger">{error}</p>}
    //     <button type="submit" className="btn btn-primary btn-block mb-4">
    //       Login
    //     </button>
    //   </form>
    // </>
  );
}
