import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { knowledgebaseId, articleId } = await req.json();

  if (!knowledgebaseId) {
    return NextResponse.json(
      { error: "Knowledgebase ID is required" },
      { status: 400 },
    );
  }

  try {
    const knowledgebase = await prisma.knowledgebase.findUnique({
      where: { id: knowledgebaseId },
      select: { userId: true },
    });

    if (!knowledgebase) {
      return NextResponse.json(
        { error: "Knowledgebase not found" },
        { status: 404 },
      );
    }

    const userId = knowledgebase.userId;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    await prisma.$transaction(async (tx) => {
      // Create or update KnowledgebaseAnalytics
      const knowledgebaseAnalytics = await tx.knowledgebaseAnalytics.upsert({
        where: { knowledgebaseId },
        update: {
          totalVisits: { increment: 1 },
          lastVisited: now,
        },
        create: {
          knowledgebaseId,
          userId,
          totalVisits: 1,
          lastVisited: now,
        },
      });

      // Create or update UserMonthlyAnalytics
      await tx.userMonthlyAnalytics.upsert({
        where: {
          userId_year_month: {
            userId,
            year,
            month,
          },
        },
        update: {
          totalVisits: { increment: 1 },
        },
        create: {
          userId,
          year,
          month,
          totalVisits: 1,
        },
      });

      // Create or update DailyAnalytics for knowledgebase
      await tx.dailyAnalytics.upsert({
        where: {
          date_knowledgebaseAnalyticsId: {
            date: today,
            knowledgebaseAnalyticsId: knowledgebaseAnalytics.id,
          },
        },
        update: {
          totalVisits: { increment: 1 },
        },
        create: {
          userId,
          date: today,
          totalVisits: 1,
          knowledgebaseAnalyticsId: knowledgebaseAnalytics.id,
        },
      });

      if (articleId) {
        // Create or update ArticleAnalytics
        const articleAnalytics = await tx.articleAnalytics.upsert({
          where: { articleId },
          update: {
            totalVisits: { increment: 1 },
            lastVisited: now,
          },
          create: {
            articleId,
            userId,
            totalVisits: 1,
            lastVisited: now,
          },
        });

        // Create or update DailyAnalytics for article
        await tx.dailyAnalytics.upsert({
          where: {
            date_articleAnalyticsId: {
              date: today,
              articleAnalyticsId: articleAnalytics.id,
            },
          },
          update: {
            totalVisits: { increment: 1 },
          },
          create: {
            userId,
            date: today,
            totalVisits: 1,
            articleAnalyticsId: articleAnalytics.id,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording visit:", error);
    return NextResponse.json(
      { error: "Failed to record visit" },
      { status: 500 },
    );
  }
}
