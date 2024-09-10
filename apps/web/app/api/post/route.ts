import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NotionAPI } from "notion-client";

const notion = new NotionAPI();

export async function POST(req: Request) {
  const { id } = await req.json();

  try {
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const recordMap = await notion.getPage(article.id);

    // return NextResponse.json({ recordMap: article.recordMap });
    return NextResponse.json({ recordMap: recordMap });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
