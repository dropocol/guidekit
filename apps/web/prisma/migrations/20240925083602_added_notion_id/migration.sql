-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "notionId" TEXT,
ALTER COLUMN "image" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Knowledgebase" ALTER COLUMN "logo" DROP DEFAULT;
