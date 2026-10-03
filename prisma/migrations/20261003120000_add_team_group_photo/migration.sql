-- CreateTable
CREATE TABLE "TeamGroupPhoto" (
    "group" "TeamGroup" NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamGroupPhoto_pkey" PRIMARY KEY ("group")
);
