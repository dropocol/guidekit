import prisma from "@/lib/prisma";
// import Form from "@/ui/form";
import Form from "@/ui/form/index";

import { updateKnowledgebase } from "@/lib/actions";
import KnowledgebaseHeader from "@/components/KnowledgebaseHeader";

export default async function KnowledgebaseSettingsDomains({
  params,
}: {
  params: { id: string };
}) {
  const id = decodeURIComponent(params.id);
  const data = await prisma.knowledgebase.findUnique({
    where: { id },
  });

  if (!data) {
    return <div>Knowledgebase not found</div>;
  }

  const handleSubmitWithId = async (formData: FormData) => {
    "use server";
    formData.append("id", id);
    await updateKnowledgebase(formData);
  };

  return (
    <div className="flex flex-col space-y-6 p-8">
      <KnowledgebaseHeader
        name={data.name}
        subdomain={data.subdomain!}
        page={"Domain"}
      />

      <div className="flex flex-col space-y-6">
        <Form
          title="Subdomain"
          description="The subdomain for your knowledgebase."
          helpText="Please use 32 characters maximum."
          inputAttrs={{
            name: "subdomain",
            type: "text",
            defaultValue: data.subdomain ?? "",
            placeholder: "subdomain",
            maxLength: 32,
          }}
          handleSubmit={handleSubmitWithId}
          submitButton={{
            text: "Save Changes",
            variant: "primary",
            loading: false,
          }}
        />
        <Form
          title="Custom Domain"
          description="The custom domain for your knowledgebase."
          helpText="Please enter a valid domain."
          inputAttrs={{
            name: "customDomain",
            type: "text",
            defaultValue: data.customDomain ?? "",
            placeholder: "yourdomain.com",
            maxLength: 64,
            // pattern: "^[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}$",
          }}
          handleSubmit={handleSubmitWithId}
          submitButton={{
            text: "Save Changes",
            variant: "primary",
            loading: false,
          }}
        />
      </div>
    </div>
  );
}
