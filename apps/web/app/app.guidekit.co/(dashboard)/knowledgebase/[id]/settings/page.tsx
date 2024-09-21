import prisma from "@/lib/prisma";
import { Form } from "@dub/ui";
import { updateKnowledgebase } from "@/lib/actions";
import KnowledgebaseHeader from "@/components/KnowledgebaseHeader";
import { getSession } from "@/auth";
import { notFound, redirect } from "next/navigation";
import KnowledgebaseSettingsForm from "./KnowledgebaseSettingsForm";

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

  return (
    <div className="flex flex-col space-y-6 p-8">
      <KnowledgebaseHeader
        name={data.name}
        subdomain={data.subdomain!}
        page={"Settings"}
      />
      <KnowledgebaseSettingsForm initialData={data} />
    </div>
  );
}
