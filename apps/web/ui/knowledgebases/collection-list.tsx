import Link from "next/link";
import { Collection } from "@prisma/client";

export default function CollectionList({
  collections,
}: {
  collections: Collection[];
}) {
  return (
    <ul className="space-y-2">
      {collections.map((collection) => (
        <li key={collection.id}>
          <Link
            href={`#${collection.id}`}
            className="block rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {collection.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
