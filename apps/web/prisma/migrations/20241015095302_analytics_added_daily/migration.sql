/*
  Warnings:

  - Added the required column `userId` to the `DailyVisit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyVisit" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "DailyVisit_userId_idx" ON "DailyVisit"("userId");

-- AddForeignKey
ALTER TABLE "DailyVisit" ADD CONSTRAINT "DailyVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
