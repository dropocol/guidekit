/*
  Warnings:

  - Added the required column `userId` to the `ArticleAnalytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `KnowledgebaseAnalytics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArticleAnalytics" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "KnowledgebaseAnalytics" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ArticleAnalytics_userId_idx" ON "ArticleAnalytics"("userId");

-- CreateIndex
CREATE INDEX "KnowledgebaseAnalytics_userId_idx" ON "KnowledgebaseAnalytics"("userId");

-- AddForeignKey
ALTER TABLE "KnowledgebaseAnalytics" ADD CONSTRAINT "KnowledgebaseAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleAnalytics" ADD CONSTRAINT "ArticleAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
