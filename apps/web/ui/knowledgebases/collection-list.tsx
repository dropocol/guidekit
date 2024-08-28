import { Collection } from "@prisma/client";

type CollectionWithArticleCount = Collection & {
  _count: {
    articles: number;
  };
};

export default function CollectionList({
  collections,
  onSelectCollection,
}: {
  collections: CollectionWithArticleCount[];
  onSelectCollection: (collection: CollectionWithArticleCount) => void;
}) {
  return (
    <ul className="space-y-2">
      {collections.map((collection) => (
        <li key={collection.id}>
          <button
            onClick={() => onSelectCollection(collection)}
            className="block w-full rounded-lg p-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {collection.name} ({collection._count?.articles || 0} articles)
          </button>
        </li>
      ))}
    </ul>
  );
}
