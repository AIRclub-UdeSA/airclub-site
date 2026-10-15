-- CreateEnum
CREATE TYPE "TalkMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "Talk" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "speakerName" TEXT,
    "speakerRole" TEXT,
    "speakerAffiliation" TEXT,
    "speakerAvatar" TEXT,
    "speakerLinkedin" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "dateLabel" TEXT,
    "placeholder" TEXT,
    "location" TEXT,
    "topic" TEXT,
    "recordingUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalkMedia" (
    "id" TEXT NOT NULL,
    "talkId" TEXT NOT NULL,
    "type" "TalkMediaType" NOT NULL,
    "src" TEXT NOT NULL,
    "poster" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TalkMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalkSlide" (
    "id" TEXT NOT NULL,
    "talkId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "openUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TalkSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalkLink" (
    "id" TEXT NOT NULL,
    "talkId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TalkLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Talk_slug_key" ON "Talk"("slug");

-- CreateIndex
CREATE INDEX "TalkMedia_talkId_idx" ON "TalkMedia"("talkId");

-- CreateIndex
CREATE INDEX "TalkSlide_talkId_idx" ON "TalkSlide"("talkId");

-- CreateIndex
CREATE INDEX "TalkLink_talkId_idx" ON "TalkLink"("talkId");

-- AddForeignKey
ALTER TABLE "TalkMedia" ADD CONSTRAINT "TalkMedia_talkId_fkey" FOREIGN KEY ("talkId") REFERENCES "Talk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalkSlide" ADD CONSTRAINT "TalkSlide_talkId_fkey" FOREIGN KEY ("talkId") REFERENCES "Talk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalkLink" ADD CONSTRAINT "TalkLink_talkId_fkey" FOREIGN KEY ("talkId") REFERENCES "Talk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
