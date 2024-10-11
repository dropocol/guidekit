import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getNotionData } from "@/lib/notion";
import { getSession } from "@/auth";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import fs from "fs";
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await req.json();

  try {
    const knowledgebase = await prisma.knowledgebase.findUnique({
      where: { id },
      select: { notionLink: true, userId: true },
    });

    if (!knowledgebase || knowledgebase.userId !== userId) {
      return NextResponse.json(
        { error: "Knowledgebase not found" },
        { status: 404 },
      );
    }

    const knowledgebaseData = await getNotionData(knowledgebase.notionLink);

    if (knowledgebaseData instanceof Error) {
      return NextResponse.json(
        { error: knowledgebaseData.message },
        { status: 500 },
      );
    }

    // Update knowledgebase data
    await prisma.$transaction(async (prisma) => {
      // Update knowledgebase
      await prisma.knowledgebase.update({
        where: { id },
        data: { articleCount: knowledgebaseData.articleCount },
      });

      // Process collections
      for (const collection of knowledgebaseData.collections) {
        let existingCollection = await prisma.collection.findFirst({
          where: { knowledgebaseId: id, name: collection.name },
        });

        const collectionData = {
          name: collection.name,
          slug: slugify(collection.name),
          pageIcon: collection.pageIcon,
          description: collection.description,
          type: collection.type,
          articleCount: collection.articleCount,
          properties: collection.properties as Prisma.InputJsonValue,
          userId, // Use the userId we defined earlier
          knowledgebaseId: id,
        };

        let updatedCollection;
        if (existingCollection) {
          // Update existing collection
          updatedCollection = await prisma.collection.update({
            where: { id: existingCollection.id },
            data: collectionData,
          });
        } else {
          // Create new collection
          updatedCollection = await prisma.collection.create({
            data: collectionData,
          });
        }

        // Process subcollections
        for (const subCollection of collection.subCollections || []) {
          const existingSubCollection = await prisma.subCollection.findFirst({
            where: {
              collectionId: updatedCollection.id,
              name: subCollection.name,
              notion_collection_id: subCollection.notion_collection_id, // Add this line
            },
          });

          console.log("existingSubCollection", existingSubCollection);

          const subCollectionData = {
            name: subCollection.name,
            slug: slugify(subCollection.name),
            description: subCollection.description || "",
            type: subCollection.type,
            articleCount: subCollection.articleCount,
            notion_view_ids: subCollection.notion_view_ids,
            notion_collection_id: subCollection.notion_collection_id,
            userId: userId,
            collectionId: updatedCollection.id,
          };

          let updatedSubCollection;
          if (existingSubCollection) {
            // Update existing subcollection
            updatedSubCollection = await prisma.subCollection.update({
              where: { id: existingSubCollection.id },
              data: subCollectionData,
            });
          } else {
            // Create new subcollection

            updatedSubCollection = await prisma.subCollection.create({
              data: subCollectionData,
            });
          }

          // Process articles
          for (const article of subCollection.articles || []) {
            const existingArticle = await prisma.article.findFirst({
              where: {
                subCollectionId: updatedSubCollection.id,
                notion_id: article.id,
              },
            });

            const articleData = {
              notion_id: article.id,
              title: article.title,
              slug: slugify(article.title),
              description: article.description || "",
              properties: article.properties as Prisma.InputJsonValue,
              recordMap: article.recordMap as Prisma.InputJsonValue,
              userId: userId,
              knowledgebaseId: id,
              subCollectionId: updatedSubCollection.id,
            };

            if (existingArticle) {
              // Update existing article
              await prisma.article.update({
                where: { id: existingArticle.id },
                data: articleData,
              });
            } else {
              // Create new article
              await prisma.article.create({ data: articleData });
            }
          }

          // Delete articles that no longer exist in Notion
          if (existingSubCollection) {
            const notionArticleIds =
              subCollection.articles?.map((a) => a.id) || [];
            await prisma.article.deleteMany({
              where: {
                subCollectionId: existingSubCollection.id,
                notion_id: { notIn: notionArticleIds },
              },
            });
          }
        }

        // Delete subcollections that no longer exist in Notion
        const notionSubCollectionNames =
          collection.subCollections?.map((sc) => sc.name) || [];
        await prisma.subCollection.deleteMany({
          where: {
            collectionId: updatedCollection.id,
            name: { notIn: notionSubCollectionNames },
          },
        });
      }

      // Delete collections that no longer exist in Notion
      const notionCollectionNames = knowledgebaseData.collections.map(
        (c) => c.name,
      );
      await prisma.collection.deleteMany({
        where: {
          knowledgebaseId: id,
          name: { notIn: notionCollectionNames },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resyncing knowledgebase:", error);
    return NextResponse.json(
      { error: "Error resyncing knowledgebase" },
      { status: 500 },
    );
  }
}

async function saveToFile(filePath: string, data: any) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}
