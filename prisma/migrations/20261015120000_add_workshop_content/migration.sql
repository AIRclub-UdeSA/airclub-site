-- CreateEnum
CREATE TYPE "WorkshopLevel" AS ENUM ('INICIAL', 'INTERMEDIO', 'AVANZADO');

-- CreateTable
CREATE TABLE "WorkshopTrack" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "label" TEXT,
    "summary" TEXT NOT NULL,
    "setupUrl" TEXT,
    "repoUrl" TEXT,
    "status" "TalkStatus" NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkshopTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopGuide" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "minutesMin" INTEGER NOT NULL,
    "minutesMax" INTEGER NOT NULL,
    "level" "WorkshopLevel" NOT NULL,
    "ros2Package" TEXT,
    "requires" TEXT[],
    "guideUrl" TEXT NOT NULL,
    "codeUrl" TEXT,
    "status" "TalkStatus" NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkshopGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopSession" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "dateLabel" TEXT,
    "location" TEXT,
    "instructor" TEXT,
    "recordingUrl" TEXT,
    "status" "TalkStatus" NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkshopSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopSessionMedia" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "TalkMediaType" NOT NULL,
    "src" TEXT NOT NULL,
    "poster" TEXT,
    "lightBg" BOOLEAN NOT NULL DEFAULT false,
    "objectFit" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkshopSessionMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopSessionSlide" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "openUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkshopSessionSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopSessionLink" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkshopSessionLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopTrack_key_key" ON "WorkshopTrack"("key");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopGuide_slug_key" ON "WorkshopGuide"("slug");

-- CreateIndex
CREATE INDEX "WorkshopGuide_trackId_idx" ON "WorkshopGuide"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopSession_slug_key" ON "WorkshopSession"("slug");

-- CreateIndex
CREATE INDEX "WorkshopSession_trackId_idx" ON "WorkshopSession"("trackId");

-- CreateIndex
CREATE INDEX "WorkshopSessionMedia_sessionId_idx" ON "WorkshopSessionMedia"("sessionId");

-- CreateIndex
CREATE INDEX "WorkshopSessionSlide_sessionId_idx" ON "WorkshopSessionSlide"("sessionId");

-- CreateIndex
CREATE INDEX "WorkshopSessionLink_sessionId_idx" ON "WorkshopSessionLink"("sessionId");

-- AddForeignKey
ALTER TABLE "WorkshopGuide" ADD CONSTRAINT "WorkshopGuide_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "WorkshopTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopSession" ADD CONSTRAINT "WorkshopSession_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "WorkshopTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopSessionMedia" ADD CONSTRAINT "WorkshopSessionMedia_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopSessionSlide" ADD CONSTRAINT "WorkshopSessionSlide_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopSessionLink" ADD CONSTRAINT "WorkshopSessionLink_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
