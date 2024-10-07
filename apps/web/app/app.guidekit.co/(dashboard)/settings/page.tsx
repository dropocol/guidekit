"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Form from "@/ui/form/index";
import { editUser, updatePassword } from "@/lib/actions"; // Import updatePassword
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { LoadingDots } from "@/ui/icons";
import { set } from "js-cookie";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update, status } = useSession();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // wait for session to load
    console.log("status", status);
    console.log("session", session);

    if (status === "loading") {
      return;
    }

    if (!session && status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, session]);

  if (status === "loading") {
    return (
      <div className="flex h-10 w-full items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  async function handleEditUser(formData: FormData) {
    const result = await editUser(formData);
    if ("error" in result) {
      setError(result.error);
    } else {
      // Update the session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.get("name") as string,
          email: formData.get("email") as string,
        },
      });

      toast.success("Profile updated successfully!");
      router.refresh();
    }
  }

  async function handleUpdatePassword(formData: FormData) {
    const result = await updatePassword(formData);

    if ("error" in result) {
      setError(result.error);
    } else {
      toast.success("Password updated successfully!");
    }
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Settings
        </h1>

        {error && <p className="text-red-500">{error}</p>}

        <Form
          title="Name"
          description="Your name on this app."
          helpText="Please use 32 characters maximum."
          inputAttrs={{
            name: "name",
            type: "text",
            defaultValue: session.user.name ?? "",
            placeholder: "Your Name",
            maxLength: 32,
          }}
          handleSubmit={handleEditUser}
          submitButton={{
            text: "Save Changes",
            variant: "primary",
            loading: false,
          }}
        />
        <Form
          title="Email"
          description="Your email on this app."
          helpText="Please enter a valid email."
          inputAttrs={{
            name: "email",
            type: "email",
            defaultValue: session.user.email ?? "",
            placeholder: "your.email@example.com",
          }}
          handleSubmit={handleEditUser}
          submitButton={{
            text: "Save Changes",
            variant: "primary",
            loading: false,
          }}
        />
        <Form
          title="Password"
          description="Update your password."
          helpText="Please enter a new password."
          inputAttrs={{
            name: "password",
            type: "password",
            defaultValue: "", // Add this line to resolve the error
            placeholder: "New Password",
          }}
          handleSubmit={handleUpdatePassword}
          submitButton={{
            text: "Save Changes",
            variant: "primary",
            loading: false,
          }}
        />
      </div>
    </div>
  );
}
