import prisma from "@/lib/prisma";
import Form from "@/ui/form";
import { updateKnowledgebase, removeKnowledgebaseImage } from "@/lib/actions";
import KnowledgebaseHeader from "@/components/KnowledgebaseHeader";

export default async function KnowledgebaseSettingsAppearance({
  params,
}: {
  params: { id: string };
}) {
  const id = decodeURIComponent(params.id);
  const data = await prisma.knowledgebase.findUnique({
    where: {
      id: id,
    },
  });

  if (!data) {
    return <div>Knowledgebase not found</div>;
  }

  const handleSubmitWithId = async (formData: FormData) => {
    "use server";
    formData.append("id", id);
    return updateKnowledgebase(formData);
  };

  const handleRemoveImage = async (formData: FormData) => {
    "use server";
    const type = formData.get("type") as "thumbnail" | "logo";
    return removeKnowledgebaseImage(id, type);
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
            <form action={handleRemoveImage}>
              <input type="hidden" name="type" value="thumbnail" />
              <button
                type="submit"
                className="ml-2 rounded-md bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
              >
                Remove Image
              </button>
            </form>
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
            <form action={handleRemoveImage}>
              <input type="hidden" name="type" value="logo" />
              <button
                type="submit"
                className="ml-2 rounded-md bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
              >
                Remove Image
              </button>
            </form>
          )
        }
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
