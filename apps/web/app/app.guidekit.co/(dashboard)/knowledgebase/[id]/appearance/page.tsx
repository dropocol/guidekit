import { getSession } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import KnowledgebaseSettingsAppearance from "./KnowledgebaseSettingsAppearance";

export default async function KnowledgebaseSettingsAppearancePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const id = decodeURIComponent(params.id);
  const data = await prisma.knowledgebase.findUnique({
    where: {
      id: id,
    },
  });

  if (!data) {
    return <div>Knowledgebase not found</div>;
  }

  return <KnowledgebaseSettingsAppearance params={params} initialData={data} />;
}
