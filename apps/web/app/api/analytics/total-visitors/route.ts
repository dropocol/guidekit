import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const knowledgebaseId = searchParams.get("knowledgebaseId");

  if (!knowledgebaseId) {
    return NextResponse.json(
      { error: "Knowledgebase ID is required" },
      { status: 400 },
    );
  }

  try {
    const analytics = await prisma.knowledgebaseAnalytics.findUnique({
      where: { knowledgebaseId },
      select: { totalVisitors: true, userId: true },
    });

    if (!analytics) {
      return NextResponse.json({ totalVisitors: 0, userId: null });
    }

    return NextResponse.json({
      totalVisitors: analytics.totalVisitors,
      userId: analytics.userId,
    });
  } catch (error) {
    console.error("Error fetching total visitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch total visitors" },
      { status: 500 },
    );
  }
}
