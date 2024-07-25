"use client";

import { Button, Github, Google, InfoTooltip, useMediaQuery } from "@dub/ui";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clickedGoogle, setClickedGoogle] = useState(false);
  const [clickedEmail, setClickedEmail] = useState(false);

  const { isMobile } = useMediaQuery();

  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setClickedEmail(true);
          signIn("email", {
            email,
            password,
            redirect: false,
          }).then((res) => {
            setClickedEmail(false);
            if (res?.ok && !res?.error) {
              setEmail("");
              setPassword("");
              toast.success("Logged in successfully!");
            } else {
              toast.error("Invalid email or password.");
            }
          });
        }}
        className="flex flex-col space-y-3"
      >
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
          text="Log In"
          variant="primary"
          type="submit"
          loading={clickedEmail}
          disabled={clickedGoogle}
        />
      </form>
      {/* add forgot password and signup link */}
      <p className="text-center text-sm text-gray-500">
        <Link
          href="/forgot-password"
          className="font-semibold text-gray-500 transition-colors hover:text-black"
        >
          Forgot your password?
        </Link>
      </p>
    </>
  );
}
