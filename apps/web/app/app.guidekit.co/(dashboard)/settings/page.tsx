import { ReactNode } from "react";
import Form from "@/ui/form";
import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { editUser } from "@/lib/actions";

async function handleEditUser(formData: FormData) {
  "use server";
  return editUser(formData);
}

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Settings
        </h1>

        <Form
          title="Name"
          description="Your name on this app."
          helpText="Please use 32 characters maximum."
          inputAttrs={{
            name: "name",
            type: "text",
            defaultValue: session.user?.name ?? "",
            placeholder: "Brendon Urie",
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
            defaultValue: session.user?.email ?? "",
            // TODO: Update placeholder
            placeholder: "panic@thedis.co",
          }}
          handleSubmit={handleEditUser}
        />
      </div>
    </div>
  );
}
