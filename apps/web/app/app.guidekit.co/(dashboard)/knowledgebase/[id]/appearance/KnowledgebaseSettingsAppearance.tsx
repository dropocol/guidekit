"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import Form from "@/ui/form";
import FormV2 from "@/ui/form/index";
import { updateKnowledgebase, removeKnowledgebaseImage } from "@/lib/actions";
import KnowledgebaseHeader from "@/components/KnowledgebaseHeader";
import { toast } from "sonner";
import { Knowledgebase } from "@prisma/client";

export default function KnowledgebaseSettingsAppearance({
  params,
  initialData,
}: {
  params: { id: string };
  initialData: Knowledgebase;
}) {
  const [data, setData] = useState(initialData);
  const router = useRouter();
  const id = decodeURIComponent(params.id);

  const handleSubmitWithId = async (formData: FormData) => {
    formData.append("id", id);
    const result = await updateKnowledgebase(formData);

    if (!("error" in result)) {
      setData((prevData) => ({
        ...prevData,
        ...result,
      }));
      toast.success("Successfully updated!");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleRemoveImage = async (type: "thumbnail" | "logo") => {
    try {
      const res = await removeKnowledgebaseImage(id, type);
      if ("error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Successfully removed ${type}!`);
        setData((prevData) => ({
          ...prevData,
          [type === "thumbnail" ? "image" : "logo"]: null,
        }));
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred while removing the image");
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-8">
      <KnowledgebaseHeader
        name={data.name}
        subdomain={data.subdomain!}
        page={"Appearance"}
      />

      <FormV2
        title="Thumbnail image"
        description="The thumbnail image for your knowledgebase. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 1200x630."
        inputAttrs={{
          name: "image",
          type: "file",
          accept: "image/png, image/jpeg",
        }}
        handleSubmit={handleSubmitWithId}
        handleRemove={() => handleRemoveImage("thumbnail")}
        buttonText="Upload Image"
        currentImage={data.image}
      />

      <FormV2
        title="Logo"
        description="The logo for your knowledgebase. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 400x400."
        inputAttrs={{
          name: "logo",
          type: "file",
          accept: "image/png, image/jpeg",
        }}
        handleSubmit={handleSubmitWithId}
        handleRemove={() => handleRemoveImage("logo")}
        buttonText="Upload Logo"
        currentImage={data.logo}
      />

      <FormV2
        title="404 Page Message"
        description="Message to be displayed on the 404 page."
        helpText="Please use 240 characters maximum."
        inputAttrs={{
          name: "message404",
          type: "text",
          defaultValue: data.message404 || "",
          placeholder: "Oops! You've found a page that doesn't exist.",
          maxLength: 240,
        }}
        handleSubmit={handleSubmitWithId}
      />
    </div>
  );
}
