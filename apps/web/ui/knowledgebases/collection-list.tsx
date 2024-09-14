import {
  CollectionWithSubCollections,
  KnowledgebaseWithCollections,
} from "@/lib/types";
import { BookOpenIcon } from "lucide-react";

export interface CollectionListProps {
  collections: CollectionWithSubCollections[];
  onSelectCollection: (collection: CollectionWithSubCollections) => void;
  selectedCollectionId: string | null;
}

export default function CollectionList({
  collections,
  onSelectCollection,
  selectedCollectionId,
}: CollectionListProps) {
  return (
    <ul className="space-y-2">
      {collections &&
        collections.map((collection) => (
          <li key={collection.id}>
            <button
              onClick={() => onSelectCollection(collection)}
              className={`inline-flex w-full items-center justify-between rounded-lg p-2 text-left text-sm transition-colors ${
                selectedCollectionId === collection.id
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "hover:bg-slate-100 dark:hover:bg-stone-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{collection.pageIcon}</span>
                <span>{collection.name}</span>
              </span>
              <div className="flex items-center rounded-md bg-slate-100 px-1 py-0.5 pl-2 align-middle text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100">
                {collection.articleCount}
                <BookOpenIcon height={12} />
              </div>
            </button>
          </li>
        ))}
    </ul>
  );
}
