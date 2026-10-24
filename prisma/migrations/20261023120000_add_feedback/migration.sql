-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'CONTENIDO', 'IDEA', 'OTRO');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NUEVO', 'EN_CURSO', 'RESUELTO', 'DESCARTADO');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "message" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "viewport" TEXT,
    "userAgent" TEXT,
    "theme" TEXT,
    "accountEmail" TEXT,
    "email" TEXT,
    "ipHash" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NUEVO',
    "digestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_ipHash_createdAt_idx" ON "Feedback"("ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_status_createdAt_idx" ON "Feedback"("status", "createdAt");

