-- AlterTable
ALTER TABLE "Knowledgebase" ALTER COLUMN "image" DROP DEFAULT,
ALTER COLUMN "imageBlurhash" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");
