import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.knowledgebase.aggregate({
      _sum: {
        totalVisitors: true,
      },
    });

    return NextResponse.json({ totalVisitors: result._sum.totalVisitors || 0 });
  } catch (error) {
    console.error("Error fetching total visitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch total visitors" },
      { status: 500 },
    );
  }
}
