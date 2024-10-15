import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
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
