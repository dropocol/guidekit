import { NotionAPI } from "notion-client";
import { Block, ExtendedRecordMap, Role } from "notion-types";
import fs, { writeFile } from "fs";

const notion = new NotionAPI();

interface CollectionInfo {
  id: string;
  title: string;
  description: string;
  items: PageInfo[];
  // subCollections: CollectionInfo[];
}

interface PageInfo {
  id: string;
  title: string;
  description: string;
  properties: Record<string, any>;
}

type ResultArrayItem = {
  role: Role;
  value: GKBlock;
};

type GKBlock = Block & {
  subCollections?: ResultArrayItem[];
  collection_id?: string;
  view_ids?: string[];
};

export async function getNotionData(notionLink: string) {
  try {
    const pageId = extractPageId(notionLink);
    const parentPage = await fetchPage(pageId);
    // await saveToFile("json/parentPage.json", parentPage);

    const parentCollection = await fetchCollectionPage(parentPage);
    // await saveToFile("json/parentCollection.json", parentCollection);

    const parentCollectionProcessed = processBlocks(parentCollection);
    // await saveToFile(
    //   "json/parentCollectionProcessed.json",
    //   parentCollectionProcessed,
    // );

    const subCollections = await fetchSubCollections(parentCollectionProcessed);
    // await saveToFile("json/subCollections.json", subCollections);

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

function processBlocks(collectionPage: any): ResultArrayItem[] {
  const blocks = collectionPage.recordMap.block;
  const blockIds = JSON.parse(JSON.stringify(collectionPage)).result
    .reducerResults.collection_group_results.blockIds;

  const resultArray = Object.entries(blocks)
    .filter(([_, block]: [string, any]) => block.value.type === "page")
    .map(([blockId, block]: [string, any]) => {
      const subCollections = Object.values(blocks).filter(
        (subBlock: any) =>
          subBlock.value.type === "collection_view" &&
          subBlock.value.parent_id === blockId,
      );

      const blockCopy: GKBlock = { ...block.value, subCollections };
      return { role: block.role, value: blockCopy };
    })
    .filter((block) => blockIds.includes(block.value.id));

  return blockIds
    .map((blockId: string) =>
      resultArray.find((block) => block.value.id === blockId),
    )
    .filter(Boolean);
}

async function fetchSubCollections(resultArray: ResultArrayItem[]) {
  const subCollectionDataArray = [];
  const firstItem = resultArray[0];

  if (firstItem?.value.subCollections) {
    for (const subCollection of firstItem.value.subCollections) {
      const subCollectionId = subCollection.value.collection_id;
      const subCollectionViewId = subCollection.value.view_ids?.[0];

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

  return subCollectionDataArray;
}

async function processSubCollections(
  subCollections: any[],
): Promise<CollectionInfo[]> {
  const processedCollections: CollectionInfo[] = [];

  for (const subCollection of subCollections) {
    const blockIds =
      subCollection.result.reducerResults.collection_group_results.blockIds;
    const blocks = subCollection.recordMap.block;

    const matchingBlocks = blockIds
      .map((blockId: string | number) => blocks[blockId])
      .filter(Boolean);

    const collectionId = Object.keys(subCollection.recordMap.collection)[0];
    const collection = subCollection.recordMap.collection[collectionId].value;

    const collectionInfo: CollectionInfo = {
      id: collectionId,
      title: collection.name[0][0] || "Untitled",
      description: "",
      items: [],
    };

    for (const block of matchingBlocks) {
      if (block.value.type === "page") {
        const pageInfo: PageInfo = {
          id: block.value.id,
          title: block.value.properties?.title?.[0]?.[0] || "Untitled",
          description: block.value.properties?.["b<py"]?.[0]?.[0] || "",
          properties: block.value.properties || {},
        };
        collectionInfo.items.push(pageInfo);
      }
    }

    processedCollections.push(collectionInfo);
  }

  console.log(processedCollections);
  return processedCollections;
}

async function saveToFile(filePath: string, data: any) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function fetchPage(pageId: string): Promise<ExtendedRecordMap> {
  return await notion.getPage(pageId);
}
