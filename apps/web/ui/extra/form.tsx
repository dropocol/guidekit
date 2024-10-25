"use client";
import { useState } from "react";

interface FormProps {
  title: string;
  description: string;
  helpText: string;
  inputAttrs: {
    name: string;
    type: string;
    defaultValue: string;
    placeholder: string;
    maxLength?: number;
  };
  handleSubmit: (formData: FormData) => Promise<void>;
}

export default function Form({
  title,
  description,
  helpText,
  inputAttrs,
  handleSubmit,
}: FormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await handleSubmit(formData);
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-white">{title}</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>
        <input
          {...inputAttrs}
          className="w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-2 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        />
      </div>
      <div className="flex items-center justify-between rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:px-10 dark:border-stone-700 dark:bg-stone-800">
        <p className="text-sm text-stone-500 dark:text-stone-400">{helpText}</p>
        <button
          disabled={isLoading}
          className={`${
            isLoading
              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-500"
              : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          } rounded-md border px-5 py-1.5 text-sm transition-all focus:outline-none`}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
