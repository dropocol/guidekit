import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { NotionAPI } from "notion-client";
import { ExtendedRecordMap } from "notion-types";

const notion = new NotionAPI();

export async function POST(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const pageId = id.replace(/[^a-zA-Z0-9]/g, "");
    const recordMap: ExtendedRecordMap = await notion.getPage(pageId);

    return NextResponse.json({ recordMap });
  } catch (error) {
    console.error("Error fetching Notion page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 },
    );
  }
}
