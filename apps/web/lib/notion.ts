import { NotionAPI } from "notion-client";
import { Block, ExtendedRecordMap, Role } from "notion-types";
import fs from "fs";

const notion = new NotionAPI();

interface CollectionInfo {
  id: string;
  title: string;
  description: string;
  items: PageInfo[];
  subCollections: CollectionInfo[];
}

interface PageInfo {
  id: string;
  title: string;
  description: string;
  properties: Record<string, any>;
}

type GKRole = "reader";

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
    const pageId = new URL(notionLink).pathname.split("-").pop();
    if (!pageId) throw new Error("No page ID found in the URL");

    // get the main page of knowledgebase
    const recordMap: ExtendedRecordMap = await notion.getPage(pageId);

    // write in json file
    // await fs.writeFileSync("json/recordMap.json", JSON.stringify(recordMap));

    // Get the main collection id from the first page named "Collections"
    const collectionBlockId = Object.keys(recordMap.collection)[0];

    // Get the first collection view id
    const collectionViewId = Object.keys(recordMap.collection_view)[0];

    const collectionPage = await notion.getCollectionData(
      collectionBlockId,
      collectionViewId,
      {},
    );

    // await fs.writeFileSync(
    //   "json/collectionPage.json",
    //   JSON.stringify(collectionPage),
    // );

    const collectionPageData: any = JSON.stringify(collectionPage);
    const blockIds =
      JSON.parse(collectionPageData).result.reducerResults
        .collection_group_results.blockIds;

    const blocks = collectionPage.recordMap.block;
    const resultArray: ResultArrayItem[] = [];
    for (const blockId in blocks) {
      const block = blocks[blockId];
      if (block.value.type === "page") {
        const subCollections = [];
        for (const subBlockId in blocks) {
          const subBlock = blocks[subBlockId];
          if (
            subBlock.value.type === "collection_view" &&
            subBlock.value.parent_id === blockId
          ) {
            subCollections.push(subBlock);
          }
        }

        const blockCopy: GKBlock = { ...block.value, subCollections };
        if (blockIds.includes(blockId)) {
          resultArray.push({ role: block.role, value: blockCopy });
        }
      }
    }

    // Reorder resultArray to match the order of blockIds
    const orderedResultArray = blockIds
      .map((blockId: string) => {
        return resultArray.find((block) => block.value.id === blockId);
      })
      .filter(Boolean);

    // Replace resultArray with orderedResultArray
    resultArray.length = 0;
    resultArray.push(...orderedResultArray);

    // write in json file
    // await fs.writeFileSync(
    //   "json/resultArray.json",
    //   JSON.stringify(orderedResultArray),
    // );

    // console.log("resultArray", resultArray);
    const subCollectionDataArray = [];

    const firstItem = resultArray[0];
    if (firstItem && firstItem.value.subCollections) {
      // const subCollection = firstItem.value;
      const { id, subCollections } = firstItem.value;

      for (const subCollection of subCollections) {
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
          console.log(
            `Data for sub-collection ${subCollectionId}:`,
            JSON.stringify(subCollectionData, null, 2),
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

    await fs.writeFileSync(
      "json/subCollectionDataArray.json",
      JSON.stringify(subCollectionDataArray),
    );
  } catch (error: any) {
    console.error("Error fetching Notion data:", error.message);
    return null;
  }
}
