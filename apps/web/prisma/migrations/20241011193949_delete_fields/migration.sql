/*
  Warnings:

  - You are about to drop the column `gh_username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropIndex
DROP INDEX "User_username_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "gh_username",
DROP COLUMN "username";

-- DropTable
DROP TABLE "Account";
