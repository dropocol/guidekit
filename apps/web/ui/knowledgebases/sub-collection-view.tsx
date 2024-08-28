import Link from "next/link";
import { Collection, SubCollection, Article } from "@prisma/client";
import { Eye, Copy, Edit, RefreshCw } from "lucide-react";

type CollectionWithSubCollections = Collection & {
  subCollections: (SubCollection & {
    articles: Article[];
  })[];
};

export default function SubCollectionView({
  collection,
}: {
  collection: CollectionWithSubCollections;
}) {
  return (
    <div className="space-y-8">
      <h2 className="mb-4 font-cal text-2xl font-bold dark:text-white">
        {collection.name}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {collection.subCollections.map((subCollection) => (
          <div key={subCollection.id} className="rounded-lg">
            <h3 className="mb-2 font-semibold">{subCollection.name}</h3>
            <table className="min-w-full table-fixed divide-y divide-gray-200 rounded-lg shadow">
              <thead className="overflow-hidden rounded-t-lg bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Article
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    😞
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    😐
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    🤩
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 overflow-hidden rounded-b-lg bg-white">
                {subCollection.articles.map((article) => (
                  <tr key={article.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <Link
                          href={`/article/${article.id}`}
                          className="max-w-[280px] truncate text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {article.title || "Untitled Article"}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center">
                      <div className="items-right flex justify-end space-x-8">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Copy"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Resync"
                        >
                          <RefreshCw size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
