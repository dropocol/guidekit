import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { knowledgebaseId, articleId } = await req.json();
  console.log("knowledgebaseId", knowledgebaseId);
  console.log("articleId", articleId);
  try {
    await prisma.$transaction(async (tx) => {
      // Update Knowledgebase visits
      await tx.knowledgebase.update({
        where: { id: knowledgebaseId },
        data: {
          totalVisitors: { increment: 1 },
          lastVisited: new Date(),
        },
      });

      // Update Article visits if articleId is provided
      if (articleId) {
        await tx.article.update({
          where: { id: articleId },
          data: {
            visits: { increment: 1 },
            lastVisited: new Date(),
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
