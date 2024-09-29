"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Form from "@/ui/form";
import { updateKnowledgebase } from "@/lib/actions";
import { toast } from "sonner";
import { Knowledgebase } from "@prisma/client";
import { Button } from "@/ui";

export default function KnowledgebaseSettingsForm({
  initialData,
}: {
  initialData: Knowledgebase;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    // const confirmed = window.confirm(
    //   "Are you sure you want to delete this knowledgebase? This action cannot be undone.",
    // );
    const confirmed = true;
    if (confirmed) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/knowledgebase/${initialData.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Response:", response);

        if (response.ok) {
          toast.success("Knowledgebase deleted successfully!");
          router.push("/"); // Redirect to dashboard
        } else {
          const error = await response.text();
          toast.error(
            error || "An error occurred while deleting the knowledgebase",
          );
        }
      } catch (error) {
        toast.error("An error occurred while deleting the knowledgebase");
      } finally {
        setIsDeleting(false);
      }
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
        <h2 className="text-lg font-medium text-gray-900">Danger Zone</h2>
        <p className="mt-1 text-sm text-gray-500">
          Once you delete a knowledgebase, there is no going back. Please be
          certain.
        </p>
        <div className="mt-3">
          <Button
            text={isDeleting ? "Deleting..." : "Delete Knowledgebase"}
            variant="danger"
            loading={isDeleting}
            onClick={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
