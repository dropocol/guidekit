"use client";

import LoadingDots from "@/ui/icons/loading-dots";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

import { unstable_update } from "@/auth";
import { useParams, useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import DomainStatus from "./domain-status";
import DomainConfiguration from "./domain-configuration";
import Uploader from "./uploader";
import va from "@vercel/analytics";

export default function Form({
  title,
  description,
  helpText,
  inputAttrs,
  handleSubmit,
  additionalContent,
}: {
  title: string;
  description: string;
  helpText?: string;
  inputAttrs: {
    name: string;
    type: string;
    defaultValue?: string;
    [key: string]: any;
  };
  handleSubmit: (formData: FormData) => Promise<any>;
  additionalContent?: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <form
      className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black"
      action={async (formData) => {
        const res = await handleSubmit(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`Successfully updated ${title.toLowerCase()}!`);
          router.refresh();
        }
      }}
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-white">{title}</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>
        {inputAttrs.type === "text" || inputAttrs.type === "url" ? (
          <input
            {...inputAttrs}
            className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          />
        ) : inputAttrs.type === "file" ? (
          <Uploader
            defaultValue={inputAttrs.defaultValue || null}
            name={inputAttrs.name as "image" | "logo"}
          />
        ) : inputAttrs.type === "select" ? (
          <select
            {...inputAttrs}
            className="w-full max-w-md rounded-md border border-stone-300 bg-white text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          >
            <option value="font-cal">Cal Sans</option>
            <option value="font-lora">Lora</option>
            <option value="font-work">Work Sans</option>
          </select>
        ) : null}
        {helpText && (
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {helpText}
          </p>
        )}
      </div>
      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 dark:border-stone-700 dark:bg-stone-800">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {inputAttrs.type === "file" ? (
            <>
              Max file size: 50MB
              <br />
              Supported file types: .png, .jpg, .jpeg
            </>
          ) : null}
        </p>
        <div className="flex items-center space-x-2">
          {additionalContent}
          <button
            disabled={pending}
            className={`${
              pending
                ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white"
            } flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:w-auto sm:px-5`}
          >
            {pending ? <LoadingDots color="#808080" /> : <p>Save Changes</p>}
          </button>
        </div>
      </div>
    </form>
  );
}
