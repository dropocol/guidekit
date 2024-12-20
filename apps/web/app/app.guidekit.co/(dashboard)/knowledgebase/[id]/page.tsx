"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import CollectionList from "@/ui/knowledgebases/collection-list";
import SubCollectionView from "@/ui/knowledgebases/sub-collection-view";
import {
  CollectionWithSubCollections,
  KnowledgebaseWithCollections,
} from "@/lib/types";
import KnowledgebaseHeader from "@/components/KnowledgebaseHeader";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { LoadingDots } from "@/ui/icons";
import { error, time } from "console";

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

  const [isResyncing, setIsResyncing] = useState(false);

  const fetchKnowledgebase = async () => {
    const response = await fetch(`/api/knowledgebase/${params.id}`);
    const data = await response.json();
    setKnowledgebase(data);
    if (data.collections && data.collections.length > 0) {
      setSelectedCollection(data.collections[0]);
    }
  };

  useEffect(() => {
    console.log("status", status);
    console.log("session", session);
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchKnowledgebase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  const handleResync = async () => {
    setIsResyncing(true);
    try {
      const response = await fetch("/api/knowledgebase/resync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.id }),
      });

      if (!response.ok) {
        // throw new Error("Failed to resync knowledgebase");
        const errorData = await response.json();
        console.log(errorData);
        const error = errorData.error || response.statusText;

        toast.error(
          error || "An error occurred while resyncing the knowledgebase",
        );
      } else {
        await fetchKnowledgebase();
        toast.success("Knowledgebase resynced successfully");
      }
    } catch (error) {
      console.error("Error resyncing knowledgebase:", error);
      toast.error("Failed to resync knowledgebase");
    } finally {
      setIsResyncing(false);
    }
  };

  if (!knowledgebase)
    return (
      <div className="flex h-10 w-full items-center justify-center">
        <LoadingDots />
      </div>
    );

  // For testing
  // new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <Suspense>
      <div className="flex h-screen max-w-screen-2xl flex-col">
        <div className="border-b border-stone-200 p-4 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <KnowledgebaseHeader
              name={knowledgebase.name}
              subdomain={knowledgebase.subdomain!}
              page={"Dashboard"}
            />
            <button
              onClick={handleResync}
              disabled={isResyncing}
              className="flex items-center rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isResyncing ? "animate-spin" : ""}`}
              />
              {isResyncing ? "Resyncing..." : "Resync"}
            </button>
          </div>
        </div>
        <div className="flex flex-1 bg-white">
          <div className="w-1/4 overflow-y-auto border-r border-stone-200 p-4 dark:border-stone-700">
            <h1 className="mb-4 font-cal text-2xl font-bold dark:text-white">
              Collections
            </h1>
            <CollectionList
              collections={
                knowledgebase.collections as CollectionWithSubCollections[]
              }
              onSelectCollection={(collection: CollectionWithSubCollections) =>
                setSelectedCollection(collection)
              }
              selectedCollectionId={selectedCollection?.id || null}
            />
          </div>
          <div className="w-3/4 overflow-y-auto bg-stone-50 p-8">
            {selectedCollection && (
              <SubCollectionView collection={selectedCollection} />
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
