import { getSession } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

import CreateKnowledgebaseButton from "@/ui/knowledgebases/create-knowledgebase-button";
import { Suspense } from "react";
import PlaceholderCard from "@/ui/cards/placeholder-card";
import KnowledgebaseCard from "@/ui/knowledgebases/knowledgebase-card";
import CreateKnowledgebaseModal from "@/ui/modal/create-knowledgebase";

export default async function KnowledgebasesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const knowledgebases = await prisma.knowledgebase.findMany({
    where: {
      userId: session.user?.id,
    },
    include: {
      // _count: {
      //   select: { articles: true },
      // },
    },
  });

  // Add a 5-second delay before rendering
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Knowledgebases
          </h1>
          <CreateKnowledgebaseButton>
            <CreateKnowledgebaseModal />
          </CreateKnowledgebaseButton>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {knowledgebases.map((kb: any) => (
              <KnowledgebaseCard key={kb.id} data={kb} />
            ))}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
