import { NotionAPI } from "notion-client";
import {
  CollectionInstance,
  Decoration,
  ExtendedRecordMap,
} from "notion-types";
import { promises as fs } from "fs";

const notion = new NotionAPI();

interface ItemProperties {
  title: Decoration[];
  [key: string]: Decoration[] | undefined;
}

export async function getNotionData(notionLink: string) {
  try {
    const url = new URL(notionLink);
    const pageId = url.pathname.split("-").pop();

    if (!pageId) {
      throw new Error("No page ID found in the URL");
    }

    const recordMap: ExtendedRecordMap = await notion.getPage(pageId);

    // save data in json file
    await fs.writeFile("notion.json", JSON.stringify(recordMap, null, 2));

    const pageBlock = Object.values(recordMap.block)[0].value;
    const title = pageBlock.properties?.title[0][0];

    // Find the Collections block
    const collectionsBlock = Object.values(recordMap.block).find(
      (block) => block.value.type === "collection_view" && block.value.view_ids,
    ) as { value: { collection_id: string } };

    if (!collectionsBlock) {
      throw new Error("Collections block not found");
    }

    const collectionId = collectionsBlock.value.collection_id;
    const collection = recordMap.collection[collectionId].value;

    // Get the pages (collections) within the Collections block
    const collectionPages = Object.values(recordMap.block).filter(
      (block) =>
        block.value.type === "page" && block.value.parent_id === collection.id,
    );

    const collections = collectionPages.map(async (page) => {
      const { id, properties, content } = page.value;

      // Extract items within the collection
      const collectionDataArray: CollectionInstance[] = [];
      const collectionItems = await Promise.all(
        (content || []).map(async (itemId) => {
          const item = recordMap.block[itemId]?.value as {
            view_ids: any;
            collection_id: string;
            content: any;
            id: any;
            properties: ItemProperties;
            type?: string;
          };
          if (item && item.type === "collection_view") {
            const collectionData = await notion.getCollectionData(
              item.collection_id,
              item.view_ids[0],
              {},
            );
            // console.log(item.collection_id);
            // console.log(item.view_ids[0]);

            collectionDataArray.push(collectionData);
            return collectionData;
          }
          return null;
        }),
      );

      await fs.writeFile(
        "notion-collection.json",
        JSON.stringify(collectionDataArray, null, 2),
      );

      return {
        id,
        title: properties?.title[0][0],
        description: properties?.["A^D`"]?.[0]?.[0] || "",
        content: content || [],
        items: collectionItems,
      };
    });

    // console.log(JSON.stringify(collections, null, 2));

    return {
      title,
      collections,
      recordMap,
    };
  } catch (error: any) {
    console.error("Error fetching Notion data:", error);
    return null;
  }
}
