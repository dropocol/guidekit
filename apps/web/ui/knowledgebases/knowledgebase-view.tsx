"use client";

import { KnowledgebaseWithCollections } from "@/lib/types";
import CollectionList from "./collection-list";
import SubCollectionView from "./sub-collection-view";
import { useState } from "react";

export default function KnowledgebaseView({
  knowledgebase,
}: {
  knowledgebase: KnowledgebaseWithCollections;
}) {
  const [selectedCollection, setSelectedCollection] = useState(
    knowledgebase.collections[0],
  );

  return (
    <div className="flex h-screen max-w-screen-2xl">
      <div className="w-1/4 overflow-y-auto border-r border-stone-200 p-4 dark:border-stone-700">
        <h1 className="mb-4 font-cal text-2xl font-bold dark:text-white">
          {knowledgebase.name}
        </h1>
        <CollectionList
          collections={knowledgebase.collections}
          onSelectCollection={setSelectedCollection}
        />
      </div>
      <div className="w-full overflow-y-auto bg-slate-100 p-8">
        {selectedCollection && (
          <SubCollectionView collection={selectedCollection} />
        )}
      </div>
    </div>
  );
}
