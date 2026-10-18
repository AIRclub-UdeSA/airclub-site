-- CreateTable
CREATE TABLE "WorkshopCompletion" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "workshopSlug" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkshopCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkshopCompletion_email_idx" ON "WorkshopCompletion"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopCompletion_email_workshopSlug_key" ON "WorkshopCompletion"("email", "workshopSlug");
