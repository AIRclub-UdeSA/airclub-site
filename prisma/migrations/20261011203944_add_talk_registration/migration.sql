-- AlterTable
ALTER TABLE "Talk" ADD COLUMN     "registrationOpen" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TalkRegistration" (
    "id" TEXT NOT NULL,
    "talkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalkRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalkRegistration_talkId_idx" ON "TalkRegistration"("talkId");

-- CreateIndex
CREATE UNIQUE INDEX "TalkRegistration_talkId_email_key" ON "TalkRegistration"("talkId", "email");

-- AddForeignKey
ALTER TABLE "TalkRegistration" ADD CONSTRAINT "TalkRegistration_talkId_fkey" FOREIGN KEY ("talkId") REFERENCES "Talk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
