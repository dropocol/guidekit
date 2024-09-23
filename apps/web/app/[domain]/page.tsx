import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getKnowledgebaseData } from "@/lib/fetchers";
import { KnowledgebaseWithCollections } from "@/lib/types";
import PublicKnowledgebaseView from "@/ui/knowledgebases/public-knowledgebase-view";

// export async function generateStaticParams() {
//   const allKnowledgebases = await prisma.knowledgebase.findMany({
//     select: {
//       subdomain: true,
//       customDomain: true,
//     },
//   });

//   const allPaths = allKnowledgebases
//     .flatMap(({ subdomain, customDomain }) => [
//       subdomain && {
//         domain: `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
//       },
//       customDomain && {
//         domain: customDomain,
//       },
//     ])
//     .filter(Boolean);

//   return allPaths;
// }

export default async function KnowledgebasePage({
  params,
}: {
  params: { domain: string };
}) {
  const domain = decodeURIComponent(params.domain);

  const data = await getKnowledgebaseData(domain);

  if (!data || !isValidKnowledgebase(data)) {
    return notFound();
  }

  const breadcrumbs = [{ name: "All Categories", href: `/` }];

  return (
    <PublicKnowledgebaseView knowledgebase={data} breadcrumbs={breadcrumbs}>
      <div className="mx-auto mt-3 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {data.collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/${collection.slug}/${collection.id}`}
            className="mb-5 block transform shadow-xl shadow-gray-200/50 transition hover:scale-[1.02]"
          >
            <div className="helpsite-shadow relative h-[215px] rounded bg-white text-center dark:bg-[#18233B]">
              <div className="flex h-full w-full flex-grow flex-col items-center justify-center px-8">
                <div className="mb-1 block">
                  <div className="mb-2">
                    <span className="helpkit-category-icon-emoji text-4xl">
                      {collection.pageIcon || "📄"}
                    </span>
                  </div>
                  <h2 className="text-primary-800 line-clamp-2 text-2xl font-bold dark:text-white">
                    {collection.name}
                  </h2>
                </div>
                <p className="mb-2 line-clamp-2 leading-snug text-gray-700 dark:text-gray-50">
                  {collection.description}
                </p>
                <p className="helpkit-category-article-count mt-2 text-xs font-medium text-gray-600">
                  {collection.articleCount}{" "}
                  {collection.articleCount === 1 ? "Article" : "Articles"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PublicKnowledgebaseView>
  );
}

// Type guard function to validate the data structure
function isValidKnowledgebase(data: any): data is KnowledgebaseWithCollections {
  return (
    data.collections &&
    Array.isArray(data.collections) &&
    data.collections.every(
      (collection: any) =>
        collection.slug && typeof collection.slug === "string",
    )
  );
}
