import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";

async function getArticles(subCollectionId: string) {
  return await prisma.article.findMany({
    where: { subCollectionId },
  });
}

async function ArticlesList({ subCollectionId }: { subCollectionId: string }) {
  const articles = await getArticles(subCollectionId);

  return (
    <ul className="mt-2 space-y-1">
      {articles.map((article) => (
        <li key={article.id}>
          <Link
            href={`/article/${article.id}`}
            className="block rounded-md px-4 py-2 text-sm text-gray-700 transition-colors duration-150 ease-in-out hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {article.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ArticlesListSkeleton() {
  return (
    <ul className="mt-2 space-y-1">
      {[...Array(3)].map((_, index) => (
        <li key={index} className="animate-pulse">
          <div className="h-8 rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </li>
      ))}
    </ul>
  );
}

export default function SubCollection({
  subCollection,
}: {
  subCollection: { id: string; name: string; description: string };
}) {
  return (
    <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <Link
        href={`/subcollection/${subCollection.id}`}
        className="block p-6 transition-colors duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {subCollection.name}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {subCollection.description}
        </p>
      </Link>
      <div className="px-6 pb-6">
        <Suspense fallback={<ArticlesListSkeleton />}>
          <ArticlesList subCollectionId={subCollection.id} />
        </Suspense>
      </div>
    </div>
  );
}
