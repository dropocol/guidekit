/*
  Warnings:

  - You are about to drop the column `font` on the `Knowledgebase` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Knowledgebase" DROP COLUMN "font";

-- AlterTable
ALTER TABLE "User"
RENAME COLUMN "emailVerified" TO "emailVerifiedAt";

ALTER TABLE "User"
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;
