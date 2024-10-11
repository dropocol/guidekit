/*
  Warnings:

  - You are about to drop the column `notion_collection_id` on the `SubCollection` table. All the data in the column will be lost.
  - Added the required column `collection_id` to the `SubCollection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubCollection" DROP COLUMN "notion_collection_id",
ADD COLUMN     "collection_id" TEXT NOT NULL;
