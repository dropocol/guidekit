"use client";

import { cn } from "@/lib/utils";
import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  useMemo,
  useState,
} from "react";
import { Button } from "@/ui";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Uploader from "./uploader";
import DomainStatus from "./domain-status";
import DomainConfiguration from "./domain-configuration";
import va from "@vercel/analytics";

interface ExtendedInputAttributes
  extends InputHTMLAttributes<HTMLInputElement> {
  accept?: string;
}

interface ExtendedTextareaAttributes
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
}

interface FormProps {
  title: string;
  description: string;
  inputAttrs: ExtendedInputAttributes | ExtendedTextareaAttributes;
  helpText?: string | ReactNode;
  buttonText?: string;
  handleSubmit: (data: FormData, id?: string, name?: string) => Promise<any>;
  handleRemove?: () => Promise<void>;
  currentImage?: string | null;
  additionalContent?: React.ReactNode;
  submitButton?: {
    text: string;
    variant?: "primary" | "danger";
    loading?: boolean;
  };
  customSuccessMessage?: string;
  customErrorMessage?: string;
}

export default function Form({
  title,
  description,
  inputAttrs,
  helpText,
  buttonText = "Save Changes",
  handleSubmit,
  handleRemove,
  currentImage,
  additionalContent,
  submitButton,
  customSuccessMessage,
  customErrorMessage,
}: FormProps) {
  const [value, setValue] = useState(inputAttrs.defaultValue);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const { update } = useSession();

  // New state for isLoading (from old Form)
  const [isLoading, setIsLoading] = useState(false);

  const isInputElement = (
    attrs: ExtendedInputAttributes | ExtendedTextareaAttributes,
  ): attrs is ExtendedInputAttributes => {
    return "type" in attrs;
  };

  const saveDisabled = useMemo(() => {
    if (isInputElement(inputAttrs) && inputAttrs.type === "file") {
      return saving || (!image && !currentImage);
    }
    return saving || (!value && !image) || value === inputAttrs.defaultValue;
  }, [saving, value, image, inputAttrs, currentImage]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    if (image) {
      formData.set(inputAttrs.name as string, image);
    }

    if (
      inputAttrs.name === "customDomain" &&
      inputAttrs.defaultValue &&
      formData.get("customDomain") !== inputAttrs.defaultValue &&
      !confirm("Are you sure you want to change your custom domain?")
    ) {
      setSaving(false);
      setIsLoading(false);
      return;
    }

    try {
      const res = await handleSubmit(formData, id, inputAttrs.name);
      if (res && "error" in res) {
        toast.error(customErrorMessage || res.error);
      } else {
        if (id) {
          router.refresh();
        } else {
          await update();
          router.refresh();
        }
        toast.success(
          customSuccessMessage || `Successfully updated ${inputAttrs.name}!`,
        );
      }
    } catch (error) {
      toast.error(
        customErrorMessage ||
          `Failed to update ${inputAttrs.name}. Please try again.`,
      );
    } finally {
      setSaving(false);
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black"
    >
      <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
        <div className="flex flex-col space-y-3">
          <h2 className="font-cal text-xl dark:text-white">{title}</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {description}
          </p>
        </div>
        {isInputElement(inputAttrs) && inputAttrs.type === "file" ? (
          <Uploader
            defaultValue={currentImage || null}
            name={inputAttrs.name as "image" | "logo"}
            onImageChange={setImage}
          />
        ) : inputAttrs.name === "font" ? (
          <div className="flex max-w-sm items-center overflow-hidden rounded-lg border border-stone-600">
            <select
              name="font"
              defaultValue={inputAttrs.defaultValue as string}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-none border-none bg-white px-4 py-2 text-sm font-medium text-stone-700 focus:outline-none focus:ring-black dark:bg-black dark:text-stone-200 dark:focus:ring-white"
            >
              <option value="font-cal">Cal Sans</option>
              <option value="font-lora">Lora</option>
              <option value="font-work">Work Sans</option>
            </select>
          </div>
        ) : inputAttrs.name === "subdomain" ? (
          <div className="flex w-full max-w-md">
            <input
              {...(inputAttrs as ExtendedInputAttributes)}
              required
              onChange={(e) => setValue(e.target.value)}
              className="z-10 flex-1 rounded-l-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            />
            <div className="flex items-center rounded-r-md border border-l-0 border-stone-300 bg-stone-100 px-3 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400">
              {process.env.NEXT_PUBLIC_ROOT_DOMAIN}
            </div>
          </div>
        ) : inputAttrs.name === "customDomain" ? (
          <div className="relative flex w-full max-w-md">
            <input
              {...(inputAttrs as ExtendedInputAttributes)}
              onChange={(e) => setValue(e.target.value)}
              className="z-10 flex-1 rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            />
            {inputAttrs.defaultValue && (
              <div className="absolute right-3 z-10 flex h-full items-center">
                <DomainStatus domain={inputAttrs.defaultValue as string} />
              </div>
            )}
          </div>
        ) : inputAttrs.name === "description" ? (
          <textarea
            {...(inputAttrs as ExtendedTextareaAttributes)}
            rows={3}
            required
            onChange={(e) => setValue(e.target.value)}
            className="w-full max-w-xl rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          />
        ) : (
          <input
            {...(inputAttrs as ExtendedInputAttributes)}
            onChange={(e) => setValue(e.target.value)}
            className={cn(
              "w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700",
            )}
          />
        )}
      </div>
      {inputAttrs.name === "customDomain" && inputAttrs.defaultValue && (
        <DomainConfiguration domain={inputAttrs.defaultValue as string} />
      )}
      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 dark:border-stone-700 dark:bg-stone-800">
        {typeof helpText === "string" ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {helpText}
          </p>
        ) : (
          helpText
        )}
        <div className="flex justify-end space-x-2">
          {additionalContent}
          {currentImage && handleRemove && (
            <Button
              text={`Remove ${inputAttrs.name === "image" ? "Image" : "Logo"}`}
              variant="danger"
              onClick={handleRemove}
              className="w-36"
            />
          )}
          {submitButton ? (
            <Button
              type="submit"
              text={submitButton.text}
              variant={submitButton.variant || "primary"}
              loading={saving}
              className="w-auto"
            />
          ) : (
            <button
              disabled={isLoading}
              className={`${
                isLoading
                  ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-500"
                  : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-stone-300"
              } h-10 rounded-md border px-5 py-1.5 text-sm transition-all focus:outline-none`}
            >
              {isLoading ? "Saving..." : buttonText}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
