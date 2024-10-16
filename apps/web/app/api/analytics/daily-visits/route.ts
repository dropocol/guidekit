import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/auth";

const IS_MOCK = false; // Set this to false to use real data

interface DailyVisit {
  date: string;
  visits: number;
}

export async function GET() {
  if (IS_MOCK) {
    return NextResponse.json(generateMockData(15));
  }

  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 14); // Get data for the last 15 days

  const dailyVisits = await prisma.dailyAnalytics.groupBy({
    by: ["date"],
    where: {
      user: { email: session.user.email },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      totalVisits: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const formattedData = dailyVisits.map((entry) => ({
    date: entry.date.toISOString().split("T")[0],
    visits: entry._sum.totalVisits || 0,
  }));

  return NextResponse.json(formattedData);
}

function generateMockData(days: number): DailyVisit[] {
  const endDate = new Date();
  const mockData: DailyVisit[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);

    mockData.push({
      date: date.toISOString().split("T")[0],
      visits: Math.floor(Math.random() * 50000) + 1, // Random number between 1 and 100
    });
  }

  return mockData;
}
