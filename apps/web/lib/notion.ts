import { NotionAPI } from "notion-client";
import {
  // Block,
  CollectionInstance,
  ExtendedRecordMap,
  Role,
} from "notion-types";

import { Knowledgebase, Collection, SubCollection, ArticleInfo } from "./types";

import fs, { writeFile } from "fs";

const notion = new NotionAPI();

// ------------------------------------------------------------
// ------------------------------------------------------------
// ------------------------------------------------------------

export async function getNotionData(
  notionLink: string,
): Promise<Knowledgebase | Error> {
  try {
    const pageId = extractPageId(notionLink);
    const parentPage = await fetchPage(pageId);
    const parentCollection = await fetchCollectionPage(parentPage);

    const parentCollectionProcessed = processBlocks(parentCollection);

    for (const collection of parentCollectionProcessed) {
      if (collection.subCollections) {
        collection.subCollections = await Promise.all(
          collection.subCollections.map(async (subCollection) => {
            const subCollectionData = await notion.getCollectionData(
              subCollection.collection_id,
              subCollection.view_ids[0],
              {},
            );
            const subCollectionArticles =
              await processSubCollectionArticles(subCollectionData);
            return {
              ...subCollection,
              articles: subCollectionArticles,
            };
          }),
        );
      }
    }

    console.log(JSON.stringify(parentPage, null, 2));
    saveToFile("json/parentPage.json", parentPage);

    const updatedId = pageId.replace(
      /(.{8})(.{4})(.{4})(.{4})(.{12})/,
      "$1-$2-$3-$4-$5",
    );
    const knowledgebase: Knowledgebase = {
      id: updatedId,
      name: parentPage.block[updatedId].value.properties.title[0][0],
      notionLink,
      userId: "", // This should be set appropriately based on your application logic
      collections: parentCollectionProcessed,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return knowledgebase;

    // return {};
  } catch (error: any) {
    console.error("Error fetching Notion data:", error.message);
    return error;
  }
}

// ------------------------------------------------------------
// ------------------------------------------------------------
// ------------------------------------------------------------

function extractPageId(notionLink: string): string {
  const pageId = new URL(notionLink).pathname.split("-").pop();
  if (!pageId) throw new Error("No page ID found in the URL");
  return pageId;
}
// ------------------------------------------------------------
// ------------------------------------------------------------
// ------------------------------------------------------------

async function fetchCollectionPage(recordMap: ExtendedRecordMap) {
  const collectionBlockId = Object.keys(recordMap.collection)[0];
  const collectionViewId = Object.keys(recordMap.collection_view)[0];
  return await notion.getCollectionData(
    collectionBlockId,
    collectionViewId,
    {},
  );
}
// ------------------------------------------------------------
// ------------------------------------------------------------
// ------------------------------------------------------------

function processBlocks(collectionPage: any): Collection[] {
  const blocks = collectionPage.recordMap.block;
  const blockIds = JSON.parse(JSON.stringify(collectionPage)).result
    .reducerResults.collection_group_results.blockIds;

  const resultArray = Object.entries(blocks)
    .filter(([_, block]: [string, any]) => block.value.type === "page")
    .map(([blockId, block]: [string, any]) => {
      const subCollections: SubCollection[] = Object.values(blocks)
        .filter(
          (subBlock: any) =>
            subBlock.value.type === "collection_view" &&
            subBlock.value.parent_id === blockId,
        )
        .map((subBlock: any) => ({
          id: subBlock.value.id,
          type: subBlock.value.type,
          view_ids: subBlock.value.view_ids,
          collection_id: subBlock.value.collection_id,
        }));

      const blockCopy: Collection = {
        id: block.value.id,
        type: block.value.type,
        properties: block.value.properties,
        page_icon: block.value.format?.page_icon,
        subCollections,
      };
      return blockCopy;
    })
    .filter((block) => blockIds.includes(block.id));

  return blockIds
    .map((blockId: string) => resultArray.find((block) => block.id === blockId))
    .filter(Boolean);
}

// ------------------------------------------------------------
// ------------------------------------------------------------
// ------------------------------------------------------------

async function processSubCollectionArticles(
  subCollection: any,
): Promise<ArticleInfo[]> {
  const processedCollection: ArticleInfo[] = [];

  const blockIds =
    subCollection.result.reducerResults.collection_group_results.blockIds;
  const blocks = subCollection.recordMap.block;

  const matchingBlocks = blockIds
    .map((blockId: string | number) => blocks[blockId])
    .filter(Boolean);

  for (const block of matchingBlocks) {
    if (block.value.type === "page") {
      const pageInfo: ArticleInfo = {
        id: block.value.id,
        title: block.value.properties?.title?.[0]?.[0] || "Untitled",
        description: (block.value.properties as any)?.["b<py"]?.[0]?.[0] || "",
        properties: block.value.properties || {},
      };
      // collectionInfo.articles?.push(pageInfo);
      processedCollection.push(pageInfo);
    }
  }

  return processedCollection;
}

async function saveToFile(filePath: string, data: any) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function fetchPage(pageId: string): Promise<ExtendedRecordMap> {
  return await notion.getPage(pageId);
}
