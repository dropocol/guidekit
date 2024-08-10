import { getSession } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function CollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // find collection
  const collection = await prisma.collection.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!collection) {
    notFound();
  }

  const subCollections = await prisma.subCollection.findMany({
    where: {
      collectionId: params.id,
    },
  });

  if (!subCollections) {
    notFound();
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          {collection!.name} - {subCollections.length} Sub Collections
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-1">
          {subCollections.map(async (subCollection) => {
            const articles = await prisma.article.findMany({
              where: {
                subCollectionId: subCollection.id,
              },
            });

            return (
              <div key={subCollection.id} className="mb-6">
                <Link
                  href={`/subcollection/${subCollection.id}`}
                  className="mb-2 block rounded-lg border border-stone-200 p-4 transition-all hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
                >
                  <h2 className="font-semibold">{subCollection.name}</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {subCollection.description}
                  </p>
                </Link>
                <div className="pl-4">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.id}`}
                      className="block py-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {article.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
