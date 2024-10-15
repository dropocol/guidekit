/*
  Warnings:

  - You are about to drop the column `totalVisitors` on the `KnowledgebaseAnalytics` table. All the data in the column will be lost.
  - You are about to drop the `DailyVisit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DailyVisit" DROP CONSTRAINT "DailyVisit_articleAnalyticsId_fkey";

-- DropForeignKey
ALTER TABLE "DailyVisit" DROP CONSTRAINT "DailyVisit_knowledgebaseAnalyticsId_fkey";

-- DropForeignKey
ALTER TABLE "DailyVisit" DROP CONSTRAINT "DailyVisit_userId_fkey";

-- AlterTable
ALTER TABLE "KnowledgebaseAnalytics" DROP COLUMN "totalVisitors",
ADD COLUMN     "totalVisits" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "DailyVisit";

-- CreateTable
CREATE TABLE "DailyAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "knowledgebaseAnalyticsId" TEXT,
    "articleAnalyticsId" TEXT,

    CONSTRAINT "DailyAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyAnalytics_userId_idx" ON "DailyAnalytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAnalytics_date_knowledgebaseAnalyticsId_key" ON "DailyAnalytics"("date", "knowledgebaseAnalyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAnalytics_date_articleAnalyticsId_key" ON "DailyAnalytics"("date", "articleAnalyticsId");

-- AddForeignKey
ALTER TABLE "DailyAnalytics" ADD CONSTRAINT "DailyAnalytics_knowledgebaseAnalyticsId_fkey" FOREIGN KEY ("knowledgebaseAnalyticsId") REFERENCES "KnowledgebaseAnalytics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAnalytics" ADD CONSTRAINT "DailyAnalytics_articleAnalyticsId_fkey" FOREIGN KEY ("articleAnalyticsId") REFERENCES "ArticleAnalytics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAnalytics" ADD CONSTRAINT "DailyAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
