"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CollectionList, {
  CollectionListProps,
} from "@/ui/knowledgebases/collection-list";
import SubCollectionView from "@/ui/knowledgebases/sub-collection-view";
import { Knowledgebase, Collection } from "@prisma/client";
import {
  CollectionWithSubCollections,
  KnowledgebaseWithCollections,
  SubCollection,
} from "@/lib/types";

export default function KnowledgebasePage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [knowledgebase, setKnowledgebase] =
    useState<KnowledgebaseWithCollections | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionWithSubCollections | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchKnowledgebase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, params.id]);

  const fetchKnowledgebase = async () => {
    const response = await fetch(`/api/knowledgebase/${params.id}`);
    const data = await response.json();
    setKnowledgebase(data);
    if (data.collections && data.collections.length > 0) {
      setSelectedCollection(data.collections[0]);
    }
  };

  if (!knowledgebase) return <div>Loading...</div>;

  return (
    <div className="flex h-screen max-w-screen-2xl">
      <div className="w-1/4 overflow-y-auto border-r border-stone-200 p-4 dark:border-stone-700">
        <h1 className="mb-4 font-cal text-2xl font-bold dark:text-white">
          {knowledgebase.name}
        </h1>
        <CollectionList
          collections={
            knowledgebase.collections as CollectionWithSubCollections[]
          }
          onSelectCollection={(collection: CollectionWithSubCollections) =>
            setSelectedCollection(collection)
          }
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
