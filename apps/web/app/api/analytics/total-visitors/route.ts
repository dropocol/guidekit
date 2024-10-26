import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const IS_MOCK = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function GET(req: NextRequest) {
  if (IS_MOCK) {
    return NextResponse.json({
      totalVisitors: Math.floor(Math.random() * 100000) + 1,
    });
  }

  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

    const totalVisits = await prisma.userMonthlyAnalytics.aggregate({
      _sum: {
        totalVisits: true,
      },
      where: {
        year: currentYear,
        month: currentMonth,
      },
    });

    return NextResponse.json({
      totalVisitors: totalVisits._sum.totalVisits || 0,
    });
  } catch (error) {
    console.error("Error fetching total visitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch total visitors" },
      { status: 500 },
    );
  }
}
