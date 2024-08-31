import { notFound } from "next/navigation";
import Link from "next/link";
import { getKnowledgebaseData } from "@/lib/fetchers";

export default async function DynamicPage({
  params,
}: {
  params: { domain: string; slug: string[] };
}) {
  console.log("params", params);
  const { domain, slug } = params;
  if (!domain || slug.length % 2 !== 0) {
    notFound();
  }
  const knowledgebase = await getKnowledgebaseData(domain);

  if (!knowledgebase) {
    notFound();
  }

  const [collectionSlug, collectionId, articleSlug, articleId] = slug;

  const collection = knowledgebase.collections.find(
    (c) => c.slug === collectionSlug && c.id === collectionId,
  );

  if (!collection) {
    notFound();
  }

  if (slug.length === 2) {
    // Render collection page
    return (
      <div>
        <h1>{collection.name}</h1>
        {collection.subCollections.map((subCollection) => (
          <div key={subCollection.id}>
            <h2>{subCollection.name}</h2>
            {subCollection.articles.map((article) => (
              <Link
                key={article.id}
                href={`/${domain}/${collectionSlug}/${collectionId}/${article.slug}/${article.id}`}
              >
                {article.title}
              </Link>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (slug.length === 4) {
    const article = collection.subCollections
      .flatMap((sc) => sc.articles)
      .find((a) => a.slug === articleSlug && a.id === articleId);

    if (!article) {
      notFound();
    }

    // Render article page
    return (
      <div>
        <h1>{article.title}</h1>
        {/* Render article content here */}
      </div>
    );
  }

  notFound();
}
