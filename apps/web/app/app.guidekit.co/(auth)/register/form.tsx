"use client";

import { Button, Github, Google, InfoTooltip, useMediaQuery } from "@dub/ui";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clickedEmail, setClickedEmail] = useState(false);

  const handleEmailSubmit = async (e: any) => {
    console.log("email submit");
    e.preventDefault();
    setClickedEmail(true);
    // use fetch to send the request to the server
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (res) {
      console.log(res);
      toast.success("Account created successfully!");
    }
    setClickedEmail(false);
  };

  return (
    <>
      {/* <form className="flex flex-col space-y-3"> */}
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
        text="Sign Up"
        variant="primary"
        type="button"
        onClick={handleEmailSubmit}
        // loading={clickedEmail}
      />
      {/* <button
        onClick={() => console.log("clicked")}
        onSubmit={handleEmailSubmit}
        className="w-full rounded-md p-2 hover:bg-gray-100 active:bg-gray-200"
      >
        Sign Up
      </button> */}
      {/* </form> */}
      {/* add forgot password and signup link */}
      <p className="text-center text-sm text-gray-500">
        <Link
          href="/forgot-password"
          className="font-semibold text-gray-500 transition-colors hover:text-black"
        >
          Forgot your password?
        </Link>
      </p>
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          onClick={() => {
            signIn("google");
          }}
          icon={<Google className="h-5 w-5" />}
        />
      </div>
    </>
  );
}
