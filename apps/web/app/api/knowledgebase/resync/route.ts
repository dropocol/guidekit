import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getNotionData } from "@/lib/notion";
import { getSession } from "@/auth";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { REQUEST_SENDER } from "@/lib/serverUtils";
import { checkDemoMode } from "@/lib/serverUtils";

export async function POST(req: NextRequest) {
  const demoResponse = checkDemoMode(REQUEST_SENDER.CLIENT);
  if (demoResponse) return demoResponse;

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
          userId,
          knowledgebaseId: id,
        };

        let updatedCollection;
        if (existingCollection) {
          updatedCollection = await prisma.collection.update({
            where: { id: existingCollection.id },
            data: collectionData,
          });
        } else {
          updatedCollection = await prisma.collection.create({
            data: collectionData,
          });
        }

        // Process subcollections
        for (const subCollection of collection.subCollections || []) {
          const existingSubCollection = await prisma.subCollection.findFirst({
            where: {
              collectionId: updatedCollection.id,
              notion_collection_id: subCollection.notion_collection_id,
            },
          });

          console.log("\nSubCollection Name   :", subCollection.name);
          console.log("Existing SubCollection :", existingSubCollection);

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
            updatedSubCollection = await prisma.subCollection.update({
              where: { id: existingSubCollection.id },
              data: subCollectionData,
            });
          } else {
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

            const articleSlug = slugify(article.title);

            // Create the article first to get its PostgreSQL ID
            const articleData = {
              notion_id: article.id,
              title: article.title,
              slug: articleSlug, // Temporary slug
              description: article.description || "",
              properties: article.properties as Prisma.InputJsonValue,
              recordMap: JSON.stringify(article.recordMap),
              userId: userId,
              knowledgebaseId: id,
              subCollectionId: updatedSubCollection.id,
            };

            let updatedArticle;
            if (existingArticle) {
              updatedArticle = await prisma.article.update({
                where: { id: existingArticle.id },
                data: articleData,
              });
            } else {
              updatedArticle = await prisma.article.create({
                data: articleData,
              });
            }

            // Now create the full slug with the required structure
            const fullSlug = `${updatedCollection.slug}/${updatedCollection.id}/${articleSlug}/${updatedArticle.id}`;

            // Update the article with the full slug
            await prisma.article.update({
              where: { id: updatedArticle.id },
              data: { slug: fullSlug },
            });
          }

          // Handle subcollections deletion
          const notionSubCollections = collection.subCollections || [];
          const notionSubCollectionMap = new Map(
            notionSubCollections.map((sc) => [
              sc.notion_collection_id,
              sc.name,
            ]),
          );

          const existingSubCollections = await prisma.subCollection.findMany({
            where: { collectionId: updatedCollection.id },
            select: { id: true, name: true, notion_collection_id: true },
          });

          for (const subCollection of existingSubCollections) {
            const notionName = notionSubCollectionMap.get(
              subCollection.notion_collection_id!,
            );

            if (!notionName) {
              // Delete subcollection if it no longer exists in Notion
              await prisma.subCollection.delete({
                where: { id: subCollection.id },
              });
            } else if (notionName !== subCollection.name) {
              // Update subcollection name if it has changed in Notion
              await prisma.subCollection.update({
                where: { id: subCollection.id },
                data: { name: notionName },
              });
            }
          }
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
      }
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
