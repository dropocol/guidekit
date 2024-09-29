"use client";

import { Button, Github, Google, InfoTooltip, useMediaQuery } from "@dub/ui";
import { AuthError } from "next-auth";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const next = searchParams?.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clickedGoogle, setClickedGoogle] = useState(false);
  const [clickedGithub, setClickedGithub] = useState(false);

  const [clickedEmail, setClickedEmail] = useState(false);
  const { isMobile } = useMediaQuery();

  const handleCredentialsSubmit = async (e: any) => {
    e.preventDefault();
    setClickedEmail(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: process.env.VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}/register`
          : "http://app.localhost:3000/register",
      });

      setClickedEmail(false);

      if (res?.ok) {
        toast.success("Logged in successfully!");
        // code for redirect to dashboard
        router.push("/");
      } else {
        toast.error("Invalid email or password.");
      }
    } catch (error) {
      // this is what seems to be returning the error message "CallbackRouteError"
      console.log(error);
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CallbackRouteError":
          case "CredentialsSignin":
            return { error: "Invalid credentials!" };
          default:
            return { error: "Something went wrong!" };
        }
      }
      throw error;
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
            autoFocus={!isMobile}
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
          // loading={clickedEmail}
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
  );
}
