"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import Form from "@/ui/form";
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
    return result;
    // if (!("error" in result)) {
    //   setData((prevData) => ({
    //     ...prevData,
    //     ...result,
    //   }));
    //   toast.success("Successfully updated!");
    //   router.refresh();
    // } else {
    //   toast.error(result.error);
    // }
  };

  const handleRemoveImage = async (type: "thumbnail" | "logo" | "favicon") => {
    try {
      const res = await removeKnowledgebaseImage(id, type);
      if ("error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Successfully removed ${type}!`);
        setData((prevData) => ({
          ...prevData,
          [type === "thumbnail" ? "image" : type]: null,
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
          accept: "image/png, image/jpeg",
        }}
        handleSubmit={handleSubmitWithId}
        handleRemove={() => handleRemoveImage("thumbnail")}
        buttonText="Upload Image"
        currentImage={data.image}
        submitButton={{
          text: "Upload Image",
          variant: "primary",
          loading: false,
        }}
      />

      <Form
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
        submitButton={{
          text: "Upload Logo",
          variant: "primary",
          loading: false,
        }}
      />

      <Form
        title="Favicon"
        description="The favicon for your knowledgebase. Accepted formats: .ico, .png"
        helpText="Max file size 50MB. Recommended size 32x32."
        inputAttrs={{
          name: "favicon",
          type: "file",
          accept: "image/x-icon, image/png",
        }}
        handleSubmit={handleSubmitWithId}
        handleRemove={() => handleRemoveImage("favicon")}
        buttonText="Upload Favicon"
        currentImage={data.favicon}
        submitButton={{
          text: "Upload Favicon",
          variant: "primary",
          loading: false,
        }}
      />

      <Form
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
        submitButton={{
          text: "Update Message",
          variant: "primary",
          loading: false,
        }}
      />
    </div>
  );
}
