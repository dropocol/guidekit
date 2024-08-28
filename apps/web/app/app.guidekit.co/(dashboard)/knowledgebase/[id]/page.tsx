import { getSession } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CollectionList from "@/ui/knowledgebases/collection-list";
import SubCollectionView from "@/ui/knowledgebases/sub-collection-view";

export default async function KnowledgebasePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const knowledgebase = await prisma.knowledgebase.findUnique({
    where: { id: params.id },
    include: {
      collections: {
        include: {
          subCollections: {
            include: {
              articles: true,
            },
          },
        },
      },
    },
  });

  if (!knowledgebase) {
    notFound();
  }

  return (
    <div className="flex h-screen max-w-screen-xl">
      <div className="w-1/4 overflow-y-auto border-r border-stone-200 p-4 dark:border-stone-700">
        <h1 className="mb-4 font-cal text-2xl font-bold dark:text-white">
          {knowledgebase.name}
        </h1>
        <CollectionList collections={knowledgebase.collections} />
      </div>
      <div className="w-3/4 overflow-y-auto p-8">
        <SubCollectionView collections={knowledgebase.collections} />
      </div>
    </div>
  );
}
