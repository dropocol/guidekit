import { notFound } from "next/navigation";
import Link from "next/link";
import { getKnowledgebaseData } from "@/lib/fetchers";
import PublicKnowledgebaseView from "@/ui/knowledgebases/public-knowledgebase-view";
import prisma from "@/lib/prisma";
import ArticleContent from "@/components/ArticleContent";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { domain: string; slug: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const domain = decodeURIComponent(params.domain);
  const { slug } = params;

  const knowledgebase = await getKnowledgebaseData(domain);
  if (!knowledgebase) {
    return {
      title: "Not Found",
      description: "The requested knowledgebase could not be found.",
    };
  }

  let title = knowledgebase.name;
  let description =
    knowledgebase.description || `Knowledgebase for ${knowledgebase.name}`;
  let image = knowledgebase.image || "/og-image.jpg"; // Ensure you have a default OG image

  if (slug.length === 4) {
    const [collectionSlug, collectionId, articleSlug, articleId] = slug;
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { subCollection: { include: { collection: true } } },
    });

    if (article) {
      title = `${article.title} | ${knowledgebase.name}`;
      description = article.description || `Article in ${knowledgebase.name}`;
      // You can use article.image here if you have one, otherwise fallback to knowledgebase image
    }
  } else if (slug.length === 2) {
    const [collectionSlug, collectionId] = slug;
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (collection) {
      title = `${collection.name} | ${knowledgebase.name}`;
      description =
        collection.description || `Collection in ${knowledgebase.name}`;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image ? image : "/og-image.png"],
      type: "website",
      siteName: knowledgebase.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image ? image : "/og-image.png"],
    },
    icons: [knowledgebase.logo ? knowledgebase.logo : "/favicon.png"],
    metadataBase: new URL(domain),
  };
}

export default async function DynamicPage({
  params,
}: {
  params: { domain: string; slug: string[] };
}) {
  // Decode the domain parameter
  const domain = decodeURIComponent(params.domain);
  const { slug } = params;

  if (!domain || slug.length % 2 !== 0) {
    notFound();
  }

  const knowledgebase = await getKnowledgebaseData(domain);

  if (!knowledgebase) {
    notFound();
  }

  const [collectionSlug, collectionId, articleSlug, articleId] = slug;

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: {
      subCollections: {
        include: {
          articles: true,
        },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  const breadcrumbs = [
    { name: "All Categories", href: `/` },
    {
      name: collection.name,
      href: `/${collectionSlug}/${collectionId}`,
    },
  ];

  if (slug.length === 2) {
    // Render collection page
    return (
      <PublicKnowledgebaseView
        knowledgebase={knowledgebase}
        breadcrumbs={breadcrumbs}
      >
        <div className="mx-auto mt-3 w-full">
          {collection.subCollections.map((subCollection: any) => (
            <div key={subCollection.id}>
              <span className="contents">
                <h1 className="sr-only">{subCollection.name}</h1>
                <div
                  id={`subcollection-${subCollection.id}`}
                  className="helpkit-subcollection-wrapper glass-bg mb-7 transform rounded-md bg-white px-4 pb-2 pt-4 shadow-lg sm:px-6 sm:py-5 dark:bg-[#111828]"
                >
                  <h2 className="mb-2.5 text-lg font-medium opacity-70 sm:mb-4 sm:text-xl sm:font-bold dark:text-white">
                    {subCollection.name}
                  </h2>
                  {subCollection.articles.map((article: any) => (
                    <Link
                      key={article.id}
                      href={`/${collectionSlug}/${collectionId}/${article.slug}/${article.id}`}
                      className="helpkit-article-card mb-5 flex w-full transform flex-col items-start justify-center rounded-md border-l-[3px] border-t-[1px] border-t-gray-200 bg-white px-5 py-4 shadow-md hover:scale-[1.01] sm:h-[85px] dark:border-t-gray-800 dark:bg-[#18233B] dark:text-white"
                      style={{ borderLeftColor: "rgb(76, 29, 149)" }}
                    >
                      <h3 className="font-medium leading-tight sm:text-xl sm:leading-normal">
                        {article.title}
                      </h3>
                      <p className="mt-0.5 text-sm leading-tight text-gray-700 sm:text-base sm:leading-[1.2] dark:text-gray-100">
                        {article.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </span>
            </div>
          ))}
        </div>
      </PublicKnowledgebaseView>
    );
  }

  if (slug.length === 4) {
    const article = collection.subCollections
      .flatMap((sc: any) => sc.articles)
      .find((a: any) => a.slug === articleSlug && a.id === articleId);

    if (!article) {
      console.log("Article not found");
      notFound();
    }

    breadcrumbs.push({
      name: article.title,
      href: `/${collectionSlug}/${collectionId}/${articleSlug}/${articleId}`,
    });

    // Render article page
    return (
      <PublicKnowledgebaseView
        knowledgebase={knowledgebase}
        breadcrumbs={breadcrumbs}
      >
        <div className="mx-auto mt-3 w-full">
          <ArticleContent
            articleId={article.id}
            title={article.title}
            knowledgebaseId={knowledgebase.id}
          />
        </div>
      </PublicKnowledgebaseView>
    );
  }

  notFound();
}
