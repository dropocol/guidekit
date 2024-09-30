"use client";

import { Button } from "@/ui";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [clickedEmail, setClickedEmail] = useState(false);

  const handleCredentialsSubmit = async (e: any) => {
    console.log("email submit");
    e.preventDefault();
    setClickedEmail(true);
    // use fetch to send the request to the server
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (data?.success) {
      toast.success("Account created successfully!");
      router.push("/login");
    } else {
      toast.error(data?.error || "Something went wrong");
    }
    setClickedEmail(false);
  };

  return (
    <>
      {/* <form className="flex flex-col space-y-3"> */}
      <div>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
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
        onClick={handleCredentialsSubmit}
        loading={clickedEmail}
      />

      <div className="flex justify-center text-center text-sm font-medium text-gray-500">
        <Link href="/login" className="transition-colors hover:text-black">
          Already have an account?
        </Link>
      </div>

      {/* <div className="flex space-x-2">
        <Button
          variant="secondary"
          onClick={() => {
            signIn("google");
          }}
          icon={<Google className="h-5 w-5" />}
        />
      </div> */}
    </>
  );
}
