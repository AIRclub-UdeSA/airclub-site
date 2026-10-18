-- AlterTable
ALTER TABLE "WorkshopGuide" ADD COLUMN     "content" JSONB,
ALTER COLUMN "guideUrl" DROP NOT NULL;
