import {
  CollectionWithSubCollections,
  KnowledgebaseWithCollections,
} from "@/lib/types";

export interface CollectionListProps {
  collections: CollectionWithSubCollections[];
  onSelectCollection: (collection: CollectionWithSubCollections) => void;
}

export default function CollectionList({
  collections,
  onSelectCollection,
}: CollectionListProps) {
  return (
    <ul className="space-y-2">
      {collections.map((collection) => (
        <li key={collection.id}>
          <button
            onClick={() => onSelectCollection(collection)}
            className="block w-full rounded-lg p-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {collection.name} ({collection.articleCount} articles)
          </button>
        </li>
      ))}
    </ul>
  );
}
