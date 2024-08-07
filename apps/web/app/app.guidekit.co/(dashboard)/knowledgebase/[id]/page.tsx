import { getSession } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

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
    where: {
      id: params.id,
    },
    include: {
      // articles: true,
    },
  });

  if (!knowledgebase || knowledgebase.userId !== session.user?.id) {
    notFound();
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          {knowledgebase.name}
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* {knowledgebase.articles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="rounded-lg border border-stone-200 p-4 transition-all hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
            >
              <h2 className="font-semibold">{article.title}</h2>
            </Link>
          ))} */}
        </div>
      </div>
    </div>
  );
}
