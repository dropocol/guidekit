import {
  CollectionWithSubCollections,
  KnowledgebaseWithCollections,
} from "@/lib/types";
import { BookOpenIcon } from "lucide-react";

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
      {collections &&
        collections.map((collection) => (
          <li key={collection.id}>
            <button
              onClick={() => onSelectCollection(collection)}
              className="inline-flex w-full items-center justify-between rounded-lg p-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-stone-800"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{collection.pageIcon}</span>
                <span>{collection.name}</span>
              </span>
              <div className="flex items-center rounded-md bg-slate-100 px-1 py-0.5 pl-2 align-middle text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100">
                {/* <p className="ml-1">{data._count?.articles || 0} articles</p> */}
                {collection.articleCount}
                <BookOpenIcon height={12} />
              </div>
            </button>
          </li>
        ))}
    </ul>
  );
}
