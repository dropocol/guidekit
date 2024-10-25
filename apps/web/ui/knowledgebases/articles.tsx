import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ArticleCard from "../cards/article-card";
import Image from "next/image";

export default async function Articles({
  siteId,
  limit,
}: {
  siteId?: string;
  limit?: number;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const topArticles = await prisma.articleAnalytics.findMany({
    where: {
      userId: session.user.id as string,
      article: {
        isNot: undefined,
        knowledgebase: {
          isNot: undefined,
        },
      },
    },
    orderBy: {
      totalVisits: "desc",
    },
    take: limit,
    include: {
      article: {
        include: {
          knowledgebase: true,
        },
      },
    },
  });

  // Filter out any null articles (in case of inconsistencies)
  const validTopArticles = topArticles.filter(
    (analytics) => analytics.article !== null,
  );

  const articles = topArticles.map((analytics) => analytics.article);

  return articles.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {articles.map((article) => {
        return <ArticleCard key={article.id} data={{ ...article }} />;
      })}
    </div>
  ) : (
    <div className="flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl">No Articles Yet</h1>
      <Image
        alt="missing post"
        src="https://illustrations.popsy.co/gray/graphic-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any articles yet. Create one to get started.
      </p>
    </div>
  );
}
