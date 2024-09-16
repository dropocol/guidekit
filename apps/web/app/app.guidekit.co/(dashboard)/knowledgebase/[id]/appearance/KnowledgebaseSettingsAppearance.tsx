"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Form from "@/ui/form";
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
    }
    return result;
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

      <Form
        title="Thumbnail image"
        description="The thumbnail image for your knowledgebase. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 1200x630."
        inputAttrs={{
          name: "image",
          type: "file",
          defaultValue: data?.image!,
        }}
        handleSubmit={handleSubmitWithId}
        additionalContent={
          data?.image && (
            <button
              type="button"
              onClick={() => handleRemoveImage("thumbnail")}
              className="mr-2 rounded-md bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
            >
              Remove Image
            </button>
          )
        }
      />

      <Form
        title="Logo"
        description="The logo for your knowledgebase. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 400x400."
        inputAttrs={{
          name: "logo",
          type: "file",
          defaultValue: data?.logo!,
        }}
        handleSubmit={handleSubmitWithId}
        additionalContent={
          data?.logo && (
            <button
              type="button"
              onClick={() => handleRemoveImage("logo")}
              className="mr-2 rounded-md bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
            >
              Remove Logo
            </button>
          )
        }
      />

      <Form
        title="Name"
        description="The name of your knowledgebase."
        helpText="This is the name that will be displayed in the header of your knowledgebase."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: data?.name!,
          placeholder: "My Knowledgebase",
          maxLength: 32,
        }}
        handleSubmit={handleSubmitWithId}
      />

      <Form
        title="Description"
        description="A short description of your knowledgebase."
        helpText="This will be displayed in the meta description of your knowledgebase."
        inputAttrs={{
          name: "description",
          type: "text",
          defaultValue: data?.description!,
          placeholder: "A collection of knowledge about...",
          maxLength: 140,
        }}
        handleSubmit={handleSubmitWithId}
      />

      <Form
        title="Font"
        description="The font for the heading text your knowledgebase."
        helpText="Please select a font."
        inputAttrs={{
          name: "font",
          type: "select",
          defaultValue: data?.font!,
        }}
        handleSubmit={handleSubmitWithId}
      />

      <Form
        title="404 Page Message"
        description="Message to be displayed on the 404 page."
        helpText="Please use 240 characters maximum."
        inputAttrs={{
          name: "message404",
          type: "text",
          defaultValue: data?.message404!,
          placeholder: "Oops! You've found a page that doesn't exist.",
          maxLength: 240,
        }}
        handleSubmit={handleSubmitWithId}
      />
    </div>
  );
}
