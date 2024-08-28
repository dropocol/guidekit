import Link from "next/link";
import { Collection, SubCollection, Article } from "@prisma/client";

type CollectionWithSubCollections = Collection & {
  subCollections: (SubCollection & {
    articles: Article[];
  })[];
};

export default function SubCollectionView({
  collections,
}: {
  collections: CollectionWithSubCollections[];
}) {
  return (
    <div className="space-y-8">
      {collections.map((collection) => (
        <div key={collection.id} id={collection.id} className="scroll-mt-16">
          <h2 className="mb-4 font-cal text-2xl font-bold dark:text-white">
            {collection.name}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collection.subCollections.map((subCollection) => (
              <div
                key={subCollection.id}
                className="rounded-lg border border-stone-200 p-4 dark:border-stone-700"
              >
                <h3 className="mb-2 font-semibold">{subCollection.name}</h3>
                <ul className="space-y-1">
                  {subCollection.articles.map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/article/${article.id}`}
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
