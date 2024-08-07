import { NotionAPI } from "notion-client";
import { ExtendedRecordMap } from "notion-types";
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

async function getCollectionInfo(
  collectionId: string,
  viewId: string,
  recordMap: ExtendedRecordMap,
): Promise<CollectionInfo | null> {
  const collection = recordMap.collection[collectionId].value;

  //   console.log("collectionId", collectionId);
  //   const collectionView = Object.values(recordMap.collection_view).find(
  //     (view) => {
  //       console.log("Parent ID", view.value.parent_id);
  //       console.log("Collec ID", collectionId);
  //       console.log("View", view);
  //       return view.value.id === collectionId;
  //     },
  //   );

  //   console.log("collectionView", collectionView);

  //   if (!collectionView) {
  //     // throw new Error(`Collection view not found for collection ${collectionId}`);

  //     return null;
  //   }

  const collectionData = await notion.getCollectionData(
    collectionId,
    viewId,
    {},
  );

  //   console.log("collectionData", collectionData);

  //write in json file
  //   await fs.writeFileSync("collectionData.json", JSON.stringify(collectionData));

  const items: PageInfo[] = [];
  const subCollections: CollectionInfo[] = []; // Declare subCollections here
  for (const pageId of Object.keys(collectionData.recordMap.block)) {
    // if type is page
    if (collectionData.recordMap.block[pageId].value.type === "page") {
      const pageBlock = collectionData.recordMap.block[pageId].value;
      const pageInfo: PageInfo = {
        id: pageId,
        title: (pageBlock.properties?.title?.[0]?.[0] as string) || "",
        description:
          (pageBlock.properties as Record<string, any>)["A^D`"] || "",
        properties: pageBlock.properties || {},
      };

      console.log("pageInfo", pageInfo);
      items.push(pageInfo);
    }

    //write in json file
    await fs.writeFileSync("pageInfo.json", JSON.stringify(items));

    // Check for sub-collections
    //   if (pageBlock.content) {
    //     for (const blockId of pageBlock.content) {
    //       if (
    //         recordMap.block[blockId] &&
    //         recordMap.block[blockId].value.type === "collection_view"
    //       ) {
    //         const collectionId = recordMap.block[blockId].value.collection_id;
    //         const viewId = recordMap.block[blockId].value.id;
    //         if (collectionId) {
    //           const subCollection = await getCollectionInfo(
    //             collectionId,
    //             viewId,
    //             recordMap,
    //           );

    //           if (subCollection) {
    //             subCollections.push(subCollection);
    //           }
    //         }
    //       }
    //     }
    //   }
  }

  return {
    id: collectionId,
    title: collection.name[0][0],
    description: "", // Set to an empty string or a valid property
    // items,
    // subCollections,
    items: [],
    subCollections: [],
  };
}

export async function getNotionData(notionLink: string) {
  try {
    const pageId = new URL(notionLink).pathname.split("-").pop();
    if (!pageId) throw new Error("No page ID found in the URL");

    const recordMap: ExtendedRecordMap = await notion.getPage(pageId);

    // const collectionsBlock = Object.values(recordMap.block).find(
    //   (block) => block.value.type === "collection_view",
    //   // && // Check if collection_id is defined
    //   // recordMap.collection[block.value.collection_id]?.value.name[0][0] ===
    //   //   "Collections",
    // );

    const collectionsBlock = Object.values(recordMap.block).find((block) => {
      const isCollectionView = block.value.type === "collection_view";
      console.log("Checking block:", block.value.type); // Log the block being checked
      return isCollectionView;
    });

    console.log("collectionsBlock", collectionsBlock);

    if (!collectionsBlock) {
      throw new Error("Collections block not found");
    }

    let collectionInfo; // Declare collectionInfo here
    if (collectionsBlock.value.type === "collection_view") {
      const collectionId = collectionsBlock.value.collection_id;
      if (collectionId) {
        // Check if collectionId is defined
        collectionInfo = await getCollectionInfo(
          collectionId,
          collectionsBlock.value.view_ids[0],
          recordMap,
        ); // Assign value to collectionInfo
      }
    }

    console.log("collectionInfo", collectionInfo);

    return collectionInfo; // Now accessible here
  } catch (error: any) {
    console.error("Error fetching Notion data:", error);
    return null;
  }
}
