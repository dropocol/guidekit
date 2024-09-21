"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Form from "@/ui/form";
import { editUser } from "@/lib/actions";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
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
      // Refresh the page to show updated data
      router.refresh();
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
        />
      </div>
    </div>
  );
}
