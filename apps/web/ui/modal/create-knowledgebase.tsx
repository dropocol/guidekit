"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createKnowledgebase } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/ui/icons/loading-dots";
import { useModal } from "./provider";
import va from "@vercel/analytics";

export default function CreateKnowledgebaseModal() {
  const router = useRouter();
  const modal = useModal();

  const [data, setData] = useState({
    name: "",
    notionLink: "",
    subdomain: "",
  });

  return (
    <form
      action={async (formData: any) => {
        const response = await createKnowledgebase(formData);
        if (response && "error" in response) {
          toast.error(response.error);
        } else {
          va.track("Created Knowledgebase");
          router.refresh();
          modal?.hide();
          toast.success(`Successfully created knowledgebase!`);
        }
      }}
      className="w-full rounded-md bg-white md:max-w-md md:border md:border-stone-200 md:shadow dark:bg-black dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">
          Create a new knowledgebase
        </h2>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-stone-500 dark:text-stone-400"
          >
            Knowledgebase Name
          </label>
          <input
            name="name"
            type="text"
            placeholder="My Awesome Knowledgebase"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            maxLength={64}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="subdomain"
            className="text-sm font-medium text-stone-500 dark:text-stone-400"
          >
            Subdomain
          </label>
          <div className="flex rounded-md shadow-sm">
            <input
              name="subdomain"
              type="text"
              placeholder="my-knowledgebase"
              value={data.subdomain}
              onChange={(e) => setData({ ...data, subdomain: e.target.value })}
              required
              className="w-full rounded-l-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
            />
            <span className="inline-flex items-center rounded-r-md border border-l-0 border-stone-200 bg-stone-100 px-3 text-sm text-stone-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400">
              .{process.env.NEXT_PUBLIC_ROOT_DOMAIN}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="notionLink"
            className="text-sm font-medium text-stone-500 dark:text-stone-400"
          >
            Notion Link
          </label>
          <input
            name="notionLink"
            type="url"
            placeholder="https://www.notion.so/..."
            value={data.notionLink}
            onChange={(e) => setData({ ...data, notionLink: e.target.value })}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>
      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 md:px-10 dark:border-stone-700 dark:bg-stone-800">
        <CreateKnowledgebaseFormButton />
      </div>
    </form>
  );
}

function CreateKnowledgebaseFormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={pending}
    >
      {pending ? <LoadingDots color="#808080" /> : <p>Create Knowledgebase</p>}
    </button>
  );
}
