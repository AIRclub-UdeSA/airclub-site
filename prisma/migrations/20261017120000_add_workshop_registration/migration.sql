-- AlterTable
ALTER TABLE "WorkshopSession" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "registrationOpen" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WorkshopRegistration" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "markedAbsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkshopRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkshopRegistration_email_idx" ON "WorkshopRegistration"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopRegistration_sessionId_email_key" ON "WorkshopRegistration"("sessionId", "email");

-- AddForeignKey
ALTER TABLE "WorkshopRegistration" ADD CONSTRAINT "WorkshopRegistration_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
