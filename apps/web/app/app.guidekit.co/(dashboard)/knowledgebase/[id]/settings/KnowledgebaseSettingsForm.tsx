"use client";

import { useRouter } from "next/navigation";
import Form from "@/ui/form";
import { updateKnowledgebase } from "@/lib/actions";
import { toast } from "sonner";
import { Knowledgebase } from "@prisma/client";
import DangerZone from "./DangerZone";

export default function KnowledgebaseSettingsForm({
  initialData,
}: {
  initialData: Knowledgebase;
}) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    formData.append("id", initialData.id);
    try {
      const result = await updateKnowledgebase(formData);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Knowledgebase updated successfully!");
      }
    } catch (error) {
      toast.error("An error occurred while updating the knowledgebase");
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Name"
        description="The name of your knowledgebase. This will be used as the meta title on Google as well."
        helpText="Please use 32 characters maximum."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: initialData.name,
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
          defaultValue: initialData.description || "",
          placeholder: "A knowledgebase about really interesting things.",
        }}
        handleSubmit={handleSubmit}
      />

      <div className="mt-6 border-t border-gray-200 pt-6">
        <DangerZone
          knowledgebaseId={initialData.id}
          knowledgebaseName={initialData.name}
        />
      </div>
    </div>
  );
}
