-- AlterTable
ALTER TABLE "Talk" ADD COLUMN "speakerBio" TEXT;

-- AlterTable
ALTER TABLE "TalkMedia" ADD COLUMN "lightBg" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "objectFit" TEXT;
