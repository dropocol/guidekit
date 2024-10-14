import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NotionAPI } from "notion-client";
import { Prisma } from "@prisma/client";
import { JsonValue, JsonObject } from "next-auth/adapters";
import { ExtendedRecordMap, RecordMap } from "notion-types";
import fs, { writeFile } from "fs";

const notion = new NotionAPI();

export async function POST(req: Request) {
  const { id } = await req.json();

  console.log("id", id);

  try {
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const convertedRecordMap = JSON.parse(article.recordMap as string);
    if (
      convertedRecordMap &&
      typeof convertedRecordMap === "object" &&
      Object.keys(convertedRecordMap).length > 0
    ) {
      // Parse the stored JSON before returning
      saveToFile("json/article-json.txt", article.recordMap);
      return NextResponse.json({
        recordMap: convertedRecordMap,
      });
    }

    // If recordMap doesn't exist or is empty, fetch it from Notion
    const recordMap = await notion.getPage(article.notion_id!);
    saveToFile("json/article-web.txt", recordMap);

    const savedRecordMap = JSON.stringify(recordMap);

    // Save the fetched recordMap to the article as a stringified JSON
    await prisma.article.update({
      where: { id },
      data: { recordMap: savedRecordMap },
    });

    // Return the newly fetched recordMap
    return NextResponse.json({ recordMap: recordMap });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
async function saveToFile(filePath: string, data: any) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

function ensureConsistentStructure(
  recordMap: ExtendedRecordMap,
): ExtendedRecordMap {
  // Ensure the order of top-level keys is consistent
  const orderedRecordMap: ExtendedRecordMap = {
    block: recordMap.block || {},
    collection: recordMap.collection || {},
    collection_view: recordMap.collection_view || {},
    notion_user: recordMap.notion_user || {},
    collection_query: recordMap.collection_query || {},
    signed_urls: recordMap.signed_urls || {},
  };

  return orderedRecordMap;
}
