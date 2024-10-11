/*
  Warnings:

  - You are about to drop the column `notionId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `collection_id` on the `SubCollection` table. All the data in the column will be lost.
  - Added the required column `notion_collection_id` to the `SubCollection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "notionId",
ADD COLUMN     "notion_id" TEXT;

-- AlterTable
ALTER TABLE "SubCollection" DROP COLUMN "collection_id",
ADD COLUMN     "notion_collection_id" TEXT NOT NULL;
