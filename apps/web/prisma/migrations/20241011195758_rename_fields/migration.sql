/*
  Warnings:

  - You are about to drop the column `view_ids` on the `SubCollection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SubCollection"
RENAME COLUMN "view_ids" TO "notion_view_ids";
