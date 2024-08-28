import { Collection } from "@prisma/client";

export default function CollectionList({
  collections,
  onSelectCollection,
}: {
  collections: Collection[];
  onSelectCollection: (collection: Collection) => void;
}) {
  return (
    <ul className="space-y-2">
      {collections.map((collection) => (
        <li key={collection.id}>
          <button
            onClick={() => onSelectCollection(collection)}
            className="block w-full rounded-lg p-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {collection.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
