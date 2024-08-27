import { getSession } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import SubCollection from "./SubCollection";

async function getCollectionData(id: string) {
  const [collection, subCollections] = await Promise.all([
    prisma.collection.findUnique({ where: { id } }),
    prisma.subCollection.findMany({ where: { collectionId: id } }),
  ]);

  if (!collection || !subCollections) {
    notFound();
  }

  return { collection, subCollections };
}

export default async function CollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { collection, subCollections } = await getCollectionData(params.id);

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          {collection.name} - {subCollections.length} Sub Collections
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-1">
          {subCollections.map((subCollection) => (
            <SubCollection
              key={subCollection.id}
              subCollection={subCollection}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
