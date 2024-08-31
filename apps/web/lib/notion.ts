import { NotionAPI } from "notion-client";
import { NotionToMarkdown } from "notion-to-md";
const { Client } = require("@notionhq/client");

import {
  // Block,
  CollectionInstance,
  ExtendedRecordMap,
  Role,
} from "notion-types";

import { Knowledgebase, Collection, SubCollection, Article } from "./types";

import fs, { writeFile } from "fs";

// const notionForMarkdown = new Client({
//   auth: process.env.NOTION_API_KEY,
// });

// const n2m = new NotionToMarkdown({ notionClient: notionForMarkdown });
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

    await saveToFile("json/parentCollection.json", parentCollection);

    const parentCollectionProcessed = processBlocks(parentCollection);

    saveToFile(
      "json/parentCollectionProcessed.json",
      parentCollectionProcessed,
    );

    for (const collection of parentCollectionProcessed) {
      let totalArticleCount = 0;
      if (collection.subCollections) {
        collection.subCollections = await Promise.all(
          collection.subCollections.map(async (subCollection) => {
            const subCollectionData = await notion.getCollectionData(
              subCollection.collection_id,
              subCollection.view_ids[0],
              {},
            );

            const { name, description } = extractSubCollectionInfo(
              subCollectionData,
              subCollection.collection_id,
            );

            const articles =
              await processSubCollectionArticles(subCollectionData);
            const articleCount = articles.length;
            totalArticleCount += articleCount;

            return {
              ...subCollection,
              name,
              description,
              articles,
              articleCount,
            };
          }),
        );
      }

      console.log("Total Article Count : ", totalArticleCount);
      collection.articleCount = totalArticleCount;
    }

    const updatedId = pageId.replace(
      /(.{8})(.{4})(.{4})(.{4})(.{12})/,
      "$1-$2-$3-$4-$5",
    );
    const knowledgebase: Knowledgebase = {
      id: updatedId,
      name: parentPage.block[updatedId].value.properties.title[0][0],
      notionLink,
      userId: "", //TODO : This should be set appropriately based on your application logic
      collections: parentCollectionProcessed,
      createdAt: new Date(),
      updatedAt: new Date(),
      articleCount: 0, // Initialize articleCount
    };

    // console.log(JSON.stringify(knowledgebase.collections, null, 2));

    // Calculate total articleCount
    knowledgebase.articleCount = knowledgebase.collections.reduce(
      (total, collection) => total + collection.articleCount,
      0,
    );

    console.log(
      JSON.stringify(knowledgebase.collections[0].articleCount, null, 2),
    );

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

function extractSubCollectionInfo(
  subCollectionData: any,
  collectionId: string,
) {
  const collection = subCollectionData.recordMap.collection[collectionId];
  if (collection) {
    const name = collection.value.name[0][0];
    const description = collection.value.description
      ? collection.value.description[0][0]
      : "";
    return { name, description };
  }
  return { name: "", description: "" };
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
  const tempSubCollections: any = [];

  const collection = collectionPage.recordMap.collection;
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
          name: "Untitled",
          slug: "",
          description: "",
          view_ids: subBlock.value.view_ids,
          collection_id: subBlock.value.collection_id, // Changed from collectionId
          articles: [],
          articleCount: 0,
        }));

      // const articleCount = subCollections.reduce(
      //   (total, subCollection) => total + subCollection.articles.length,
      //   0,
      // );

      // console.log("Article Count : ", articleCount);
      const name = block.value.properties?.title?.[0]?.[0] || "Untitled";
      const slug = name.toLowerCase().replace(/ /g, "-");
      const blockCopy: Collection = {
        id: block.value.id,
        type: block.value.type,
        properties: block.value.properties,
        // name: block.value.properties?.title?.[0]?.[0] || "Untitled",
        name,
        slug,
        description: block.value.properties?.["A^D`"]?.[0]?.[0] || "",
        pageIcon: block.value.format?.page_icon,
        subCollections,
        articleCount: subCollections.reduce(
          (total, subCollection) => total + subCollection.articleCount,
          0,
        ),
        knowledgebaseId: "", // TODO: Add this late
      };

      console.log("blockCopy", blockCopy);
      return blockCopy;
    })
    .filter((block) => blockIds.includes(block.id));

  saveToFile("json/tempSubCollections.json", tempSubCollections);

  return blockIds
    .map((blockId: string) => resultArray.find((block) => block.id === blockId))
    .filter(Boolean);
}

// ------------------------------------------------------------
// ------------------------------------------------------------
// ------------------------------------------------------------

async function getSubCollectionInfo(subCollection: any) {
  const subCollectionInfo =
    subCollection.recordMap.collection![subCollection.id].value;
}

async function processSubCollectionArticles(
  subCollection: any,
): Promise<Article[]> {
  const processedCollection: Article[] = [];

  const blockIds =
    subCollection.result.reducerResults.collection_group_results.blockIds;
  const blocks = subCollection.recordMap.block;

  const matchingBlocks = blockIds
    .map((blockId: string | number) => blocks[blockId])
    .filter(Boolean);

  for (const block of matchingBlocks) {
    if (block.value.type === "page") {
      const title = block.value.properties?.title?.[0]?.[0] || "Untitled";
      const slug = title.toLowerCase().replace(/ /g, "-");
      const pageInfo: Article = {
        id: block.value.id,
        title: title,
        slug: slug,
        description: (block.value.properties as any)?.["b<py"]?.[0]?.[0] || "",
        properties: block.value.properties || {},
        recordMap: subCollection.recordMap, // Add this line
        subCollectionId: subCollection.result.collection_id, // Add this line
      };
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
