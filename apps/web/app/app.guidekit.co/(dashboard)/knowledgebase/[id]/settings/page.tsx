import prisma from "@/lib/prisma";
import Form from "@/ui/form";
import { updateKnowledgebase } from "@/lib/actions";
import KnowledgebaseHeader from "@/components/KnowledgebaseHeader";
import { getSession } from "@/auth";
import { notFound, redirect } from "next/navigation";

export default async function KnowledgebaseSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await prisma.knowledgebase.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  if (!data || !session.user || data.userId !== session.user.id) {
    notFound();
  }

  const handleSubmit = async (formData: FormData) => {
    "use server";
    formData.append("id", data.id);
    return updateKnowledgebase(formData);
  };

  return (
    <div className="flex flex-col space-y-6 p-8">
      <KnowledgebaseHeader
        name={data.name}
        subdomain={data.subdomain!}
        page={"Settings"}
      />
      <div className="flex flex-col space-y-6">
        <Form
          title="Name"
          description="The name of your knowledgebase. This will be used as the meta title on Google as well."
          helpText="Please use 32 characters maximum."
          inputAttrs={{
            name: "name",
            type: "text",
            defaultValue: data.name,
            placeholder: "My Awesome Knowledgebase",
            maxLength: 32,
          }}
          handleSubmit={handleSubmit}
        />

        <Form
          title="Description"
          description="The description of your knowledgebase. This will be used as the meta description on Google as well."
          helpText="Include SEO-optimized keywords that you want to rank for."
          inputAttrs={{
            name: "description",
            type: "text",
            defaultValue: data.description || "",
            placeholder: "A knowledgebase about really interesting things.",
          }}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
