import { cn } from "@dub/utils";
import { InputHTMLAttributes, ReactNode, useMemo, useState } from "react";
import { Button } from "./button";
// import { Uploader } from "@/ui/";

export function Form({
  title,

  description,
  inputAttrs,
  helpText,
  buttonText = "Save Changes",
  handleSubmit,
  handleRemove,
  currentImage,
}: {
  title: string;
  description: string;
  inputAttrs: InputHTMLAttributes<HTMLInputElement>;
  helpText?: string | ReactNode;
  buttonText?: string;
  handleSubmit: (data: any) => Promise<any>;
  handleRemove?: () => Promise<void>;
  currentImage?: string | null;
}) {
  const [value, setValue] = useState(inputAttrs.defaultValue);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const saveDisabled = useMemo(() => {
    return saving || (!value && !image) || value === inputAttrs.defaultValue;
  }, [saving, value, image, inputAttrs.defaultValue]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData();
        if (image) {
          formData.append(inputAttrs.name as string, image);
        } else if (value) {
          formData.append(inputAttrs.name as string, value as string);
        }
        await handleSubmit(formData);
        setSaving(false);
      }}
      className="rounded-lg border border-gray-200 bg-white"
    >
      <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
        <div className="flex flex-col space-y-3">
          <h2 className="text-xl font-medium">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {inputAttrs.type === "file" ? (
          <div className="flex items-center space-x-3">
            {/* <Uploader
              defaultValue={currentImage || null}
              name={inputAttrs.name as "image" | "logo"}
              onImageChange={setImage}
            /> */}
            {handleRemove && (
              <Button
                text={`Remove ${inputAttrs.name === "image" ? "Thumbnail" : "Logo"}`}
                variant="danger-outline"
                onClick={handleRemove}
              />
            )}
          </div>
        ) : (
          <input
            {...inputAttrs}
            onChange={(e) => setValue(e.target.value)}
            className={cn(
              "w-full max-w-md rounded-md border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
            )}
          />
        )}
      </div>

      <div className="flex items-center justify-between space-x-4 rounded-b-lg border-t border-gray-200 bg-gray-50 p-3 sm:px-10">
        {typeof helpText === "string" ? (
          <p
            className="prose-sm prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-gray-700 text-gray-500 transition-colors"
            dangerouslySetInnerHTML={{ __html: helpText || "" }}
          />
        ) : (
          helpText
        )}
        <div className="shrink-0">
          <Button text={buttonText} loading={saving} disabled={saveDisabled} />
        </div>
      </div>
    </form>
  );
}
