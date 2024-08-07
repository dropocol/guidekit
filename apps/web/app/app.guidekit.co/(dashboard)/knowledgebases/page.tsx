import { getSession } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CreateKnowledgebaseButton from "@/ui/knowledgebases/create-knowledgebase-button";
import { Suspense } from "react";
import PlaceholderCard from "@/ui/cards/placeholder-card";

export default async function KnowledgebasesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const knowledgebases = await prisma.knowledgebase.findMany({
    where: {
      userId: session.user?.id,
    },
    include: {},
  });

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Knowledgebases
          </h1>
          <CreateKnowledgebaseButton />
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
            {knowledgebases.map((kb) => (
              <Link
                key={kb.id}
                href={`/knowledgebase/${kb.id}`}
                className="rounded-lg border border-stone-200 p-4 transition-all hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
              >
                <h2 className="font-semibold">{kb.name}</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {/* {kb._count.articles} articles */}
                </p>
              </Link>
            ))}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
