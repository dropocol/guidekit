/*
  Warnings:

  - You are about to drop the column `lastVisited` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `visits` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `lastVisited` on the `Knowledgebase` table. All the data in the column will be lost.
  - You are about to drop the column `totalVisitors` on the `Knowledgebase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "lastVisited",
DROP COLUMN "visits";

-- AlterTable
ALTER TABLE "Knowledgebase" DROP COLUMN "lastVisited",
DROP COLUMN "totalVisitors";

-- CreateTable
CREATE TABLE "KnowledgebaseAnalytics" (
    "id" TEXT NOT NULL,
    "knowledgebaseId" TEXT NOT NULL,
    "totalVisitors" INTEGER NOT NULL DEFAULT 0,
    "lastVisited" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgebaseAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleAnalytics" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "lastVisited" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyVisit" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "knowledgebaseAnalyticsId" TEXT,
    "articleAnalyticsId" TEXT,

    CONSTRAINT "DailyVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgebaseAnalytics_knowledgebaseId_key" ON "KnowledgebaseAnalytics"("knowledgebaseId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleAnalytics_articleId_key" ON "ArticleAnalytics"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyVisit_date_knowledgebaseAnalyticsId_key" ON "DailyVisit"("date", "knowledgebaseAnalyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyVisit_date_articleAnalyticsId_key" ON "DailyVisit"("date", "articleAnalyticsId");

-- AddForeignKey
ALTER TABLE "DailyVisit" ADD CONSTRAINT "DailyVisit_knowledgebaseAnalyticsId_fkey" FOREIGN KEY ("knowledgebaseAnalyticsId") REFERENCES "KnowledgebaseAnalytics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyVisit" ADD CONSTRAINT "DailyVisit_articleAnalyticsId_fkey" FOREIGN KEY ("articleAnalyticsId") REFERENCES "ArticleAnalytics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
