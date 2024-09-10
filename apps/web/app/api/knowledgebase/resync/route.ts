import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getNotionData } from "@/lib/notion";
import { getSession } from "@/auth";
import { slugify } from "@/lib/utils";
import {
  CollectionWithSubCollections,
  SubCollection,
  SubCollectionArticle,
} from "@/lib/types";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  try {
    const knowledgebase = await prisma.knowledgebase.findUnique({
      where: { id },
      select: { notionLink: true, userId: true },
    });

    if (!knowledgebase || knowledgebase.userId !== session.user.id) {
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
      const existingCollections = await prisma.collection.findMany({
        where: { knowledgebaseId: id },
        include: { subCollections: { include: { articles: true } } },
      });

      for (const collection of knowledgebaseData.collections) {
        const existingCollection = existingCollections.find(
          (c) => c.name === collection.name,
        );

        if (existingCollection) {
          // Update existing collection
          await prisma.collection.update({
            where: { id: existingCollection.id },
            data: {
              pageIcon: collection.pageIcon,
              description: collection.description,
              type: collection.type,
              articleCount: collection.articleCount,
              properties: collection.properties as Prisma.InputJsonValue,
            },
          });
        } else {
          // Create new collection
          await prisma.collection.create({
            data: {
              name: collection.name,
              slug: slugify(collection.name),
              pageIcon: collection.pageIcon,
              description: collection.description,
              type: collection.type,
              articleCount: collection.articleCount,
              properties: collection.properties as Prisma.InputJsonValue,
              knowledgebase: { connect: { id } },
              user: { connect: { id: session.user!.id } },
            },
          });
        }

        // Process subcollections
        for (const subCollection of collection.subCollections || []) {
          const existingSubCollection = existingCollection?.subCollections.find(
            (sc) => sc.name === subCollection.name,
          );

          if (existingSubCollection) {
            // Update existing subcollection
            await prisma.subCollection.update({
              where: { id: existingSubCollection.id },
              data: {
                description: subCollection.description,
                type: subCollection.type,
                articleCount: subCollection.articleCount,
                view_ids: subCollection.view_ids,
                collection_id: subCollection.collection_id,
              },
            });
          } else {
            // Create new subcollection
            await prisma.subCollection.create({
              data: {
                name: subCollection.name,
                slug: slugify(subCollection.name),
                description: subCollection.description || "",
                type: subCollection.type,
                articleCount: subCollection.articleCount,
                view_ids: subCollection.view_ids,
                collection_id: subCollection.collection_id,
                collection: { connect: { id: existingCollection?.id } },
                user: { connect: { id: session.user!.id } },
              },
            });
          }

          // Process articles
          for (const article of subCollection.articles || []) {
            const existingArticle = existingSubCollection?.articles.find(
              (a) => a.id === article.id,
            );

            if (existingArticle) {
              // Update existing article
              await prisma.article.update({
                where: { id: existingArticle.id },
                data: {
                  title: article.title,
                  slug: slugify(article.title),
                  description: article.description || "",
                  properties: article.properties as Prisma.InputJsonValue,
                  recordMap: article.recordMap as Prisma.InputJsonValue,
                },
              });
            } else {
              // Create new article
              await prisma.article.create({
                data: {
                  id: article.id,
                  title: article.title,
                  slug: slugify(article.title),
                  description: article.description || "",
                  properties: article.properties as Prisma.InputJsonValue,
                  recordMap: article.recordMap as Prisma.InputJsonValue,
                  subCollection: { connect: { id: existingSubCollection?.id } },
                  knowledgebase: { connect: { id } },
                  user: { connect: { id: session.user!.id } },
                },
              });
            }
          }

          // Delete articles that no longer exist in Notion
          if (existingSubCollection) {
            const notionArticleIds =
              subCollection.articles?.map((a) => a.id) || [];
            await prisma.article.deleteMany({
              where: {
                subCollectionId: existingSubCollection.id,
                id: { notIn: notionArticleIds },
              },
            });
          }
        }

        // Delete subcollections that no longer exist in Notion
        if (existingCollection) {
          const notionSubCollectionNames =
            collection.subCollections?.map((sc) => sc.name) || [];
          await prisma.subCollection.deleteMany({
            where: {
              collectionId: existingCollection.id,
              name: { notIn: notionSubCollectionNames },
            },
          });
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
