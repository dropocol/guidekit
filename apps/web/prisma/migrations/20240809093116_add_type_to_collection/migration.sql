/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `suggested` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `properties` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subCollectionId` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Article` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `properties` to the `Collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Collection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Knowledgebase" DROP CONSTRAINT "Knowledgebase_userId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "categoryId",
DROP COLUMN "content",
DROP COLUMN "createdAt",
DROP COLUMN "published",
DROP COLUMN "suggested",
DROP COLUMN "updatedAt",
ADD COLUMN     "properties" JSONB NOT NULL,
ADD COLUMN     "recordMap" JSONB,
ADD COLUMN     "subCollectionId" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "properties" JSONB NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- DropTable
DROP TABLE "Category";

-- CreateTable
CREATE TABLE "SubCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "view_ids" TEXT[],
    "collection_id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,

    CONSTRAINT "SubCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubCollection_collectionId_idx" ON "SubCollection"("collectionId");

-- CreateIndex
CREATE INDEX "Article_subCollectionId_idx" ON "Article"("subCollectionId");

-- CreateIndex
CREATE INDEX "Knowledgebase_userId_idx" ON "Knowledgebase"("userId");

-- AddForeignKey
ALTER TABLE "Knowledgebase" ADD CONSTRAINT "Knowledgebase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCollection" ADD CONSTRAINT "SubCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_subCollectionId_fkey" FOREIGN KEY ("subCollectionId") REFERENCES "SubCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
