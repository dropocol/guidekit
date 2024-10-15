import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/auth";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString(),
    );
    const month = parseInt(
      searchParams.get("month") || (new Date().getMonth() + 1).toString(),
    );

    const monthlyAnalytics = await prisma.userMonthlyAnalytics.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
    });

    return NextResponse.json({
      totalVisits: monthlyAnalytics?.totalVisits || 0,
      year,
      month,
    });
  } catch (error) {
    console.error("Error fetching user monthly visits:", error);
    return NextResponse.json(
      { error: "Failed to fetch user monthly visits" },
      { status: 500 },
    );
  }
}
