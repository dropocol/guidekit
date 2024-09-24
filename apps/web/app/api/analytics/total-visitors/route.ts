import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/auth";

export async function GET() {
  try {
    // console.log("Fetching total visitors");
    // console.log(process.env);
    // const result = await prisma.knowledgebase.aggregate({
    //   _sum: {
    //     totalVisitors: true,
    //   },
    // });

    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //TODO: Improve this query to only count visitors for the current user and in last 30 days
    const result = await prisma.knowledgebase.aggregate({
      where: {
        userId: session.user.id,
      },
      _sum: {
        totalVisitors: true,
      },
    });

    console.log("result", result);

    return NextResponse.json({ totalVisitors: result._sum.totalVisitors || 0 });
  } catch (error) {
    console.error("Error fetching total visitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch total visitors" },
      { status: 500 },
    );
  }
}
