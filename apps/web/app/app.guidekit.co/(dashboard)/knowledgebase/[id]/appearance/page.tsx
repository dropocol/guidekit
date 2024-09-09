import prisma from "@/lib/prisma";
import Form from "@/ui/form";
import { updateKnowledgebase } from "@/lib/actions";
import KnowledgebaseHeader from "@/components/KnowledgebaseHeader";

export default async function KnowledgebaseSettingsAppearance({
  params,
}: {
  params: { id: string };
}) {
  const data = await prisma.knowledgebase.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  if (!data) {
    return <div>Knowledgebase not found</div>;
  }

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
        handleSubmit={updateKnowledgebase}
      />
      <Form
        title="Logo"
        description="The logo for your knowledgebase. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 400x400."
        inputAttrs={{
          name: "logo",
          type: "file",
          //   defaultValue: data?.logo!,
          // CHECK : Replace that
          defaultValue:
            "https://public.blob.vercel-storage.com/eEZHAoPTOBSYGBE3/hxfcV5V-eInX3jbVUhjAt1suB7zB88uGd1j20b.png",
        }}
        handleSubmit={updateKnowledgebase}
      />
      <Form
        title="Font"
        description="The font for the heading text your knowledgebase."
        helpText="Please select a font."
        inputAttrs={{
          name: "font",
          type: "select",
          // CHECK : Replace that
          //   defaultValue: data?.font!,
          defaultValue: "Ariel",
        }}
        handleSubmit={updateKnowledgebase}
      />
      <Form
        title="404 Page Message"
        description="Message to be displayed on the 404 page."
        helpText="Please use 240 characters maximum."
        inputAttrs={{
          name: "message404",
          type: "text",
          //   defaultValue: data?.message404!,
          // CHECK : Replace that
          defaultValue: "Oops! You've found a page that doesn't exist.",
          placeholder: "Oops! You've found a page that doesn't exist.",
          maxLength: 240,
        }}
        handleSubmit={updateKnowledgebase}
      />
    </div>
  );
}
