import { NotionAPI } from "notion-client";
import {
  // Block,
  CollectionInstance,
  ExtendedRecordMap,
  Role,
} from "notion-types";
import fs, { writeFile } from "fs";

const notion = new NotionAPI();

type Collection = {
  role: Role;
  value: Block;
};

interface ArticleInfo {
  id: string;
  title: string;
  properties: Record<string, any>;
  schema?: Record<string, any>;
  description: string;
}

interface CollectionArticleList {
  id: string;
  title: string;
  articles: ArticleInfo[];
}

type Block = {
  id: string;
  type: string;
  properties: Record<string, any>;
  page_icon?: string;
  subCollections?: {
    id: string;
    type: string;
    view_ids: string[];
    collection_id: string;
  }[];
};

export async function getNotionData(notionLink: string) {
  try {
    const pageId = extractPageId(notionLink);
    const parentPage = await fetchPage(pageId);
    await saveToFile("json/parentPage.json", parentPage);

    const parentCollection = await fetchCollectionPage(parentPage);
    await saveToFile("json/parentCollection.json", parentCollection);

    const parentCollectionProcessed = processBlocks(parentCollection);
    await saveToFile(
      "json/parentCollectionProcessed.json",
      parentCollectionProcessed,
    );

    const subCollections = await fetchSubCollections(parentCollectionProcessed);
    await saveToFile("json/subCollections.json", subCollections);

    const subCollectionsProcessed = await processSubCollections(subCollections);

    await saveToFile(
      "json/subCollectionsProcessed.json",
      subCollectionsProcessed,
    );

    const article = await fetchPage("fdcbe228-9ca5-4cb2-be32-4697637c21ae");
    await saveToFile("json/article.json", article);

    return true;
  } catch (error: any) {
    console.error("Error fetching Notion data:", error.message);
    return null;
  }
}

function extractPageId(notionLink: string): string {
  const pageId = new URL(notionLink).pathname.split("-").pop();
  if (!pageId) throw new Error("No page ID found in the URL");
  return pageId;
}

async function fetchCollectionPage(recordMap: ExtendedRecordMap) {
  const collectionBlockId = Object.keys(recordMap.collection)[0];
  const collectionViewId = Object.keys(recordMap.collection_view)[0];
  return await notion.getCollectionData(
    collectionBlockId,
    collectionViewId,
    {},
  );
}

function processBlocks(collectionPage: any): Collection[] {
  const blocks = collectionPage.recordMap.block;
  const blockIds = JSON.parse(JSON.stringify(collectionPage)).result
    .reducerResults.collection_group_results.blockIds;

  const resultArray = Object.entries(blocks)
    .filter(([_, block]: [string, any]) => block.value.type === "page")
    .map(([blockId, block]: [string, any]) => {
      const subCollections = Object.values(blocks)
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

      const blockCopy: Block = {
        id: block.value.id,
        type: block.value.type,
        properties: block.value.properties,
        page_icon: block.value.format?.page_icon,
        subCollections,
      };
      return { role: block.role, value: blockCopy };
    })
    .filter((block) => blockIds.includes(block.value.id));

  return blockIds
    .map((blockId: string) =>
      resultArray.find((block) => block.value.id === blockId),
    )
    .filter(Boolean);
}

async function fetchSubCollections(resultArray: Collection[]) {
  const subCollectionDataArray = [];
  for (const item of resultArray) {
    if (item.value.subCollections) {
      for (const subCollection of item.value.subCollections) {
        const subCollectionId = subCollection.collection_id;
        const subCollectionViewId = subCollection.view_ids?.[0];

        if (!subCollectionViewId) {
          console.error(
            `No view_ids found for sub-collection ${subCollectionId}`,
          );
          continue;
        }

        try {
          const subCollectionData = await notion.getCollectionData(
            subCollectionId!,
            subCollectionViewId,
            {},
          );
          subCollectionDataArray.push(subCollectionData);
        } catch (error) {
          console.error(
            `Failed to fetch data for sub-collection ${subCollectionId}:`,
            error,
          );
        }
      }
    }
  }

  return subCollectionDataArray;
}

async function processSubCollections(
  subCollections: any[],
): Promise<CollectionArticleList[]> {
  const processedCollections: CollectionArticleList[] = [];

  for (const subCollection of subCollections) {
    const blockIds =
      subCollection.result.reducerResults.collection_group_results.blockIds;
    const blocks = subCollection.recordMap.block;

    const matchingBlocks = blockIds
      .map((blockId: string | number) => blocks[blockId])
      .filter(Boolean);

    const collectionId = Object.keys(subCollection.recordMap.collection)[0];
    const collection = subCollection.recordMap.collection[collectionId].value;

    const collectionInfo: CollectionArticleList = {
      id: collectionId,
      title: collection.name[0][0] || "Untitled",
      articles: [],
    };

    for (const block of matchingBlocks) {
      if (block.value.type === "page") {
        console.log(block.value);
        const pageInfo: ArticleInfo = {
          id: block.value.id,
          title: block.value.properties?.title?.[0]?.[0] || "Untitled",
          description: block.value.properties?.["b<py"]?.[0]?.[0] || "",
          properties: block.value.properties || {},
          // schema: block.value.schema,
        };
        collectionInfo.articles.push(pageInfo);
      }
    }

    processedCollections.push(collectionInfo);
  }

  return processedCollections;
}

async function saveToFile(filePath: string, data: any) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function fetchPage(pageId: string): Promise<ExtendedRecordMap> {
  return await notion.getPage(pageId);
}
