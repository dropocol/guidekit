import prisma from "@/lib/prisma";
import Form from "@/ui/form";
import { updateKnowledgebase } from "@/lib/actions";
// import DeleteKnowledgebaseForm from "@/ui/form/delete-knowledgebase-form";

export default async function KnowledgebaseSettingsIndex({
  params,
}: {
  params: { id: string };
}) {
  const data = await prisma.knowledgebase.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Name"
        description="The name of your knowledgebase. This will be used as the meta title on Google as well."
        helpText="Please use 32 characters maximum."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: data?.name!,
          placeholder: "My Awesome Knowledgebase",
          maxLength: 32,
        }}
        handleSubmit={updateKnowledgebase}
      />

      <Form
        title="Description"
        description="The description of your knowledgebase. This will be used as the meta description on Google as well."
        helpText="Include SEO-optimized keywords that you want to rank for."
        inputAttrs={{
          name: "description",
          type: "text",
          //   defaultValue: data?.description!,
          // CHECK : Replace that
          defaultValue: "Sample description"!,
          placeholder: "A knowledgebase about really interesting things.",
        }}
        handleSubmit={updateKnowledgebase}
      />

      {/* TODO : add a form */}
      {/* <DeleteKnowledgebaseForm knowledgebaseName={data?.name!} /> */}
    </div>
  );
}
